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
        elif not method or method and method=="xls":
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
        elif not method or method and method=="xls":
            data = gas_update_xls(option)
            self.render("update_xls.html",
                options=FUEL_OPTIONS,
                data=data)
        if self.request.get("updatedb"):
                data2store(data)

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
        self.render("stats.html")


app = webapp2.WSGIApplication([
    ('/', MainHandler),
    ('/update/?(\w+)?', Update),
    ('/search/?', Search),
    ('/map/?', Map),
    ('/stats/?', Stats)
], debug=True)
