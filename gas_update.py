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
from datetime import date as Date
from bs4 import BeautifulSoup
from lxml import html
import re
# import time
from google.appengine.api import urlfetch
import logging
from google.appengine.api.runtime import memory_usage
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
		self.date = Date.today()
		self.headers = headers
		self.data = data
	def __iter__(self):
		for d in self.data:
			yield d

class ResultIter(Result):
	def __init__(self):
		headers = [u"Provincia", u"Localidad", u"Dirección", u"Fecha", u"Rótulo", u"Horario", u"Precio", u"Lat.,Lon."]
		self.date = Date.today()
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
					yield [p, t, s, st["d"], st["l"], st["h"], st["o"], st.get("g")]
	def as_table(self):
		for row in self:
			row = [x if x else "" for x in row]
			row[3] = "-".join(map(str,row[3]))
			options = [str(row[6].get(o, "")) for o in FUEL_OPTIONS]
			row[-1] = "("+",".join(row[-1])+")" if row[-1] else ""
			yield "<td>"+"</td><td>".join(row[:6]+options+row[7:])+"</td>"
	def html_table(self):
		table = ""
		for r in self.as_table():
			table+="<td>"+r+"</td>\n"
		return table
	def as_array(self):
		for row in self:
			options = [row[6].get(o, None) for o in FUEL_OPTIONS]
			yield row[:6]+options+row[7:-1]+(row[-1] if row[-1] else [None, None])
	def array(self):
		the_array = []
		for r in self.as_array():
			the_array.append(r)
		return the_array


	def add_item(self, province, town, station, label, date, option, hours, latlon=None):
		data = self.data
		province = make_clean_name(province)
		town = make_clean_name(town)
		s = data.setdefault(province,{}).setdefault(town, {}).get(station)
		if not s:
			data[province][town][station] = {"d":date,"l":label,"h":hours,"o":option}
			if latlon:
				data[province][town][station]["g"] = latlon
		else:
			s["o"].update(option)
			s["d"] = date

# Actualización por descarga de archivo CSV
def gas_update_csv(option="1"):
	# file path:
	o = FUEL_OPTIONS[option]["short"]
	zipFileURL = URL_CSV+'eess_'+o+'_'+Date.today().strftime("%d%m%Y")+'.zip'
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

# # Actualización desde fichero excel zipeado
# def gas_update_xls(option="1"):
# 	xls_result = ResultIter()
# 	data_error = False
# 	rpcs = []
# 	def handle_xls_result(rpc, o):
# 		rpc_res = rpc.get_result()
# 		page = html.document_fromstring(rpc_res.content)
# 		tables = page.xpath("body/table")
# 		if tables:	# si encuentra tablas en el resultado
# 			rows = tables[0].findall("tr")
# 			for tr in rows[3:]:
# 				row_data = [td.text for td in tr.getchildren()]
# 				if row_data[7] == "P":	# guardo sólo gaslineras de venta público
# 					date = map(int, row_data[4].split("/"))
# 					date.reverse();
# 					xls_result.add_item(
# 						province = row_data[0],
# 						town     = row_data[1],
# 						station  = row_data[2] + " [" + re.sub("\s+", "", row_data[3]) + "]",
# 						date     = date,
# 						label    = row_data[6],
# 						hours    = row_data[9],
# 						option   = {o: float(re.sub(",", ".", row_data[5]))})
# 			logging.info("fin procesando %s: %s" %(o, memory_usage().current()))
# 		else:
# 			logging.info("sin informacion en %s" %o)
# 			data_error = True
		
# 	def create_xls_callback(rpc, o):
# 		return lambda: handle_xls_result(rpc, o)
	
