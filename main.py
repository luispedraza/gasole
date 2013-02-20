#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
from gasole_base import *
from gas_update import *
from gas_maps import *
from gas_db import *
from google.appengine.api import users

GOOGLE_MAPS_API = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyD5XZNFlQsyWtYDeKual-OcqmP_5pgwbds&sensor=false&region=ES'
GOOGLE_VIS_API = 'https://www.google.com/jsapi?autoload={modules:[{name:visualization,version:1,packages:[corechart,AnnotatedTimeLine]}]}'

def decode_param(s):
    return s.decode('utf-8').replace("_", " ").replace("|", "/")

class MainHandler(BaseHandler):
    def get(self):
        self.render("base.html")

class AdminHandler(BaseHandler):
    def get(self):
        log_url = users.create_login_url(self.request.uri)
        log_text = 'Login'
        if self.user:
            log_url = users.create_logout_url(self.request.uri)
            log_text = 'Logout'
        self.render("admin_main.html",
            log_url = log_url,
            log_text = log_text)

class AdminUpdate(BaseHandler):
    def get(self, method):
        if method and method=="csv":
            self.render("admin_update_csv.html",
            	options=FUEL_OPTIONS,
                csv_data=None)
        elif not method or method=="xls":
            self.render("admin_update_xls.html",
                options=FUEL_OPTIONS,
                xls_data=None)
        else:
            self.redirect("/")

    def post(self, method):
    	option = self.request.get("option")
        if method and method=="csv":
            data = gas_update_csv(option)
            self.render("admin_update_csv.html",
                options=FUEL_OPTIONS,
                data=data)
        elif not method or method=="xls":
            data = gas_update_xls(option)
            self.render("admin_update_xls.html",
                options=FUEL_OPTIONS,
                data=data)
        if self.request.get("updatedb"):
                data2store(data.data)

class AdminSearch(BaseHandler):
    def get(self):
        self.render("admin_search.html",
            options = FUEL_OPTIONS,
            provs = PROVS)
    def post(self):
        option = self.request.get("option")
        prov = self.request.get("prov")
        update = self.request.get("updatedb")
        data = gas_update_search(prov=prov, option=option)
        static_map = ""
        if data:
            markers = filter(None, [d[-1] for d in data])
            static_map = get_static_map(markers[:50])
        self.render("admin_search.html",
            options = FUEL_OPTIONS,
            provs = PROVS,
            data = data,
            static_map = static_map)
        if update:
            logging.info("guardando datos")
            _geodata = []
            data = data.data
            for p in data.keys():
                for t in data[p].keys():
                    for s in data[p][t].keys():
                        if data[p][t][s].has_key("latlon"):
                            _geodata.append(GeoData(
                                key_name = s,
                                parent = db.Key.from_path('Province', p, 'Town', t),
                                geopt = db.GeoPt(lat = data[p][t][s]["latlon"][1],
                                    lon = data[p][t][s]["latlon"][0])
                                ))
            db.put(_geodata)
            logging.info("guardadas %s posiciones" %len(_geodata))

class Map(BaseHandler):
    def get(self):
        self.render("map.html")

class Stats(BaseHandler):
    def get(self):
        self.render("base.html", content=jinja_env.get_template("stats.html").render())

class Data(BaseHandler):
    def get(self, option, province):
        data = get_means(option)
        self.render_json(data)
class List(BaseHandler):
    def get(self, province, city):
        self.render("base.html", 
            scripts=['/js/utils.js', '/js/list.js', GOOGLE_MAPS_API],
            content=jinja_env.get_template("list.html").render())
