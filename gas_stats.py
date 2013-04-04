#!/usr/bin/env python
# -*- coding: utf-8 -*-

from gas_db import *
from gas_update import ResultIter
import numpy as np

BINS = 20
GEOBINS = 120
def compute_stats():
	def init_stats():
		return {
			'min': 	{"p": {}, "s": {}}, # precios máximos y localizaciones
			'max': 	{"p": {}, "s": {}},	# precios mínimos y localizaciones
			'n':    {},					# número de puntos de venta de cada tipo
			'_p':   {},					# histograma de precios
			'_g':	{}, 				# histograma de lugares		
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
	def compute(where, the_range=None):
		if where.get('_g'):
			for o in where['_g']:
				arr_g = np.array(where['_g'][o])
				H, xedges, yedges = np.histogram2d(arr_g[:,0], arr_g[:,1], GEOBINS)
				del where['_g'][o]
				where['_g'][o] = {'h':H.tolist(), 'x':xedges.tolist(), 'y':yedges.tolist()}
		if where.get('_p'):
			for o in where['_p']:
				range = None
				if the_range:
					range = (the_range[0][o],the_range[1][o])
				arr_p = np.array(where['_p'][o])
				H, edges = np.histogram(arr_p, bins=BINS, range=range)
				del where['_p'][o]
				where['_p'][o] = {'h':H.tolist(),'m': np.mean(arr_p), 's': np.std(arr_p)}
				if not the_range: 
					 where['_p'][o]['x'] = edges.tolist()


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
	compute(stats)
	for p in stats['provinces']:
		# estadísticos de provincia:
		compute(stats['provinces'][p], the_range=[stats["min"]["p"], stats["max"]["p"]])
	
	return stats



