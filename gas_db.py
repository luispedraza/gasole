#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
from datetime import date as Date, timedelta as Timedelta
from google.appengine.ext import db
from google.appengine.api import memcache
from gas_update import *
import logging
import os
from google.appengine.api.runtime import memory_usage
from time import time # para el timestamp

DEBUG = os.environ['SERVER_SOFTWARE'].startswith('Dev')

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

# def getStationJson(p, t, s):
# 	skey = p+t+s
# 	jsondata = memcache.get(skey)
# 	if jsondata:
# 		logging.info("Datos de gasolinera encontrados en memcache")
# 		return jsondata
# 	jsondata = json.dumps({
# 		"_history": get_history(p,t,s),
# 		"_comments" : get_comments(p,t,s)})
# 	memcache.set(skey, jsondata)
# 	return jsondata

# Obtiene todo en formato JSON
def getGasole(when=None):
	if when:
		alldata = ApiAllJson.all().filter('date <=', when).order('-date').get().json
	else:
		alldata = memcache.get("All")
		if not alldata:
			alldata = ApiAllJson.all().order('-date').get().json
			memcache.set("All", alldata)
	return alldata

@db.transactional
def updateDB(dnew, dold=None):
	if len(dnew):
		db.put(dnew)
	if dold and len(dold):
		db.delete(dold)

def data2store(data):
	if not data:
		logging.info("NO HAY DATOS QUE GAURDAR")
		return
	cachedata = json.loads(getGasole().decode('zlib'))
	if "_meta" in cachedata:		# compatibilidad con la api antigua
		cachedata = cachedata.get("_data")

	for p in data: # recorremos las provincias
		_provinces = []		# nuevas provincias
		_towns = []			# nuevas ciudades
		_stations = []		# nuevas gasolineras
		# _prices = []		# precios nuevos o actualizados
		_history = []		# nuevos históricos (tantos como _prices)
		_closed = []		# estaciones cerradas
		# _del_prices = []	# precios actuales a borrar
		datap = data.get(p)
		cachep = cachedata.get(p)
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
					# _prices.append(PriceData(key_name=s, parent=parent_key, date=date, **props))
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
				# _del_prices.append(db.Key.from_path('Province', p, 'Town', t, 'GasStation', s, 'PriceData', s))
		newdata = _provinces+_towns+_stations+_history+_closed #+_prices
		if len(newdata):
			try:
				logging.info("==========Guardando datos de %s" %p)
				if len(_towns):
					logging.info("%s nuevas ciudades" %len(_towns))
				if len(_stations):
					logging.info("%s nuevas estaciones" %len(_stations))
				# if len(_prices):
				# 	logging.info("%s nuevos precios" %len(_prices))
				if len(_history):
					logging.info("%s históricos" %len(_history))
				if len(_closed):
					logging.info("%s estaciones CERRADAS" %len(_closed))
				# if len(_del_prices):
				# 	logging.info("%s precios BORRADOS" %len(_del_prices))
				updateDB(dnew=newdata)
				json_data = json.dumps({"_data": {p: datap}})
				ApiJson(key_name=p, json=json_data).put()
				logging.info("Uso de memoria: %s" %memory_usage().current())
			except Exception, e:
				logging.error("*************** No se han podido guardar los datos de %s" %p)
				logging.error(str(e))
				return
		del newdata
	try:
		ts = int(time()*1000)
		alldata = json.dumps({"_meta":{"ts":ts}, "_data":data}).encode('zlib')
		updateDB(dnew=[ApiAllJson(json=alldata)])
		memcache.set("All", alldata)
	except Exception, e:
		logging.error("No se ha podido guardar el Gzip")
		logging.error(str(e))
	
# obtenemos información de la base de datos
# def store2data(option=None, prov_kname=None):
# 	q = PriceData.all()
# 	if prov_kname:
# 		q.ancestor(db.Key.from_path('Province', prov_kname))
# 	result = ResultIter()
# 	for price in q:
# 		prices = {FUEL_REVERSE[o]: getattr(price, o) for o in price.dynamic_properties()}
# 		station = price.parent()
# 		latlon = None
# 		if (station.geopt):
# 			latlon = [station.geopt.lat, station.geopt.lon]
# 		date = price.date
# 		result.add_item(
# 			province = price.key().parent().parent().parent().name(),
# 			town     = price.key().parent().parent().name(),
# 			station  = price.key().name(),
# 			label    = station.label,
# 			date     = [date.year, date.month, date.day],
# 			option   = prices,
# 			hours    = station.hours,
# 			latlon   = latlon)
# 	return result.data

