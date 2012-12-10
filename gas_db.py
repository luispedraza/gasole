#!/usr/bin/env python
# -*- coding: utf-8 -*-

from google.appengine.ext import db
from google.appengine.api import memcache
from gas_update import *
import time
import logging
import unicodedata
import hashlib
import time
from gas_update import *

HEADERS = [u"Provincia", u"Localidad", u"Dirección", u"Precio", u"Rótulo", u"Horario", u"Mapa"]

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

def generate_kname(s):
	s = ''.join((c for c in unicodedata.normalize('NFD', unicode(s)) if unicodedata.category(c) != 'Mn'))
	#return hashlib.md5(re.sub("\W", "", s).lower()).hexdigest()
	return re.sub("\W", "", s).lower()

def generate_prov_kname(prov):
	return generate_kname(PROVS[prov].split("/")[0])

def generate_town_kname(prov):
	return generate_prov_kname(prov)

# No actualiza datos de combustible, puesto que sólos on para un tipo, y es
# más económico hacerlo con todos juntos (desde caché)
def data2store(data, location=False):
	provinces = {}
	towns = {}
	stations = {}
	for item in data:
		prov_kname = generate_kname(item[0].split("/")[0])
		town_kname = generate_kname(item[1])
		station_kname = generate_kname(item[1]+item[2])
		# buscamos la provincia:
		province = provinces.get(prov_kname)
		if not province:
			province = Province(
				key_name = prov_kname,
				name = item[0].title())
			provinces[prov_kname] = province
		# buscamos la ciudad:
		town = towns.get("town_kname")
		if not town:
			town = Town(
				key_name = town_kname,
				parent = province,
				name = item[1].title())
			towns[town_kname] = town
		# buscamos la estación:
		station = stations.get(station_kname)
		if not station:
			station = GasStation(
				key_name = station_kname,
				parent = town,
				address = item[2],
				label = item[5],
				hours = item[6])
			if location and item[-1]:
				lonlat = item[-1].split(",")
				station.geopt = db.GeoPt(lat=lonlat[1], lon=lonlat[0])
			stations[station_kname] = station
	logging.info("Almacenadas %s provincias, %s ciudades, %s estaciones" %(len(provinces), len(towns), len(stations)))
	entities = provinces.values()+towns.values()+stations.values()
	db.put(entities)

def store2data(prov, option):
	prov_kname = generate_prov_kname(prov)
	province = Province.get_by_key_name(prov_kname)
	q = GasStation.all().ancestor(province)
	#q = db.GqlQuery("SELECT * FROM GasStation WHERE ANCESTOR IS KEY('Province', :1)", prov_kname)
	data = []
	for station in q:
		geopt = None
		if station.geopt:
			geopt = ",".join(map(str,[station.geopt.lon, station.geopt.lat]))
		data.append([
			province.name,
			station.parent().name,
			station.address,
			1.0,
			station.label,
			station.hours,
			geopt])
	return Result(prov=prov, option=option, headers=HEADERS, data=data)

# convierte información obtenida de internet a estructura caché
def data2cache(data, update = False, location=False):
	prov_kname = generate_prov_kname(data.prov)
	cache = memcache.get(prov_kname)
	if not cache:
		cache = {}
		cache["name"] = PROVS[data.prov]
	towns = cache.get("towns")
	if not towns:
		cache["towns"] = {}
		towns = cache["towns"]
	for d in data.data:
		town_kname = generate_kname(d[1])
		town = towns.get(town_kname)
		if not town:
			towns[town_kname] = {}
			town = towns[town_kname]
			town["name"] = d[1]
			town["stations"] = {}
		station_kname = generate_kname(d[1]+d[2])
		station = town["stations"].get(station_kname)
		if not station:
			station = {}
			station["address"] = d[2]
			station["label"] = d[5]
			station["hours"] = d[6]
			if location:
				station["map"] = d[-1]
			station["options"] = dict.fromkeys(FUEL_OPTIONS, None)
			town["stations"][station_kname] = station
		# la lectura de precio:
		station["options"][data.option] = d[4]
	memcache.set(prov_kname, cache)

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
				location = True
			else:
				logging.info("Actualizando datos de Internet")
				data = gas_update_xls(option=option, prov=prov)
				location = False
			data2cache(data, location=location)
			data2store(data, location=location)
			return data
		else:
			logging.info("Actualizando desde la base de datos")
			data = store2data(prov=prov, option=option)
			return data
	else:
		return cache2data(prov, option)




