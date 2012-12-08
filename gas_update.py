#!/usr/bin/env python
# -*- coding: utf-8 -*-

# Web del ministerio de Industria, Energía y Turismo
# ARCHIVOS CSV:
# gasolina 95: 			http://geoportal.mityc.es/hidrocarburos/files/eess_G95_ddmmaaaa.zip
# gasolina 98: 			http://geoportal.mityc.es/hidrocarburos/files/eess_G98_ddmmaaaa.zip
# Gasoleo automocion: 	http://geoportal.mityc.es/hidrocarburos/files/eess_GOA_ddmmaaaa.zip
# nuevo gasoleo A: 		http://geoportal.mityc.es/hidrocarburos/files/eess_NGO_ddmmaaaa.zip
# biodiesel: 			http://geoportal.mityc.es/hidrocarburos/files/eess_BIOD_ddmmaaaa.zip
# ARCHIVOS EXCEL:
# http://geoportal.mityc.es/hidrocarburos/eess/searchTotal.do?tipoCons=1&tipoBusqueda=0&tipoCarburante=1&textoCarburante=Gasolina%2095
import urllib2
import urllib
from urllib2 import HTTPError
import zipfile
# import os
import time
import StringIO
from datetime import date
from bs4 import BeautifulSoup
import re
# import time
from google.appengine.api import urlfetch
import logging

FUEL_OPTIONS = {"1": {"short": u"G95", "name": u"Gasolina 95"},
				#"2": {"short": u"G97", "name": u"Gasolina 97"},
				"3": {"short": u"G98", "name": u"Gasolina 98"},
				"4": {"short": u"GOA", "name": u"Gasóleo Automoción"},
				"5": {"short": u"NGO", "name": u"Nuevo Gasóleo A"},
				"6": {"short": u"GOB", "name": u"Gasóleo B"},
				"7": {"short": u"GOC", "name": u"Gasóleo C"},
				"8": {"short": u"BIOD", "name": u"Biodiésel"}}

PROVS = {"00":"TODAS LAS PROVINCIAS","01":u"ÁLAVA","02":u"ALBACETE","03":u"ALICANTE","04":u"ALMERÍA","33":u"ASTURIAS","05":u"ÁVILA","06":u"BADAJOZ","07":u"BALEARS (ILLES)","08":u"BARCELONA","09":u"BURGOS","10":u"CÁCERES","11":u"CÁDIZ","39":u"CANTABRIA","12":u"CASTELLÓN/CASTELLÓ","51":u"CEUTA","13":u"CIUDAD REAL","14":u"CÓRDOBA","15":u"CORUÑA, A","16":u"CUENCA","17":u"GIRONA","18":u"GRANADA","19":u"GUADALAJARA","20":u"GUIPÚZCOA","21":u"HUELVA","22":u"HUESCA","23":u"JAÉN","24":u"LEÓN","25":u"LLEIDA","27":u"LUGO","28":u"MADRID","29":u"MÁLAGA","52":u"MELILLA","30":u"MURCIA","31":u"NAVARRA","32":u"OURENSE","34":u"PALENCIA","35":u"PALMAS, LAS","36":u"PONTEVEDRA","26":u"RIOJA, LA","37":u"SALAMANCA","38":u"SANTA CRUZ DE TENERIFE","40":u"SEGOVIA","41":u"SEVILLA","42":u"SORIA","43":u"TARRAGONA","44":u"TERUEL","45":u"TOLEDO","46":u"VALENCIA/VALÈNCIA","47":u"VALLADOLID","48":u"VIZCAYA","49":u"ZAMORA","50":u"ZARAGOZA"}

URL_CSV = 'http://geoportal.mityc.es/hidrocarburos/files/'
URL_XLS = 'http://geoportal.mityc.es/hidrocarburos/eess/searchTotal.do?tipoCons=1&tipoBusqueda=0&tipoCarburante='
URL_SEARCH = 'http://geoportal.mityc.es/hidrocarburos/eess/searchAddress.do'

# Resultado de una actualizacion de Internet (csv, xls, search)
class Result:
	def __init__(self, prov, option, headers=[], data=[]):
		self.date = date.today()
		self.prov = prov
		self.option = option
		self.headers = headers
		self.data = data

