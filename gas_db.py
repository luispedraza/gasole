#!/usr/bin/env python
# -*- coding: utf-8 -*-

from google.appengine.ext import db
from google.appengine.api import memcache
from gas_update import *
import logging
from math import fabs
from webapp2_extras.appengine.auth.models import User
import os
DEBUG = os.environ['SERVER_SOFTWARE'].startswith('Dev')

## Modelo de provincia
class Province(db.Model):
	pass
## Modelo de ciudad
class Town(db.Model):
	pass
## Modelo de gasolinera
class GasStation(db.Model):
	label = db.StringProperty()
	phone = db.PhoneNumberProperty()
	email = db.EmailProperty()
	link = db.LinkProperty()
	hours = db.StringProperty()
	geopt = db.GeoPtProperty()
	date = db.DateTimeProperty(auto_now_add=True)
## Modelo de precios
class PriceData(db.Expando):
	date = db.DateProperty()
## Modelo de histórico de precios
class HistoryData(db.Expando):
	date = db.DateProperty()
## Modelo de comentario
class Comment(db.Model):
	userid = db.IntegerProperty(required=True)
	name = db.StringProperty(required=True)
	link = db.StringProperty()
	avatar = db.LinkProperty()
	points = db.RatingProperty()
	title = db.StringProperty()
	content = db.TextProperty(required=True)
	date = db.DateTimeProperty(auto_now_add=True)
	replyto = db.IntegerProperty()
	# def get_author(self):
	# 	return User.get_by_auth_id(self.userid)

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
	# if DEBUG:
	# 	logging.info("Guardando en modo debug: put")
	# 	db.put(_provinces + _towns + _stations + _prices + _history)
	# else:
	# 	logging.info("Guardando en modo release: put_async")
	# 	put_future = db.put_async(_provinces + _towns + _stations + _prices + _history)
	# 	put_result = put_future.get_result()
	# 	logging.info(put_result.content)
	db.put(_provinces + _towns + _stations + _prices + _history)
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
	for price in q:
		prices = {FUEL_REVERSE[o]: getattr(price, o) for o in price.dynamic_properties()}
		station = price.parent()
		latlon = None
		if (station.geopt):
			latlon = [station.geopt.lat, station.geopt.lon]
		result.add_item(
			province = price.key().parent().parent().parent().name(),
			town     = price.key().parent().parent().name(),
			station  = price.key().name(),
			label    = station.label,
			date     = price.date,
			option   = prices,
			hours    = station.hours,
			latlon   = latlon)
	memcache.set(prov_kname, result.data.get(prov_kname))
	return result.data

# def get_latlon(prov, town=None, station=None):
# 	latlon_cache = memcache.get("latlon_" + prov) or {}
# 	if not latlon_cache:
# 		q = GeoData.all().ancestor(db.Key.from_path('Province', prov))
# 		for g in q:
# 			latlon_cache.setdefault(g.key().parent().name(), {})[g.key().name()] = [g.geopt.lat, g.geopt.lon]
# 		memcache.set("latlon_" + prov, latlon_cache)
# 	if station:
# 		return {prov: {town: {station: latlon_cache.get(town, {}).get(station)}}}
# 	elif town:
# 		return {prov: {town: latlon_cache.get(town)}}
# 	if latlon_cache:
# 		return {prov: latlon_cache}
# 	return {"error": "Datos no encontrados"}

def get_near(lat, lon, dist):
	near = ResultIter()
	# http://www.csgnetwork.com/degreelenllavcalc.html
	dlat = dist/111.03461
	dlon = dist/85.39383
	ne = db.GeoPt(lat=lat+dlat, lon=lon+dlon)
	sw = db.GeoPt(lat=lat-dlat, lon=lon-dlon)
	q = GasStation.all().filter('geopt >', sw).filter('geopt <', ne)
	keys = []
	for g in q:
		if abs(g.geopt.lon-lon) < dlon:
			keys.append(db.Key.from_path('PriceData', g.key().name(), parent=g.key()))
			# logging.info(db.Key.from_path('GasStation', g.key().name(), parent=g.key()))
	q = PriceData.get(keys)
	for price in q:
		prices = {FUEL_REVERSE[o]: getattr(price, o) for o in price.dynamic_properties()}
		station = price.parent()
		latlon = None
		if (station.geopt):
			latlon = [station.geopt.lat, station.geopt.lon]
		near.add_item(
			province = price.key().parent().parent().parent().name(),
			town     = price.key().parent().parent().name(),
			station  = price.key().name(),
			label    = station.label,
			date     = price.date,
			option   = prices,
			hours    = station.hours,
			latlon   = latlon)
	return near.data

def get_history(prov, town, station):
	result = {}
	q = HistoryData.all().ancestor(db.Key.from_path('Province', prov, 'Town', town, 'GasStation', station)).order('date')
	for h in q:
		result[h.date.isoformat()] = {k: getattr(h, k) for k in h.dynamic_properties()}
	return result

def get_comments(prov, town, station):
	result = []
	q = Comment.all().ancestor(db.Key.from_path('Province', prov, 'Town', town, 'GasStation', station)).order('date')
	for c in q:
		result.append({
			"date": c.date.isoformat(),
			"name": c.name,
			"avatar": c.avatar,
			"link": c.link or "",
			"points": c.points,
			"title": c.title, 
			"content": c.content,
			"replyto": c.replyto,
			"id": c.key().id()})
	return result

# def compute_stats():
# 	data_stats = memcache.get("stats")
# 	if not data_stats:
# 		data_stats = {}
# 		q = Province.all()
# 		for province in q:
# 			p = province.key().name()
# 			datap = memcache.get(o) or store2data(prov_kname=p).gete(p)
# 			opationsp = {}
# 			for t in datap.keys():
# 				for s in datap[t].keys():
# 					station = datap[t][s]
# 					price = station["options"].get(option)
# 					if price:
# 						opationsp[o].append(getattr(station.options, o)) for o in station.options

def mean_val(array):
	return sum(values)/len(values)

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
				data[p] = value = mean_val(values)
			else:
				data[p] = None
		memcache.set("means_"+option, data)
	return data

