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

class GasStation(db.Expando):
	label = db.StringProperty(required=True)
	phone = db.PhoneNumberProperty()
	email = db.EmailProperty()
	geopt = db.GeoPtProperty()
	link = db.LinkProperty()	
	hours = db.StringProperty()
	created = db.DateTimeProperty(auto_now_add = True)

class PriceData(db.Model):
	updated = db.DateTimeProperty(auto_now = True)
	data = db.StringListProperty()

# No actualiza datos de combustible, puesto que sólos on para un tipo, y es
# más económico hacerlo con todos juntos (desde caché)
def data2store(data):
	provinces = {}
	towns = {}
	stations = {}
	for item in data:
		prov_kname = item[0]
		town_kname = item[1]
		station_kname = item[2]
		# buscamos la provincia:
		province = provinces.get(prov_kname)
		if not province:
			province = Province(key_name = prov_kname)
			provinces[prov_kname] = province
		# buscamos la ciudad:
		town = towns.get(town_kname)
		if not town:
			town = Town(key_name = town_kname,
						parent = province)
			towns[town_kname] = town
		# buscamos la estación:
		station = stations.get(station_kname)
		if not station:
			station = GasStation(
				key_name = station_kname,
				parent = town,
				label = item[5],
				hours = item[6])
			if item[-1]:
				lonlat = item[-1]
				station.geopt = db.GeoPt(lat=lonlat[0], lon=lonlat[1])
			stations[station_kname] = station
	logging.info("Almacenadas %s provincias, %s ciudades, %s estaciones" %(len(provinces), len(towns), len(stations)))
	entities = provinces.values()+towns.values()+stations.values()
	db.put(entities)

def store2data(prov_kname, option):
	province = Province.get_by_key_name(prov_kname)
	q = GasStation.all().ancestor(province)
	result = ResultIter(prov=prov, option=option)
	for station in q:
		geopt = None
		if station.geopt:
			geopt = ",".join(map(str,[station.geopt.lon, station.geopt.lat]))
		data.add_item(province=province.key().id_or_name(), 
			town=station.parent().key().id_or_name(),
			station=station.key().id_or_name(), 
			label=station.label, 
			option=option,
			hours=station.hours, 
			latlon=geopt)
	return result

# convierte información obtenida de internet a estructura caché
def data2cache(data):
	for prov_kname in data.data:
		cache = memcache.get(prov_kname) or {}
		c_result = ResultIter()
		c_result.data = cache





		d_prov = data.data[prov_kname]
		c_prov = memcache.get(prov_kname) or {}		
		for town_kname in d_prov:
			d_town = d_prov[town_kname]
			c_town = c_prov.get(town_kname)
			if not c_town:
				town = c_prov[town_kname] = {}			
			for station_kname in d_town:
				d_station = d_town[station_kname]
				c_station = c_town.get(station_kname)
				if not c_station:
					c_station = c_town[station_kname] = {}
					c_station["label"] = d_station["label"]
					c_station["hours"] = d_station["hours"]
					c_station["latlon"] = d_station["latlon"]
					c_station["options"] = {}
				c_station["options"].update(d_station["options"])
		memcache.set(prov_kname, c_prov)

def cache2data(prov, option):
	prov_kname = generate_prov_kname(prov)
	cache = memcache.get(prov_kname)
	if not cache:
		return
	logging.info("Obtenido cache para la provincia")
	data = []
	towns = cache["towns"]
	for town in towns.values():
		for station in town["stations"].values():
			data.append([
				cache["name"],
				town["name"],
				station["address"],
				station["options"][option],
				station["label"],
				station["hours"],
				station["map"]
				])
	return Result(prov=prov, option=option, headers=HEADERS, data=data)

def get_data(prov, option, update = False):
	# buscamos primero en cache:
	logging.info("Buscando datos en cache")
	prov_kname = generate_prov_kname(prov)
	cache = memcache.get(prov_kname)
	if cache is None or update:
		# buscamos en la base de datos
		logging.info("Buscando en la base de datos")
		province = Province.get_by_key_name(prov_kname)
		if province is None or update:
			# buscamos en la red
			if province is None:
				logging.info("Buscando datos en Internet")
				data = gas_update_search(option=option, prov=prov)
			else:
				logging.info("Actualizando datos de Internet")
				data = gas_update_xls(option=option, prov=prov)
			data2cache(data)
			data2store(data)
			return data
		else:
			logging.info("Actualizando desde la base de datos")
			data = store2data(prov=prov, option=option)
			return data
	else:
		return cache2data(prov, option)