class Detail(BaseHandler):
    def get(self, province, city, station):
        # Vista de detalle de una gasolinera
        self.render("base.html", 
            styles=['detail.css', 'chart.css'],
            scripts=[GOOGLE_VIS_API,
                '/js/utils.js', 
                '/js/detail.js'
                ],
            content=jinja_env.get_template("detail.html").render())
    def post(self, province, city, station):
        # Creación de un nuevo comentario sobre una estación
        title=self.request.get("title")
        content=self.request.get("content")
        if title and content:
            comment = Comment(title=title, content=content,
                parent=db.Key.from_path('Province', decode_param(province), 
                    'Town', decode_param(city), 
                    'GasStation', decode_param(station)))
            comment.put()
            logging.info(self.request)
            self.get(province=province, city=city, station=station)

class Api(BaseHandler):
    def get(self, prov, town, station):
        if prov:
            prov = decode_param(prov)
            data = memcache.get(prov) or store2data(prov_kname=prov).get(prov)
            if not town or town == "Todas":
                info = {prov: data or {"error": "Provincia no encontrada"}}
            elif data and town:
                town = decode_param(town)
                data = data.get(town)
                info = {prov: {town: data or {"error": "Ciudad no encontrada"}}}
                if data and station:
                    station = decode_param(station)
                    data = data.get(station)
                    info = {prov: {town: {station: data or {"error": "Estación no encontrada"}}},
                    "history": get_history(prov, town, station),
                    "comments" : get_comments(prov, town, station)
                    }
        logging.info(prov)
        self.render_json({"info": info, "latlon": get_latlon(prov=prov, town=town, station=station)})
class GeoApi(BaseHandler):
    def get(self, place, lat, lon, dist):
        latlon = get_near(lat=float(lat), lon=float(lon), dist=float(dist))
        self.render_json({"info": {}, "latlon": {place: latlon}})
class Search(BaseHandler):
    def get(self):
        self.render("base.html", 
            styles =['search.css'],
            scripts=[GOOGLE_MAPS_API, '/js/geocode.js'],
            content=jinja_env.get_template("search.html").render())

class SearchResults(BaseHandler):
    def get(self, place, lat, lon, dist):
        self.render("base.html", 
            scripts=['/js/utils.js', '/js/list.js', GOOGLE_MAPS_API],
            content=jinja_env.get_template("list.html").render())

# class Temp(BaseHandler):
#     #functión temporal para limpiar históricos de valores nulos no asignados
#     def get(self, offset):
#         _clean = []
#         q = HistoryData.all()
#         result = q.fetch(limit=1000, offset=int(offset))
#         for h in result:
#             modified = False
#             for p in h.dynamic_properties():
#                 if getattr(h, p) == None:
#                     delattr(h, p)
#                     modified = True
#             if modified: 
#                 _clean.append(h)
#         db.put_async(_clean)
#         logging.info("limpiados %s históricos de %s" %(len(_clean), len(result)))
        


def handle_404(request, response, exception):
    #http://webapp-improved.appspot.com/guide/exceptions.html
    logging.exception(exception)
    t = jinja_env.get_template("404.html")
    response.write(t.render())
    response.set_status(404)
def handle_500(request, response, exception):
    logging.exception(exception)
    response.write('Error en el servidor.')
    response.set_status(500)

app = webapp2.WSGIApplication([
    ('/', MainHandler),
    ('/admin/?', AdminHandler),
    ('/admin/update/?(\w+)?', AdminUpdate),
    ('/admin/search/?', AdminSearch),
    ('/map/?', Map),
    ('/stats/?', Stats),
    ('/data/(\w+)/(\w+)', Data),
    ('/gasolineras/?([^ \/]+)/?([^ \/]+)?/?', List),
    ('/ficha/?([^ \/]+)/?([^ \/]+)?/?([^ \/]+)?', Detail),
    ('/api/?([^ \/]+)/?([^ \/]+)?/?([^ \/]+)?', Api),
    ('/buscador/?', Search),
    ('/geo/(.+)/(.+)/(.+)/(.+)/?', GeoApi),
    ('/resultados/(.+)/(.+)/(.+)/(.+)/?', SearchResults),

    # ('/temp/(\d+)/?', Temp)

], debug=True)

app.error_handlers[404] = handle_404
app.error_handlers[500] = handle_500