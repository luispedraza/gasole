#!/usr/bin/env python
# -*- coding: utf-8 -*-

from gas_db import *
from gas_update import ResultIter
import numpy as np

def compute_stats():
	def init_stats():
		return {
			'min': {"p": {}, "s": {}},
			'max': {"p": {}, "s": {}},
			'hist': (),
			'n':    {},
			'v':    [],
			'g':    {}}
	def init_all():
		val = init_stats()
		val['provinces'] = {}
		return val
	def init_province():
		return init_stats()
	def add_data(latlon, data, place, where):
		if latlon:
			if latlon[0]>where['g'].setdefault(0,-100.0):
				where['g'][0] = latlon[0]
			elif latlon[0]<where['g'].setdefault(2,100.0):
				where['g'][2] = latlon[0]
			if latlon[1]>where['g'].setdefault(1,-100.0):
				where['g'][1] = latlon[1]
			elif latlon[1]<where['g'].setdefault(3,100.0):
				where['g'][3] = latlon[1]
		for o in data:
			where["n"].setdefault(o, 0)
			where["n"][o]+=1
			if data[o] < where["min"]["p"].setdefault(o,100.0):
				where["min"]["p"][o] = data[o]
				where["min"]["s"][o] = [place]
			elif data[o] == where["min"]["p"][o]:
				where["min"]["s"][o].append(place)
			if data[o] > where["max"]["p"].setdefault(o,0.0):
				where["max"]["p"][o] = data[o]
				where["max"]["s"][o] = [place]
			elif data[o] == where["max"]["p"][o]:
				where["max"]["s"][o].append(place)

	q = Province.all()
	stats = init_all()
	for province in q:	# para todas las provincias
		p = province.key().name()
		datap = memcache.get(p) or store2data(prov_kname=p).get(p)
		statsp = stats['provinces'].setdefault(p, init_province())
		for t in datap: # para todas las ciudades
			datat = datap[t]
			for s in datat: # para todas las estaciones
				datas = datat[s]
				add_data(datas.get("latlon"),datas["options"],[p,t,s],statsp)
				add_data(datas.get("latlon"),datas["options"],[p,t,s],stats)
	return stats



