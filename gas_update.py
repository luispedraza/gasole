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
import sys
if 'lib' not in sys.path:
    sys.path.insert(0, 'libs')
    
import urllib
from zipfile import ZipFile
import time
from StringIO import StringIO
from datetime import date
from bs4 import BeautifulSoup
from lxml import html
import re
# import time
from google.appengine.api import urlfetch
import logging
from google.appengine.api.runtime import *
import gc

FUEL_OPTIONS = {"0": {"short": u"Todos", "name": u"Todos los tipos"},
				"1": {"short": u"G95", "name": u"Gasolina 95"},
				#"2": {"short": u"G97", "name": u"Gasolina 97"},
				"3": {"short": u"G98", "name": u"Gasolina 98"},
				"4": {"short": u"GOA", "name": u"Gasóleo Automoción"},
				"5": {"short": u"NGO", "name": u"Nuevo Gasóleo A"},
				"6": {"short": u"GOB", "name": u"Gasóleo B"},
				"7": {"short": u"GOC", "name": u"Gasóleo C"},
				"8": {"short": u"BIOD", "name": u"Biodiésel"}}
FUEL_REVERSE = {"Todos": "0",
				"G95": "1",
				# "G97": "2",
				"G98": "3",
				"GOA": "4",
				"NGO": "5",
				"GOB": "6",
				"GOC": "7",
				"BIOD": "8"}

PROVS = {"00":"TODAS LAS PROVINCIAS","01":u"ÁLAVA","02":u"ALBACETE","03":u"ALICANTE","04":u"ALMERÍA","33":u"ASTURIAS","05":u"ÁVILA","06":u"BADAJOZ","07":u"BALEARS (ILLES)","08":u"BARCELONA","09":u"BURGOS","10":u"CÁCERES","11":u"CÁDIZ","39":u"CANTABRIA","12":u"CASTELLÓN / CASTELLÓ","51":u"CEUTA","13":u"CIUDAD REAL","14":u"CÓRDOBA","15":u"CORUÑA, A","16":u"CUENCA","17":u"GIRONA","18":u"GRANADA","19":u"GUADALAJARA","20":u"GUIPÚZCOA","21":u"HUELVA","22":u"HUESCA","23":u"JAÉN","24":u"LEÓN","25":u"LLEIDA","27":u"LUGO","28":u"MADRID","29":u"MÁLAGA","52":u"MELILLA","30":u"MURCIA","31":u"NAVARRA","32":u"OURENSE","34":u"PALENCIA","35":u"PALMAS, LAS","36":u"PONTEVEDRA","26":u"RIOJA, LA","37":u"SALAMANCA","38":u"SANTA CRUZ DE TENERIFE","40":u"SEGOVIA","41":u"SEVILLA","42":u"SORIA","43":u"TARRAGONA","44":u"TERUEL","45":u"TOLEDO","46":u"VALENCIA / VALÈNCIA","47":u"VALLADOLID","48":u"VIZCAYA","49":u"ZAMORA","50":u"ZARAGOZA"}

URL_CSV = 'http://geoportal.mityc.es/hidrocarburos/files/'
URL_XLS = 'http://geoportal.mityc.es/hidrocarburos/eess/searchTotal.do?tipoCons=1&tipoBusqueda=0&tipoCarburante='
URL_SEARCH = 'http://geoportal.mityc.es/hidrocarburos/eess/searchAddress.do'

def make_clean_name(s):
	return re.sub("(^\s+)|(\s+$)", "", s).title()

# Resultado de una actualizacion de Internet (csv, xls, search)
class Result(object):
	def __init__(self, headers=[], data=[]):
		self.date = date.today()
		self.headers = headers
		self.data = data
	def __iter__(self):
		for d in self.data:
			yield d