# 	logging.info("comienzo gas_update_xls: %s" %memory_usage().current())
# 	if option == "0":
# 		option = sorted(FUEL_OPTIONS.keys())[1:]
# 		logging.info("Buscando datos de todos los tipos")
# 	else:
# 		option = [option]
# 	for o in option:
# 		logging.info("Obteniendo %s" %FUEL_OPTIONS[o]["name"])
# 		rpc = urlfetch.create_rpc(deadline=55)
# 		rpc.callback = create_xls_callback(rpc, o)
# 		urlfetch.make_fetch_call(rpc, URL_XLS+o)
# 		rpcs.append(rpc)
# 	for rpc in rpcs:
# 		rpc.wait()
# 	return xls_result if not data_error else None

# Actualización desde fichero excel zipeado
def gas_update_xls(option="1"):
	xls_result = ResultIter()
	logging.info("comienzo gas_update_xls: %s" %memory_usage().current())
	if option == "0":
		option = sorted(FUEL_OPTIONS.keys())[1:]
		logging.info("Buscando datos de todos los tipos")
	else:
		option = [option]
	for o in option:
		logging.info("Obteniendo %s" %FUEL_OPTIONS[o]["name"])
		response = urlfetch.fetch(URL_XLS+o, deadline=55)
		if response.status_code == 200:
			page = html.document_fromstring(response.content)
			tables = page.xpath("body/table")
			if tables:	# si encuentra tablas en el resultado
				rows = tables[0].findall("tr")
				if len(rows)<5:
					return None
				for tr in rows[3:]:
					row_data = [td.text for td in tr.getchildren()]
					if row_data[7] == "P":	# guardo sólo gaslineras de venta público
						date = map(int, row_data[4].split("/"))
						date.reverse();
						xls_result.add_item(
							province = row_data[0],
							town     = row_data[1],
							station  = row_data[2] + " [" + re.sub("\s+", "", row_data[3]) + "]",
							date     = date,
							label    = row_data[6],
							hours    = row_data[9],
							option   = {o: float(re.sub(",", ".", row_data[5]))})
				logging.info("fin procesando %s: %s" %(o, memory_usage().current()))
			else:
				logging.info("sin informacion en %s" %o)
				return None
		else:
			logging.info("Error en el geoportal")
			return None
	return xls_result

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
				date = map(int, cells[4].text.split("/"))
				date.reverse()
				result.add_item(
					province = cells[0].text,
					town     = cells[1].text,
					station  = cells[2].text + " [" + re.sub("\s+", "", cells[3].text) + "]",
					date     = date,
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


#estadisticas para resultados de un tipo de combustible
class Stats:
	def __init__(self):
		self.n = 0
		self.max = self.min = self.mu = self.range = None
		self.smin = [] # estaciones con precio mínimo
		self.smax = [] # estaciones con precio máximo
	def range(self):
		if self.range==None:
			self.range=self.max-self.min
		return self.range
	def add(self, p, s, g=None):
		if self.mu:
			if p>self.max:
				self.max=p
				self.smax=[s]
			elif p==self.max:
				self.smax.append(s)
			elif p<self.min:
				self.min=p
				self.smin=[s]
			elif p==self.min:
				self.smin.append(s)
			self.mu = (self.mu*self.n+p)/(self.n+1)
			self.n+=1
		else:
			self.max = self.min = self.mu = p
			self.smin = [s]
			self.smax = [s]
			self.n = 1

# Estadisticas de todos los datos de un objeto gasole
def compute_stats(data):
	stats = {}			# estadisticas globales
	provinces = {}		# estadisticas provinciales
	for p in data:
		logging.info(p)
		datap = data[p]
		statp = provinces[p] = {}
		for t in datap:
			datat = datap[t]
			for s in datat:
				datas = datat[s]
				options = datas.get("o")
				for o in options:
					p = datas["o"][o]
					_p = stats.setdefault(o,Stats())
					_g = statp.setdefault(o,Stats())
					_p.add(p,[p,t,s])
					_g.add(p,[p,t,s])
	memcache.set("global_stats", stats)
	memcache.set("province_stats", provinces)
	return stats, provinces


