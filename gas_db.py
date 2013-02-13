#!/usr/bin/env python
# -*- coding: utf-8 -*-

from google.appengine.ext import db
from google.appengine.api import memcache
from gas_update import *
import logging

import os
DEBUG = os.environ['SERVER_SOFTWARE'].startswith('Dev')

## Modelo de provincia
class Province(db.Model):
	pass

class Town(db.Model):
	pass

class GasStation(db.Model):
	label = db.StringProperty(required=True)
	phone = db.PhoneNumberProperty()
	email = db.EmailProperty()
	link = db.LinkProperty()
	hours = db.StringProperty()

class GeoData(db.Model):
	geopt = db.GeoPtProperty()

class PriceData(db.Expando):
	date = db.DateProperty()

class HistoryData(db.Expando):
	date = db.DateProperty()

# No actualiza datos de combustible, puesto que sólos on para un tipo, y es
# más económico hacerlo con todos juntos (desde caché)
def data2store(data):
	_provinces = []
	_towns = []
	_stations = []
	_prices = []
	_history = []
	for p in data.keys(): # recorremos las provincias
		cachep = memcache.get(p) or store2data(prov_kname=p).get(p)
		if not cachep: 		# nueva provincia
			cachep = {}
			_provinces.append(Province(key_name=p))
		for t in data[p].keys(): # recorremos las ciudades
			if not cachep.has_key(t):	# nueva ciudad
				cachep[t] = {}
				_towns.append(Town(key_name=t, parent=db.Key.from_path('Province', p)))
			for s in data[p][t].keys(): # recorremos las estaciones
				update_price = False
				if not cachep[t].has_key(s): # nueva estación
					cachep[t][s] = data[p][t][s]
					_stations.append(GasStation(
						key_name = s,
						parent = db.Key.from_path('Province', p, 'Town', t),
						label = data[p][t][s]["label"],
						hours = data[p][t][s]["hours"]))
					update_price = True
				elif cachep[t][s]["date"]<data[p][t][s]["date"]:
					cachep[t][s]["options"].update(data[p][t][s]["options"])
					cachep[t][s]["date"] = data[p][t][s]["date"]
					update_price = True
				if update_price:
					parent_key = db.Key.from_path('Province', p, 'Town', t, 'GasStation', s)
					props = dict((FUEL_OPTIONS[o]["short"], cachep[t][s]["options"][o]) for o in cachep[t][s]["options"])
					_prices.append(PriceData(key_name = s, 
						parent = parent_key, 
						date=cachep[t][s]["date"], **props))
					_history.append(HistoryData(parent = parent_key,
						date=cachep[t][s]["date"], **props))
		memcache.set(p, cachep)
	if DEBUG:
		db.put(_provinces + _towns + _stations + _prices + _history)
	else:
		db.put_async(_provinces + _towns + _stations + _prices + _history)

	logging.info("Insertadas %s provincias" % len(_provinces))
	# for e in _provinces:
	# 	logging.info(e.key().name())
	logging.info("Insertadas %s ciudades" % len(_towns))
	# for e in _towns:
	# 	logging.info(e.key().name())
	logging.info("Insertadas %s estaciones" % len(_stations))
	# for e in _stations:
	# 	logging.info("%s, %s" %(e.key().name(), e.key().parent().name()))
	logging.info("Actualizados %s precios" % len(_prices))
	# for e in _prices:
	# 	logging.info("%s, %s, %s" %(e.date, e.key().parent().name(), e.key().parent().parent().name()))
	logging.info("Guardando %s históricos" % len(_history))

# obtenemos información de la base de datos
def store2data(option=None, prov_kname=None):
	q = PriceData.all()
	if prov_kname:
		q.ancestor(db.Key.from_path('Province', prov_kname))
	result = ResultIter()
	# option = sorted(FUEL_OPTIONS.keys())[1:]
	# _clean = []
	for price in q:
		prices = {}
		# for o in option:
		# 	prices[o] = getattr(price, FUEL_OPTIONS[o]["short"], None)
		for o in price.dynamic_properties():
			prices[FUEL_REVERSE[o]] = getattr(price, o)
		# 	if prices[FUEL_REVERSE[o]] == None:
		# 		delattr(price, o)
		# 		del(prices[FUEL_REVERSE[o]])
		# _clean.append(price)
		station = price.parent()
		result.add_item(
			province = price.key().parent().parent().parent().name(),
			town     = price.key().parent().parent().name(),
			station  = price.key().name(),
			label    = station.label,
			date     = price.date,
			option   = prices,
			hours    = station.hours)
	memcache.set(prov_kname, result.data.get(prov_kname))
	# db.put(_clean)
	return result.data

def get_latlon(prov, town=None, station=None):
	latlon_cache = memcache.get("latlon_" + prov) or {}
	if not latlon_cache:
		q = GeoData.all().ancestor(db.Key.from_path('Province', prov))
		for g in q:
			latlon_cache.setdefault(g.key().parent().name(), {})[g.key().name()] = [g.geopt.lat, g.geopt.lon]
		memcache.set("latlon_" + prov, latlon_cache)
	if station:
		return {prov: {town: {station: latlon_cache.get(town, {}).get(station)}}}
	elif town:
		return {prov: {town: latlon_cache.get(town)}}
	if latlon_cache:
		return {prov: latlon_cache}
	return {"error": "Datos no encontrados"}



# precios medios de combustible por provincia
def get_means(option):
	data = memcache.get("means_"+option)
	if not data:
		data = {}
		q = Province.all()
		for province in q:
			values = []
			p = province.key().name()
			datap = memcache.get(p) or store2data(prov_kname=p).get(p)
			for t in datap.keys():
				for s in datap[t].keys():
					station = datap[t][s]
					price = station["options"].get(option)
					if price:
						values.append(price)
			if len(values):
				data[p] = value = sum(values)/len(values)
			else:
				data[p] = None
		memcache.set("means_"+option, data)
	return data

