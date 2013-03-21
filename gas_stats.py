#!/usr/bin/env python
# -*- coding: utf-8 -*-

from gas_db import *
from gas_update import ResultIter
import numpy as np

def compute_stats():
	def init_stats():
		return {
			'min': 	{"p": {}, "s": {}}, # precios máximos y localizaciones
			'max': 	{"p": {}, "s": {}},	# precios mínimos y localizaciones
			'hist': {},					# histogramas de precios
			'n':    {},					# número de puntos de venta de cada tipo
			'_p':   {},					# temporal para histograma de precios
			'_g':	{}, 				# temporal para histograma de lugares		
			'g':    [-100,100,100,-100]}
	def init_all():
		val = init_stats()
		val['provinces'] = {}
		return val
	def init_province():
		return init_stats()
	def add_data(latlon, data, place, where):
		if latlon:
			if latlon[0]>where['g'][0]:
				where['g'][0] = latlon[0]
			if latlon[0]<where['g'][2]:
				where['g'][2] = latlon[0]
			if latlon[1]<where['g'][1]:
				where['g'][1] = latlon[1]
			if latlon[1]>where['g'][3]:
				where['g'][3] = latlon[1]
			for o in data:
				where['_g'].setdefault(o,[]).append(latlon)
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
			where['_p'].setdefault(o,[]).append(data[o])
	def compute(where):
		if where['_g']:
			for o in where['_g']:
				arr_g = np.array(where['_g'][o])
				H, xedges, yedges = np.histogram2d(arr_g[:,0], arr_g[:,1],normed=True)
				del where['_g'][o]
				where['_g'][o] = {'h':H.tolist(), 'x':xedges.tolist(), 'y':yedges.tolist()}
		if where['_p']:
			for o in where['_p']:
				arr_p = np.array(where['_p'][o])
				H, edges = np.histogram(arr_p)
				del where['_p'][o]
				where['_p'][o] = {'h':H.tolist(), 'x':edges.tolist()}


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
		# estadísticos de provincia:
		compute(statsp)
	compute(stats)
	return stats



