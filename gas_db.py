#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
from datetime import date as Date
from google.appengine.ext import db
from google.appengine.api import memcache
from gas_update import *
import logging
import os
from google.appengine.api.runtime import memory_usage

DEBUG = os.environ['SERVER_SOFTWARE'].startswith('Dev')
MEMCACHE_T = 18000 	# 5 horas

## Guarda los últimos datos en formato json
class ApiJson(db.Model):
	json = db.TextProperty(required=True)
## Guarda todos los datos en formato json
class ApiAllJson(db.Model):
	json = db.BlobProperty(required=True)
	date = db.DateTimeProperty(auto_now_add=True)
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
	closed = db.BooleanProperty()	# indica que la estación ya no opera
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
	content = db.TextProperty(required=True)
	date = db.DateTimeProperty(auto_now_add=True)
	replyto = db.IntegerProperty()

def getProvinceData(p):
	return json.loads(getProvinceJson(p))["_data"][p]

def getProvinceJson(p):
	jsondata = memcache.get(p)
	if jsondata:
		return jsondata
	model = ApiJson.get_by_key_name(p)
	if model:
		memcache.set(p, model.json)
		return model.json
	jsondata = json.dumps({"_data": store2data(prov_kname=p)})
	ApiJson(key_name=p, json=jsondata).put()
	memcache.set(p, jsondata)
	return jsondata

def getStationJson(p, t, s):
	skey = p+t+s
	jsondata = memcache.get(skey)
	if jsondata:
		return jsondata
	model = ApiJson.get_by_key_name(skey)
	if model:
		memcache.set(skey, model.json)
		return model.json
	data = getProvinceData(p)
	jsondata = json.dumps({"_data": {p: {t: {s: data[t][s]}}},
		"_history": get_history(p, t, s),
		"_comments" : get_comments(p, t, s)})
	ApiJson(key_name=skey, json=jsondata).put()
	memcache.set(skey, jsondata)
	return jsondata

# Obtiene todo en formato JSON
def getAll():
	alldata = memcache.get("All")
	if not alldata:
		alldata = ApiAllJson.all().order('-date').get().json
		memcache.set("All", alldata)
	return alldata

@db.transactional
def updateDB(dnew, dold):
	if len(dnew):
		db.put(dnew)
	if len(dold):
		db.delete(dold)