class ResultIter(Result):
	def __init__(self):
		headers = [u"Provincia", u"Localidad", u"Dirección", u"Fecha", u"Precio", u"Rótulo", u"Horario", u"Lat.,Lon."]
		self.date = date.today()
		self.headers = headers
		self.data = {}

	def __iter__(self):
		a_data = []
		for p in self.data:
			prov = self.data[p]
			for t in prov:
				town = prov[t]
				for s in town:
					st = town[s]
					yield [p, t, s, st["date"], st["options"], st["label"], st["hours"], st.get("latlon")]
	def as_table(self):
		for item in self:
			row = [i or "" for i in item]
			row[3] = "/".join(row[3].isoformat().split("-")[1:])
			options = ""
			for o in row[4]:
				options += "<td class=op%s>%s</td>" %(o, row[4][o] or "")
			row[4] = options
			row[-1] = "("+",".join(row[-1])+")"
			yield "<td>"+"</td><td>".join(row)+"</td>"

	def add_item(self, province, town, station, label, date, option, hours, latlon=None):
		data = self.data
		province = make_clean_name(province)
		town = make_clean_name(town)
		s = data.setdefault(province,{}).setdefault(town, {}).get(station)
		if not s:
			data[province][town][station] = {"date":date,"label":label,"hours":hours,"options":option}
			if latlon:
				data[province][town][station]["latlon"] = latlon
		else:
			s["options"].update(option)
			s["date"] = date

# Actualización por descarga de archivo CSV
def gas_update_csv(option="1"):
	# file path:
	o = FUEL_OPTIONS[option]["short"]
	zipFileURL = URL_CSV+'eess_'+o+'_'+date.today().strftime("%d%m%Y")+'.zip'
	# download new data
	response = urlfetch.fetch(zipFileURL)
	if response.status_code != 200:
		return
	zippedFile = StringIO(response.content)
	# extract data
	zfobj = ZipFile(zippedFile)
	name = zfobj.namelist()[0]
	csv_data = StringIO(zfobj.read(name))
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
	return Result(headers=headers, data=data)

#Actualización por descarga de archivo xls
# def gas_update_xls_old(option="1"):
# 	logging.info("comienzo gas_update_xls %s" %memory_usage().current())
# 	result = ResultIter()
# 	if type(option) == str or type(option) == unicode:
# 		if option == "0":
# 			option = sorted(FUEL_OPTIONS.keys())[1:]
# 			logging.info("Buscando datos de todos los tipos de combustible")
# 		else:
# 			option = [option]
# 	def handle_xls_result(rpc, o, result=result):
# 		logging.info("procesando %s: %s" %(o, memory_usage().current()))
# 		bs = BeautifulSoup(StringIO(rpc.get_result().content))
# 		rows = bs.find('table').findAll('tr')
# 		for tr in rows[2:]:
# 			if not tr.findAll('b'):
# 				table_data = [td.text for td in tr.findAll('td')]
# 				if table_data[7] == "P":	# guardo sólo gaslineras de venta público
# 					thedate = table_data[4].split("/")
# 					result.add_item(province = table_data[0],
# 						town     = table_data[1],
# 						station  = table_data[2] + " [" + re.sub("\s+", "", table_data[3]) + "]",
# 						date     = date(int(thedate[2]), int(thedate[1]), int(thedate[0])),
# 						label    = table_data[6],
# 						hours    = table_data[9],
# 						option   = {o: float(re.sub(",", ".", table_data[5]))})
# 		bs.decompose()
# 		gc.collect()
# 		logging.info("fin procesando %s: %s" %(o, memory_usage().current()))

# 	def create_xls_callback(rpc, o):
# 		return lambda: handle_xls_result(rpc, o)

# 	rpcs = []
# 	for o in option:
# 		logging.info("Obteniendo %s" %FUEL_OPTIONS[o]["name"])
# 		rpc = urlfetch.create_rpc(deadline=55)
# 		rpc.callback = create_xls_callback(rpc, o)
# 		urlfetch.make_fetch_call(rpc, URL_XLS + o)
# 		rpcs.append(rpc)
# 	for rpc in rpcs:
# 		rpc.wait()
# 	return result

def gas_update_xls(option="1"):
	logging.info("comienzo gas_update_xls (lxml) %s" %memory_usage().current())
	result = ResultIter()
	if type(option) == str or type(option) == unicode:
		if option == "0":
			option = sorted(FUEL_OPTIONS.keys())[1:]
			logging.info("Buscando datos de todos los tipos de combustible")
		else:
			option = [option]
	def handle_xls_result(rpc, o, result=result):
		rpc_res = rpc.get_result()
		page = html.document_fromstring(rpc_res.content)
		rows = page.xpath("body/table")[0].findall("tr")
		for tr in rows[3:]:
			row_data = [td.text for td in tr.getchildren()]
			if row_data[7] == "P":	# guardo sólo gaslineras de venta público
				thedate = row_data[4].split("/")
				result.add_item(province = row_data[0],
					town     = row_data[1],
					station  = row_data[2] + " [" + re.sub("\s+", "", row_data[3]) + "]",
					date     = date(int(thedate[2]), int(thedate[1]), int(thedate[0])),
					label    = row_data[6],
					hours    = row_data[9],
					option   = {o: float(re.sub(",", ".", row_data[5]))})
		logging.info("fin procesando %s: %s" %(o, memory_usage().current()))

	def create_xls_callback(rpc, o):
		return lambda: handle_xls_result(rpc, o)

	rpcs = []
	for o in option:
		logging.info("Obteniendo %s" %FUEL_OPTIONS[o]["name"])
		rpc = urlfetch.create_rpc(deadline=55)
		rpc.callback = create_xls_callback(rpc, o)
		urlfetch.make_fetch_call(rpc, URL_XLS + o)
		rpcs.append(rpc)
	for rpc in rpcs:
		rpc.wait()
	return result


