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
GOOGLE_VIS_API = 'https://www.google.com/jsapi?autoload={modules:[{name:visualization,version:1,packages:[corechart]}]}'
GOOGLE_MAPS_VIS_API = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyD5XZNFlQsyWtYDeKual-OcqmP_5pgwbds&sensor=false&libraries=visualization'

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
            _geodata = []
            data = data.data
            for p in data.keys():
                for t in data[p].keys():
                    for s in data[p][t].keys():
                        if data[p][t][s].has_key("latlon") and data[p][t][s]["latlon"]:
                            station = GasStation.get(db.Key.from_path('Province', p, 'Town', t, 'GasStation', s))
                            if station:
                                station.geopt = db.GeoPt(lat = data[p][t][s]["latlon"][1], lon = data[p][t][s]["latlon"][0])
                                _geodata.append(station)
                                # _geodata.append(GeoData(
                                #     key_name = s,
                                #     parent = db.Key.from_path('Province', p, 'Town', t),
                                #     geopt = db.GeoPt(lat = data[p][t][s]["latlon"][1],
                                #         lon = data[p][t][s]["latlon"][0])
                                #     ))
            db.put(_geodata)
            logging.info("guardadas %s posiciones" %len(_geodata))

class Map(BaseHandler):
    def get(self):
        self.render("map.html")

class Stats(BaseHandler):
    def get(self, g_type, province, city):
        logging.info(conpute_stats())
        the_scripts = []
        the_styles = []
        if (g_type=="precio"):
            the_scripts = [GOOGLE_MAPS_API, 
                '/js/g_precio.js', 
                '/js/libs/d3.v3.min.js']
            the_styles=["g_precio.css"]
        elif (g_type=="cantidad"):
            the_scripts = [GOOGLE_MAPS_VIS_API, '/js/g_cantidad.js']
            the_styles=["g_cantidad.css"]
        elif (g_type=="variedad"):
            the_scripts = [GOOGLE_MAPS_VIS_API, 
                '/js/stats.js', 
                '/js/libs/polymaps.min.js', 
                '/js/libs/jquery.min.js', 
                '/js/libs/raphael.min.js', 
                '/js/libs/kartograph.min.js',
                '/js/libs/d3.v3.min.js']
            the_styles=["g_variedad.css"]
        self.render("base.html", 
            title=u"Gráficos",
            scripts=the_scripts,
            styles=the_styles,
            content=jinja_env.get_template("g_"+g_type+".html").render())

class Data(BaseHandler):
    def get(self, option, province):
        data = get_means(option)
        self.render_json(data)

class List(BaseHandler):
    def get(self, province, city):
        title = "Gasolineras en " + (decode_param(city)+ ", " if city else "la ") + "provincia de " + decode_param(province)
        self.render("base.html", 
            title = title,
            styles=["list.css"],
            scripts=['/js/utils.js', '/js/list.js', GOOGLE_MAPS_API, '/js/libs/markerclusterer_compiled.js'],
            content=jinja_env.get_template("list.html").render())
class Detail(BaseHandler):
    def get(self, province, town, station):
        # Vista de detalle de una gasolinera
        province = decode_param(province)
        town = decode_param(town)
        station = decode_param(station)
        address = station.replace("_[D]", " (margen derecho)").replace("_[I]", " (margen izquierdo)").replace("_[N]", "")
        title = "Gasolinera en " + address + ", " + town
        edit_station = None
        if users.is_current_user_admin():
            sdata = GasStation.get(db.Key.from_path('Province', province, 'Town', town, 'GasStation', station))
            if sdata:
                edit_station = {k: sdata.get(k) for k in sdata.dynamic_properties()}
        self.render("base.html",
            title = title,
            styles=['detail.css', 'chart.css'],
            scripts=[GOOGLE_VIS_API, GOOGLE_MAPS_API,
                '/js/utils.js', 
                '/js/detail.js'
                ],
            content=jinja_env.get_template("detail.html").render(
                title = title,
                edit_station=edit_station
                ))
    def post(self, province, town, station):
        # Actualización de datos de la gasolinera:
        if users.is_current_user_admin() and self.request.get("edit_station"):
            self.get(province=province, town=city, station=station)
            return
        # Creación de un nuevo comentario sobre una estación
        title=self.request.get("title")
        content=self.request.get("content")
        if title and content:
            comment = Comment(title=title, content=content,
                parent=db.Key.from_path('Province', decode_param(province), 
                    'Town', decode_param(town), 
                    'GasStation', decode_param(station)))
            comment.put()
            self.get(province=province, town=town, station=station)

class Api(BaseHandler):
    def get(self, prov, town, station):
        if prov:
            prov = decode_param(prov)
            data = memcache.get(prov) or store2data(prov_kname=prov).get(prov)
            if not town:
                info = {"_data": {prov: data or {"error": "Provincia no encontrada"}}}
            elif data and town:
                town = decode_param(town)
                data = data.get(town)
                if not station:
                    info = {"_data": {prov: {town: data or {"error": "Ciudad no encontrada"}}}}
                elif data and station:
                    station = decode_param(station)
                    data = data.get(station)
                    info = {"_data": {prov: {town: {station: data or {"error": "Estación no encontrada"}}}},
                    "_history": get_history(prov, town, station),
                    "_comments" : get_comments(prov, town, station)
                    }
        self.render_json(info)
        
class GeoApi(BaseHandler):
    def get(self, place, lat, lon, dist):
        self.render_json({"_near": place, "_data": get_near(lat=float(lat), lon=float(lon), dist=float(dist))})

class Search(BaseHandler):
    def get(self):
        self.render("base.html", 
            styles =['search.css', 'map.css'],
            scripts=['/js/geocode.js', GOOGLE_MAPS_API],
            content=jinja_env.get_template("search.html").render(
                map=jinja_env.get_template("spain.svg").render()))

class SearchResults(BaseHandler):
    def get(self, place, lat, lon, dist):
        title = "Gasolineras cerca de " + decode_param(place)
        self.render("base.html", 
            title = title,
            styles=["list.css"],
            scripts=['/js/utils.js', '/js/list.js', GOOGLE_MAPS_API, '/js/libs/markerclusterer_compiled.js'],
            content=jinja_env.get_template("list.html").render())

class Info(BaseHandler):
    def get(self, section):
        content_html = ""
        if section=="combustibles":
            content_html="info_combustibles.html"
        elif section=="tarjetas":
            content_html="info_tarjetas.html"
        elif section=="noticias":
            content_html="info_noticias.html"
        self.render("base.html",
            content=jinja_env.get_template(content_html).render())


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
    ('/graficos/?([^ \/]+)?/?([^ \/]+)?/?([^ \/]+)?/?', Stats),
    ('/data/(\w+)/(\w+)', Data),
    ('/gasolineras/?([^ \/]+)/?([^ \/]+)?/?', List),
    ('/ficha/?([^ \/]+)/?([^ \/]+)?/?([^ \/]+)?', Detail),
    ('/api/?([^ \/]+)/?([^ \/]+)?/?([^ \/]+)?', Api),
    ('/buscador/?', Search),
    ('/geo/(.+)/(.+)/(.+)/(.+)/?', GeoApi),
    ('/resultados/(.+)/(.+)/(.+)/(.+)/?', SearchResults),
    ('/info/(noticias|tarjetas|combustibles)/?', Info)
], debug=True)

app.error_handlers[404] = handle_404
app.error_handlers[500] = handle_500