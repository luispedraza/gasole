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
        self.render("main.html",
            log_url = log_url,
            log_text = log_text)

class Update(BaseHandler):
    def get(self, method):
        self.check_user_name()
        if method and method=="csv":
            self.render("update_csv.html",
            	options=FUEL_OPTIONS,
                csv_data=None)
        elif not method or method=="xls":
            self.render("update_xls.html",
                options=FUEL_OPTIONS,
                xls_data=None)
        else:
            self.redirect("/")

    def post(self, method):
        self.check_user_name()
    	option = self.request.get("option")
        if method and method=="csv":
            data = gas_update_csv(option)
            self.render("update_csv.html",
                options=FUEL_OPTIONS,
                data=data)
        elif not method or method=="xls":
            data = gas_update_xls(option)
            self.render("update_xls.html",
                options=FUEL_OPTIONS,
                data=data)
        if self.request.get("updatedb"):
                data2store(data.data)

class Search(BaseHandler):
    def get(self):
        self.check_user_name()
        self.render("search.html",
            options = FUEL_OPTIONS,
            provs = PROVS)
    def post(self):
        self.check_user_name()
        option = self.request.get("option")
        prov = self.request.get("prov")
        update = self.request.get("updatedb")
        #data = get_data(prov=prov, option=option, update=update)
        data = gas_update_search(prov=prov, option=option)
        static_map = ""
        if data:
            markers = filter(None, [d[-1] for d in data])
            static_map = get_static_map(markers[:50])
        self.render("search.html",
            options = FUEL_OPTIONS,
            provs = PROVS,
            data = data,
            static_map = static_map)
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
    def get(self, province, city, station):
        self.render("base.html", 
            content=jinja_env.get_template("list.html").render())
class Api(BaseHandler):
    def get(self, province, city, station):
        if province:
            province = province.decode('utf-8')
            province = province.replace("_", " ").replace("*", "/")
            logging.info(province)
            data = memcache.get(province) or store2data(prov_kname=province).get(province)
            if not city or city == "Todas":
                info = {province: data or {"error": "Provincia no encontrada"}}
            elif data and city:
                city = city.decode('utf-8')
                city = city.replace("_", " ").replace("*", "/")
                data = data.get(city)
                info = {province: {city: data or {"error": "Ciudad no encontrada"}}}
                if data and station:
                    data = data.get(station)
                    info = {province: {city: {station: data or {"error": "Estación no encontrada"}}}}
        self.render_json(info)

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
    ('/update/?(\w+)?', Update),
    ('/search/?', Search),
    ('/map/?', Map),
    ('/stats/?', Stats),
    ('/data/(\w+)/(\w+)', Data),
    ('/gasolineras/?([\wáéíóúÁÉÍÓÚñÑàèìòù_\-,\(\)]+)/?(\w+)?/?(\w+)?', List),
    ('/api/?([\wáéíóúÁÉÍÓÚñÑàèìòù_\-,\(\)]+)/?(\w+)?/?(\w+)?', Api)
], debug=True)

app.error_handlers[404] = handle_404
app.error_handlers[500] = handle_500