# def gas_update_xls(option="1"):
# 	logging.info("comienzo gas_update_xls %s" %memory_usage().current())
# 	result = ResultIter()
# 	if type(option) == str or type(option) == unicode:
# 		if option == "0":
# 			option = sorted(FUEL_OPTIONS.keys())[1:]
# 			logging.info("Buscando datos de todos los tipos de combustible")
# 		else:
# 			option = [option]

# 	for o in option:
# 		logging.info("Obteniendo %s" %FUEL_OPTIONS[o]["name"])
# 		info = urlfetch.fetch(URL_XLS + o, deadline=20)
# 		if info.status_code == 200:
# 			logging.info("procesando %s: %s" %(o, memory_usage().current()))
# 			rows = BeautifulSoup(StringIO(info.content)).find('table').findAll('tr')
# 			for tr in rows[2:]:
# 				if not tr.findAll('b'):
# 					table_data = [td.text for td in tr.findAll('td')]
# 					if table_data[7] == "P":	# guardo sólo gaslineras de venta público
# 						thedate = table_data[4].split("/")
# 						result.add_item(province = table_data[0],
# 							town     = table_data[1],
# 							station  = table_data[2] + " [" + re.sub("\s+", "", table_data[3]) + "]",
# 							date     = date(int(thedate[2]), int(thedate[1]), int(thedate[0])),
# 							label    = table_data[6],
# 							hours    = table_data[9],
# 							option   = {o: float(re.sub(",", ".", table_data[5]))})
# 			logging.info("fin procesando %s: %s" %(o, memory_usage().current()))
# 	return result

# Actualización por búsqueda directa
def gas_update_search(option="1", prov="01"):
	result = ResultIter()
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
		"ordenacion": "P",
		"posicion": "0"
	}
	def handle_search_result(rpc):
		rpc_result = rpc.get_result()
		soup = BeautifulSoup(rpc_result.content)
		table = soup.find('table')
		if not table:
			return
		rows = table.findAll('tr')
		for row in rows[1:]:
			if row.has_attr('class'):
				cells = row.findAll('td')
				latlon = re.search("(?<=centrar\().+(?=\))", cells[-1].prettify())
				if latlon:
					latlon = latlon.group().split(",")[:2]
				thedate = cells[4].text.split("/")
				result.add_item(
					province = cells[0].text,
					town     = cells[1].text,
					station  = cells[2].text + " [" + re.sub("\s+", "", cells[3].text) + "]",
					date     = date(int(thedate[2]), int(thedate[1]), int(thedate[0])),
					label    = cells[6].text,
					hours    = cells[9].text,
					latlon   = latlon,
					option   = {option: float(re.sub(",", ".",cells[5].text))})

	def create_search_callback(rpc):
		return lambda: handle_search_result(rpc)
	
	info = urlfetch.fetch(URL_SEARCH+"?"+urllib.urlencode(values))
	if info.status_code == 200:
		soup = BeautifulSoup(info.content)
		first_p = soup.find('p').text
		match = re.search("(?<=datos de ).*(?=estaciones de )", first_p)
		if match:
			ndata = int(match.group())
			pos = 0
			rpcs = []
			while pos < ndata:
				values["posicion"] = pos
				rpc = urlfetch.create_rpc(deadline=60)
				rpc.callback = create_search_callback(rpc)
				urlfetch.make_fetch_call(rpc, URL_SEARCH+"?"+urllib.urlencode(values))
				rpcs.append(rpc)
				time.sleep(.1)
				pos += 10
			for rpc in rpcs:
				rpc.wait()
			return result
	