# def get_near(lat, lon, dist):
# 	near = ResultIter()
# 	# http://www.csgnetwork.com/degreelenllavcalc.html
# 	dlat = dist/111.03461
# 	dlon = dist/85.39383
# 	ne = db.GeoPt(lat=lat+dlat, lon=lon+dlon)
# 	sw = db.GeoPt(lat=lat-dlat, lon=lon-dlon)
# 	q = GasStation.all().filter('geopt >', sw).filter('geopt <', ne)
# 	keys = []
# 	for g in q:
# 		if abs(g.geopt.lon-lon) < dlon:
# 			keys.append(db.Key.from_path('PriceData', g.key().name(), parent=g.key()))
# 	q = PriceData.get(keys)
# 	for price in q:
# 		prices = {FUEL_REVERSE[o]: getattr(price, o) for o in price.dynamic_properties()}
# 		station = price.parent()
# 		latlon = None
# 		if (station.geopt):
# 			latlon = [station.geopt.lat, station.geopt.lon]
# 		date = price.date
# 		near.add_item(
# 			province = price.key().parent().parent().parent().name(),
# 			town     = price.key().parent().parent().name(),
# 			station  = price.key().name(),
# 			label    = station.label,
# 			date     = [date.year, date.month, date.day],
# 			option   = prices,
# 			hours    = station.hours,
# 			latlon   = latlon)
# 	return near.data

def get_history(p, t, s, days=30):
	key="history-"+p+t+s
	dbKey = db.Key.from_path('Province', p, 'Town', t, 'GasStation', s)
	cachehistory = memcache.get(key)
	if cachehistory:	# está en cache, ¿está actualizada?
		cache_date = cachehistory["date"]
		update_date = db.Query(HistoryData, projection=['date']).ancestor(dbKey).order('-date').get().date
		if cache_date==update_date:
			logging.info("encontrados en cache")
			return cachehistory["history"]
	logging.info("buscando en db")
	allhistory = []
	when = Date.today()-Timedelta(days)		# desde qué día pedir datos
	q = HistoryData.all().ancestor(dbKey).filter('date >=', when).order('date')
	date=None
	for h in q:
		date = h.date
		newdata = {k: getattr(h, k) for k in h.dynamic_properties()}
		newdata["d"] = date.isoformat()
		allhistory.append(newdata)
	memcache.set(key,{"date":date,"history":allhistory})
	return allhistory

# esta solución requiere borrar memcache al actualizar los datos, puesto que no se hacen comprobaciones
# def get_history(p, t, s, days=30):
# 	key="history-"+p+t+s
# 	dbKey = db.Key.from_path('Province', p, 'Town', t, 'GasStation', s)
# 	cachehistory = memcache.get(key)
# 	if cachehistory:	# está en cache, ¿está actualizada?
# 		logging.info("encontrada en cache")
# 		return cachehistory
# 	allhistory = []
# 	when = Date.today()-Timedelta(days)		# desde qué día pedir datos
# 	q = HistoryData.all().ancestor(dbKey).filter('date >=', when).order('date')
# 	for h in q:
# 		newdata = {k: getattr(h, k) for k in h.dynamic_properties()}
# 		newdata["d"] = h.date.isoformat()
# 		allhistory.append(newdata)
# 	memcache.set(key,allhistory)
# 	return allhistory

# función auxiliar para formatear un comentario
def format_comment(c):
	return {"date": c.date.isoformat(),
			"name": c.name,
			"avatar": c.avatar,
			"link": c.link or "",
			"points": c.points,
			"content": c.content,
			"replyto": c.replyto,
			"id": c.key().id()}

# obtiene todos los comentarios de una estación
def get_comments(p, t, s):
	key="comments-"+p+t+s
	allcomments = memcache.get(key)
	if not allcomments:
		allcomments = []
		q = Comment.all().ancestor(db.Key.from_path('Province', p, 'Town', t, 'GasStation', s)).order('date')
		for c in q:
			allcomments.append(format_comment(c))
		memcache.set(key,allcomments)
	return allcomments

# inserta un nuevo comentario de una gasolinera
def add_comment(p, t, s, user, points, content, replyto):
	key="comments-"+p+t+s
	comment = Comment(
		userid=user.key.id(),
		name=user.name,
		avatar=db.Link(user.avatar_url),
		link=user.link,
		points=db.Rating(points) if points!=None else None,
		content=db.Text(content),
		replyto=int(replyto) if replyto else None,
		parent=db.Key.from_path('Province',p,'Town',t,'GasStation',s))
	try:
		comment.put()
		allcomments = get_comments(p,t,s)
		allcomments.append(format_comment(comment))
		memcache.set(key,allcomments)
		return True
	except:
		return False

