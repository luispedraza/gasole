#!/usr/bin/env python
# -*- coding: utf-8 -*-

# Web del ministerio de Industria, Energía y Turismo
# ARCHIVOS CSV:
# gasolina 95: 			http://geoportal.mityc.es/hidrocarburos/files/eess_G95_ddmmaaaa.zip
# gasolina 98: 			http://geoportal.mityc.es/hidrocarburos/files/eess_G98_ddmmaaaa.zip
# gasoleo automocion: 	http://geoportal.mityc.es/hidrocarburos/files/eess_GOA_ddmmaaaa.zip
# nuevo gasoleo A: 		http://geoportal.mityc.es/hidrocarburos/files/eess_NGO_ddmmaaaa.zip
# biodiesel: 			http://geoportal.mityc.es/hidrocarburos/files/eess_BIOD_ddmmaaaa.zip
# ARCHIVOS EXCEL:
# http://geoportal.mityc.es/hidrocarburos/eess/searchTotal.do?tipoCons=1&tipoBusqueda=0&tipoCarburante=1&textoCarburante=Gasolina%2095
import urllib2
import urllib
from urllib2 import HTTPError
import zipfile
import os
import time
import StringIO
from datetime import date
from bs4 import BeautifulSoup
import re

FUEL_OPTIONS = {"1": (u"G95", u"Gasolina 95"),
	"2": (u"G97", u"Gasolina 97"), 
	"3": (u"G98", u"Gasolina 98"),
	"4": (u"GOA", u"Gasóleo Automoción"),
	"5": (u"NGO", u"Nuevo Gasóleo A"), 
	"6": (u"GOB", u"Gasóleo B"),
	"7": (u"GOC", u"Gasóleo C"),
	"8": (u"BIOD", u"Biodiésel")}
URL_CSV = 'http://geoportal.mityc.es/hidrocarburos/files/'
URL_XLS = 'http://geoportal.mityc.es/hidrocarburos/eess/searchTotal.do?tipoCons=1&tipoBusqueda=0&tipoCarburante='
URL_SEARCH = 'http://geoportal.mityc.es/hidrocarburos/eess/searchAddress.do'
def gas_update_csv(option=u"G95"):
	# file path:
	d = date.today()
	zipFileName = 'eess_'+option+'_'+str(d.day)+str(d.month)+str(d.year)+'.zip'
	zipFileURL = URL_CSV + zipFileName
	result = {
		"filename": "",
		"year": d.year,
		"month": d.month,
		"day": d.day,
		"option": option,
		"data":[]
		}
	# download new data
	try:
		response = urllib2.urlopen(zipFileURL)
	except HTTPError as e:
		# "HTTPError error ({0}): {1}".format(e.code, e.message)
		return False 
	zippedFile = StringIO.StringIO(response.read())
	# extract data
	zfobj = zipfile.ZipFile(zippedFile)
	for name in zfobj.namelist():
		result["filename"] = name
		data = StringIO.StringIO(zfobj.read(name))
		while True:
			line = data.readline()
			if line:
				if line.startswith(";"):
					continue
				if len(line)>5: 
					result["data"].append(line.decode('utf8').split(", "))
			else:
				break
	return result

def gas_update_xls(option="1"):
	# file path:
	d = date.today()
	xlsFileURL = URL_XLS + option
	result = {
		"filename": "",
		"year": None,
		"month": None,
		"day": None,
		"option": option,
		"headers": [],
		"data":[]
		}
	# download new data
	try:
		response = urllib2.urlopen(xlsFileURL)
	except HTTPError as e:
		return False 
	xlsFile = StringIO.StringIO(response.read())
	# obtain data
	soup = BeautifulSoup(xlsFile)
	table = soup.find('table')
	rows = table.findAll('tr')
	headers = False
	for tr in rows:
		if not headers:
			bolds = tr.findAll('b')
			if len(bolds):
				info = tr.findAll(text=True)
				if re.match(u'Fecha', info[1]):
					ddmmyyyy = info[2].split('-')
					result["year"] = int(ddmmyyyy[2])
					result["month"] = int(ddmmyyyy[1])
					result["day"] = int(ddmmyyyy[0])
				if re.match(u'Provincia', info[1]):
					result["headers"] = info[1:]
					headers = True
		else:
			data = tr.findAll(text=True)
			result["data"].append(data)
	return result

def gas_update_search(option="1"):
	values = {
		"nomProvincia": "01",
		"nomMunicipio": "",
		"nombreVia": "",
		"numVia": "",
		"codPostal": "",
		"tipoCarburante": option,
		"rotulo": "",
		"tipoVenta": "true",
		"economicas": "false",
		"tipoBusqueda": "0",
		"ordenacion": "P",
		"posicion": "0"
	}
	params = urllib.urlencode(values)
	req = urllib2.Request(URL_SEARCH, params)
	soup = BeautifulSoup(urllib2.urlopen(req).read())
	ndata = int(re.search("(?<=datos de ).*(?=estaciones de )", soup.find('p').text).group())
	print ndata
	pos = 0
	while pos < ndata:
		values["posicion"] = pos
		params = urllib.urlencode(values)
		req = urllib2.Request(URL_SEARCH, params)
		soup = BeautifulSoup(urllib2.urlopen(req).read())
		table = soup.find('table')
		rows = table.findAll('tr')
		headers = False
		for tr in rows:				
			data = tr.findAll('td')
			print data
		pos += 10

gas_update_search()