# Actualización por descarga de archivo CSV
def gas_update_csv(option="1"):
	if option == "0":
		return
	# file path:
	o = FUEL_OPTIONS[option]["short"]
	zipFileURL = URL_CSV+'eess_'+o+'_'+date.today().strftime("%d%m%Y")+'.zip'
	# download new data
	try:
		response = urllib2.urlopen(zipFileURL)
	except HTTPError as e:
		return False
	zippedFile = StringIO.StringIO(response.read())
	# extract data
	zfobj = zipfile.ZipFile(zippedFile)
	name = zfobj.namelist()[0]
	csv_data = StringIO.StringIO(zfobj.read(name))
	data = []
	while True:
		line = csv_data.readline()
		if line:
			if len(line)>5 and not line.startswith(";"):
				info = line.decode('utf8').split(", ")
				price = re.search("(?<=\s)[\d,]+(?=\se)", info[2])
				if price:
					price = price.group(0)
					fprice = float(re.sub(",", ".", price))
					data.append(info[0:2]+[re.sub(" %s e" %price, "", info[2]), fprice])
		else:
			break
	headers = ["Lat.", "Lon.", "Info", "Precio"]
	return Result(prov="", option=option, headers=headers, data=data)

# Actualización por descarga de archivo xls
def gas_update_xls(option="1", result=None):
	if option == "0":
		for o in FUEL_OPTIONS.keys():
			result = gas_update_xls(option=o, result=result)
		return result
	# file path:
	xlsFileURL = URL_XLS + option
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
	columns = [0, 1, 2, 4, 5, 6, 9]
	data = []
	headers = []
	if result:
		data = result.data
	for tr in rows:
		if not headers:
			bolds = tr.findAll('b')
			if len(bolds):
				info = tr.findAll(text=True)
				if re.match(u'Fecha', info[1]):
					pass
					# ddmmyyyy = info[2].split('-')
					# result["year"] = int(ddmmyyyy[2])
					# result["month"] = int(ddmmyyyy[1])
					# result["day"] = int(ddmmyyyy[0])
				if re.match(u'Provincia', info[1]):
					trs = tr.findAll('td')
					headers = [trs[i].text for i in columns]
		else:
			table_data = [td.text for td in tr.findAll('td')]
			if table_data[7] == "P":	# guardo sólo gaslineras de venta público
				province = table_data[0].title()
				town = table_data[1].title()
				address = table_data[2] + " ["+table_data[3]+"]"		# dirección de la gasolinera
				price = float(re.sub(",", ".", table_data[5]))
				if result:
					
							d[4][option] = table_data[5]	# agregamos el nuevo precio
				else:
					table_data[5] = {option: table_data[5]}
					data.append([table_data[i] for i in columns])
	return Result(prov="00", option=option, headers=headers, data=data)

# Actualización por búsqueda directa
def gas_update_search(option="1", prov="01"):
	if prov=="00":
		prov = ""
	values = {
		"nomProvincia": prov,
		"nomMunicipio": "",
		"nombreVia": "",
		"numVia": "",
		"codPostal": "",
		"tipoCarburante": option,
		"rotulo": "",
		"tipoVenta": "true",
		"economicas": "false",
		"tipoBusqueda": "0",
		"ordenacion": "P", #P
		"posicion": "0"
	}
	params = urllib.urlencode(values)
	req = urllib2.Request(URL_SEARCH, params)
	soup = BeautifulSoup(urllib2.urlopen(req).read())
	first_p = soup.find('p').text
	match = re.search("(?<=datos de ).*(?=estaciones de )", first_p)
	if match:
		ndata = int(match.group())
	else:
		return False
	xls_headers = soup.findAll('th')
	columns = [0, 1, 2, 4, 5, 6, 9, 10]
	headers = [xls_headers[i].text for i in columns]
	data = []
	
	def handle_result(rpc):
		rpc_result = rpc.get_result()
		soup = BeautifulSoup(rpc_result.content)
		table = soup.find('table')
		if not table:
			return			
		rows = table.findAll('tr')
		for row in rows[1:]:
			if row.has_attr('class'):
				cells = row.findAll('td')
				for c in range(len(cells)):
					if c == 2:
						cells[2] = cells[2].text + " [" + re.sub("\s+", "", cells[3].text) + "]"
					elif c == 5:				# precio
						cells[5] = float(re.sub(",",  ".", cells[5].text))
					elif c == (len(cells)-1):	# coordenadas
						centrar = re.search("(?<=centrar\().+(?=\))", cells[-1].prettify())
						if centrar:
							centrar = centrar.group().split(",")
							cells[-1] = ",".join([centrar[1], centrar[0]])
						else:
							cells[-1] = None
					else:
						cells[c] = cells[c].text
				data_xls = [cells[i] for i in columns]
				data.append(data_xls)

	def create_callback(rpc):
		return lambda: handle_result(rpc)
	pos = 0
	rpcs = []
	while pos < ndata:
		values["posicion"] = pos
		params = urllib.urlencode(values)		
		rpc = urlfetch.create_rpc(deadline=60)
		rpc.callback = create_callback(rpc)
		urlfetch.make_fetch_call(rpc, URL_SEARCH+"?"+params)
		rpcs.append(rpc)
		time.sleep(.1)
		pos += 10
	for rpc in rpcs:
		rpc.wait()
	return Result(prov=prov, option=option, headers=headers, data=data)

