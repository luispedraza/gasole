#!/usr/bin/env python
# -*- coding: utf-8 -*-

from google.appengine.ext import db
from google.appengine.api import memcache
from gas_update import *
import logging

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
	data = data.data
	provinces = {}	# provincias a ser almacenadas
	towns = {}		# ciudades a ser almacenadas
	stations = {}	# estaciones a ser almacenadas
	geodata = []	# localizaciones a ser almacenadas
	prices = []		# precios a ser almacenados
	# recorremos las provincias
	for p in data.keys():
		cache = memcache.get(p) or store2data(prov_kname=p).data
		datap = data[p]
		if not cache and not provinces.get(p):
			province = Province(key_name = p)
			provinces[p] = province
		# recorremos las ciudades
		for t in datap.keys():
			datat = datap[t]
			town = towns.get(t)
			if not cache.has_key(t) and not town:
				town = Town(key_name = t,
					parent = db.Key.from_path('Province', p))
				towns[t] = town
			# recorremos las estaciones
			for s in datat.keys():
				datas = datat[s]
				station = stations.get(s)
				if (not cache.has_key(t) or not cache[t].has_key(s)) and not station:
					station = GasStation(
						key_name = s,
						parent = db.Key.from_path('Province', p, 'Town', t),
						label = datas["label"],
						hours = datas["hours"])
					# if datas["latlon"]:
					# 	lonlat = GeoData(parent = station)
					# 	lonlat.geopt = db.GeoPt(lat=item[-1][0], lon=item[-1][1])
					# 	geodata.append(lonlat)
					stations[s] = station
					#actualización del precio
					price = PriceData.get_or_insert("None",
						parent = db.Key.from_path('Province', p, 'Town', t, 'Station', s))
					for o in datas["options"]:
						setattr(price, FUEL_OPTIONS[o]["short"], datas["options"][o])
					price.date = datas["date"]
					prices.append(price)
					
	entities = provinces.values()+towns.values()+stations.values()+geodata+prices
	db.put(entities)
	logging.info("Almacenadas %s provincias" %(len(provinces)))
	logging.info("Almacenadas %s ciudades" %(len(towns)))
	logging.info("Almacenadas %s estaciones" %(len(stations)))
	logging.info("Almacenadas %s posiciones" %(len(geodata)))
	logging.info("Almacenados %s precios" %(len(prices)))
	for p in data:
		memcache.set(p, data[p])

# obtenemos información de la base de datos
def store2data(option=None, prov_kname=None):
	q = PriceData.all()
	if prov_kname:
		q.ancestor(db.Key.from_path('Province', prov_kname))
	result = ResultIter()
	option = sorted(FUEL_OPTIONS.keys())[1:]
	for price in q:
		prices = {}
		for o in option:
			prices[o] = getattr(price, FUEL_OPTIONS[o]["short"], None)
		station = price.parent()
		result.add_item(
			province = price.key().parent().parent().parent().id_or_name(),
			town     = price.key().parent().parent().id_or_name(),
			station  = price.key().parent().id_or_name(), 
			label    = station.label, 
			date     = price.date,
			option   = prices,
			hours    = station.hours, 
			latlon   = None)
	for p in result.data:
		memcache.set(p, result.data[p])
	return result

# # convierte información obtenida de internet a estructura caché
# def data2cache(data):
# 	for prov_kname in data.data:
# 		cache = memcache.get(prov_kname) or {}
# 		c_result = ResultIter()
# 		c_result.data = cache


# 		d_prov = data.data[prov_kname]
# 		c_prov = memcache.get(prov_kname) or {}		
# 		for town_kname in d_prov:
# 			d_town = d_prov[town_kname]
# 			c_town = c_prov.get(town_kname)
# 			if not c_town:
# 				town = c_prov[town_kname] = {}			
# 			for station_kname in d_town:
# 				d_station = d_town[station_kname]
# 				c_station = c_town.get(station_kname)
# 				if not c_station:
# 					c_station = c_town[station_kname] = {}
# 					c_station["label"] = d_station["label"]
# 					c_station["hours"] = d_station["hours"]
# 					c_station["latlon"] = d_station["latlon"]
# 					c_station["options"] = {}
# 				c_station["options"].update(d_station["options"])
# 		memcache.set(prov_kname, c_prov)

# def cache2data(prov, option):
# 	prov_kname = generate_prov_kname(prov)
# 	cache = memcache.get(prov_kname)
# 	if not cache:
# 		return
# 	logging.info("Obtenido cache para la provincia")
# 	data = []
# 	towns = cache["towns"]
# 	for town in towns.values():
# 		for station in town["stations"].values():
# 			data.append([
# 				cache["name"],
# 				town["name"],
# 				station["address"],
# 				station["options"][option],
# 				station["label"],
# 				station["hours"],
# 				station["map"]
# 				])
# 	return Result(headers=HEADERS, data=data)

# def get_data(prov, option, update = False):
# 	# buscamos primero en cache:
# 	logging.info("Buscando datos en cache")
# 	prov_kname = generate_prov_kname(prov)
# 	cache = memcache.get(prov_kname)
# 	if cache is None or update:
# 		# buscamos en la base de datos
# 		logging.info("Buscando en la base de datos")
# 		province = Province.get_by_key_name(prov_kname)
# 		if province is None or update:
# 			# buscamos en la red
# 			if province is None:
# 				logging.info("Buscando datos en Internet")
# 				data = gas_update_search(option=option, prov=prov)
# 			else:
# 				logging.info("Actualizando datos de Internet")
# 				data = gas_update_xls(option=option, prov=prov)
# 			data2cache(data)
# 			data2store(data)
# 			return data
# 		else:
# 			logging.info("Actualizando desde la base de datos")
# 			data = store2data(prov=prov, option=option)
# 			return data
# 	else:
# 		return cache2data(prov, option)