def data2store(data):
	for p in data: # recorremos las provincias
		_provinces = []		# nuevas provincias
		_towns = []			# nuevas ciudades
		_stations = []		# nuevas gasolineras
		_prices = []		# precios nuevos o actualizados
		_history = []		# nuevos históricos (tantos como _prices)
		_closed = []		# estaciones cerradas
		_del_prices = []	# precios actuales a borrar
		datap = data[p]
		cachep = getProvinceData(p)
		if not cachep: # nueva provincia
			cachep = {}
			_provinces.append(Province(key_name=p))
		for t in datap: # recorremos las ciudades
			datat = datap[t]
			cachet = cachep.get(t)
			if not cachet:	# nueva ciudad
				cachet = cachep[t] = {}
				_towns.append(Town(key_name=t, parent=db.Key.from_path('Province', p)))
			for s in datat: # recorremos las estaciones
				datas = datat[s]
				caches = cachet.get(s)
				update_price = False
				if not caches: # nueva estación
					_stations.append(GasStation(
						key_name = s,
						parent = db.Key.from_path('Province', p, 'Town', t),
						label = datas["l"],
						hours = datas["h"],
						closed = False))
					update_price = True
				else:
					geopt = caches.get("g")
					if geopt:
						datas["g"]=geopt
					if caches["d"]!=datas["d"]: # distinta fecha
						update_price = True
					del cachet[s]				# la borramos de cachep: detección de cerradas
				if update_price:
					parent_key = db.Key.from_path('Province', p, 'Town', t, 'GasStation', s)
					date = Date(*datas["d"])
					props = dict((FUEL_OPTIONS[o]["short"], datas["o"][o]) for o in datas["o"])
					_prices.append(PriceData(key_name=s, parent=parent_key, date=date, **props))
					_history.append(HistoryData(parent=parent_key, date=date, **props))
			if len(cachet)==0: 	# no quedan estaciones, para optimizar la búsqueda de cerradas
				del cachep[t]	# eliminamos la ciudad de cache
		# Estaciones cerradas, las que quedan en cachep:
		for t in cachep:
			for s in cachep[t]:
				caches = cachep[t][s]
				_closed.append(GasStation(
					key_name = s,
					parent = db.Key.from_path('Province', p, 'Town', t),
					label = caches["l"],
					hours = caches["h"],
					closed = True))
				_del_prices.append(db.Key.from_path('Province', p, 'Town', t, 'GasStation', s, 'PriceData', s))
		newdata = _provinces+_towns+_stations+_prices+_history+_closed
		if len(newdata):
			try:
				logging.info("==========Guardando datos de %s" %p)
				updateDB(dnew=newdata, dold=_del_prices)
				if len(_towns):
					logging.info("%s ciudades" %len(_towns))
				if len(_stations):
					logging.info("%s estaciones" %len(_stations))
				if len(_prices):
					logging.info("%s precios" %len(_prices))
				if len(_history):
					logging.info("%s históricos" %len(_history))
				if len(_closed):
					logging.info("%s estaciones CERRADAS" %len(_closed))
				if len(_del_prices):
					logging.info("%s precios BORRADOS" %len(_del_prices))
				json_data = json.dumps({"_data": {p: datap}})
				memcache.set(p, json_data)
				ApiJson(key_name=p, json=json_data).put()
				logging.info("Uso de memoria: %s" %memory_usage().current())
			except Exception, e:
				logging.error("***************No se han podido guardar los datos de %s" %p)
				logging.error(str(e))
		del newdata
	try:
		alldata = json.dumps(data).encode('zlib')
		memcache.set("All", alldata)
		ApiAllJson(json=alldata).put()
	except Exception, e:
		logging.error("No se ha podido guardar el Gzip")
	
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
		date = price.date
		result.add_item(
			province = price.key().parent().parent().parent().name(),
			town     = price.key().parent().parent().name(),
			station  = price.key().name(),
			label    = station.label,
			date     = [date.year, date.month, date.day],
			option   = prices,
			hours    = station.hours,
			latlon   = latlon)
	return result.data

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
	q = PriceData.get(keys)
	for price in q:
		prices = {FUEL_REVERSE[o]: getattr(price, o) for o in price.dynamic_properties()}
		station = price.parent()
		latlon = None
		if (station.geopt):
			latlon = [station.geopt.lat, station.geopt.lon]
		date = price.date
		near.add_item(
			province = price.key().parent().parent().parent().name(),
			town     = price.key().parent().parent().name(),
			station  = price.key().name(),
			label    = station.label,
			date     = [date.year, date.month, date.day],
			option   = prices,
			hours    = station.hours,
			latlon   = latlon)
	return near.data

def get_history(prov, town, station):
	result = []
	q = HistoryData.all().ancestor(db.Key.from_path('Province', prov, 'Town', town, 'GasStation', station)).order('date')
	for h in q:
		newdata = {k: getattr(h, k) for k in h.dynamic_properties()}
		newdata["d"] = h.date.isoformat()
		result.append(newdata)
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
			"content": c.content,
			"replyto": c.replyto,
			"id": c.key().id()})
	return result

# def mean_val(array):
# 	return sum(values)/len(values)

# precios medios de combustible por provincia
# def get_means(option):
# 	data = memcache.get("means_"+option)
# 	if not data:
# 		data = {}
# 		q = Province.all()
# 		for province in q:
# 			values = []
# 			p = province.key().name()
# 			datap = memcache.get(p) or store2data(prov_kname=p).get(p)
# 			for t in datap.keys():
# 				for s in datap[t].keys():
# 					station = datap[t][s]
# 					price = station["o"].get(option)
# 					if price:
# 						values.append(price)
# 			if len(values):
# 				data[p] = value = mean_val(values)
# 			else:
# 				data[p] = None
# 		memcache.set("means_"+option, data)
# 	return data

