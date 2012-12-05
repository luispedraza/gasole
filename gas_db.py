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

## Modelo de provincia
class Province(db.Model):
	name = db.StringProperty(required=True)

class Town(db.Model):
	name = db.StringProperty(required=True)

class GasStation(db.Expando):
	address = db.PostalAddressProperty(required=True)
	phone = db.PhoneNumberProperty()
	email = db.EmailProperty()
	geopt = db.GeoPtProperty()
	link = db.LinkProperty()
	label = db.StringProperty(required=True)
	hours = db.StringProperty()

def get_fuel(option, prov, update=False):
	key = "-".join([option, prov])
	entries = memcache.get(key)
	if entries is None or update:
		logging.info("actualizando cache")
		timestamp = time.time()
		entries = gas_update_search(option=option, prov=prov)
		memcache.set(key, entries)
	return entries

def normalize_string(s):
	s = ''.join((c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn'))
	return hashlib.md5(re.sub("\W", "", s).lower()).hexdigest()

def gas_store_result(result, location=False):
	tini = time.time()
	provinces = {}
	towns = {}
	stations = {}
	for item in result["data"]:
		prov_kname = normalize_string(item[0])
		town_kname = normalize_string(item[0]+item[1])
		station_kname = normalize_string(item[0]+item[1]+item[2])
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
				label = item[6],
				hours = item[9])
			if location and item[-1]:
				lonlat = item[-1].split(",")
				station.geopt = db.GeoPt(lat=lonlat[1], lon=lonlat[0])
			stations[station_kname] = station
	db.put(provinces.values()+towns.values()+stations.values())
	logging.info("tiempo total: %s" %str(time.time()-tini))

# def gas_store_xls_result(result):
# 	d_provinces = {}
# 	for item in result["data"]:
# 		t = time.time()
# 		prov_kname = normalize_string(item[0])
# 		town_kname = normalize_string(item[0]+item[1])
# 		station_kname = normalize_string(item[0]+item[1]+item[2])
# 		# buscamos la provincia:
# 		if not d_provinces.has_key(prov_kname):
# 			d_provinces[prov_kname] = memcache.get(prov_kname)
# 			if not d_provinces[prov_kname]:
# 				logging.info("nueva provincia: %s" %item[0])
# 				province = Province(key_name = prov_kname,
# 					name = item[0].title())
# 				province.put()
# 				d_provinces[prov_kname] = {
# 					"keystr": str(province.key()),
# 					"towns": {}
# 				}

# 		the_province = db.Key(encoded = d_provinces[prov_kname]["keystr"])		
# 		# ya tenemos la provincia
# 		d_towns = d_provinces[prov_kname]["towns"]
# 		# buscamos la ciudad:
# 		if d_towns.has_key(town_kname):
# 			the_town = db.Key(encoded = d_towns[town_kname]["keystr"])
# 		else:
# 			the_town = Town(key_name = town_kname,
# 				name = item[1].title(), 
# 				province = the_province)
# 			the_town.put()
# 			d_towns[town_kname] = {
# 				"keystr": str(the_town.key()),
# 				"stations": {}
# 			}
# 		# ya tenemos la ciudad
# 		d_stations = d_towns[town_kname]["stations"]
# 		# buscamos la estación:
# 		if d_stations.has_key(station_kname):
# 			logging.info("tiempo: %s" %str(time.time()-t))
# 			continue
# 		else:
# 			the_station = GasStation(
# 				key_name = station_kname,
# 				province = the_province,
# 				town = the_town,
# 				address = item[2],
# 				label = item[6],
# 				hours = item[9],
# 				)
# 			the_station.put()
# 			d_stations[station_kname] = {
# 				"keystr": str(the_station.key()),
# 				"address": item[2]
# 			}
# 		logging.info("tiempo: %s" %str(time.time()-t))
# 	memcache.set_multi(d_provinces)


