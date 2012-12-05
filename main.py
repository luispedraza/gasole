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
import logging



class MainHandler(webapp2.RequestHandler):
    def get(self):
        self.response.write('Hello world!')

class Update(BaseHandler):
    def get(self):
        self.render("update.html",
        	options=FUEL_OPTIONS,       
            csv_data={},
            xls_data={})
    def post(self):
    	option = self.request.get("option")
    	csv_data = gas_update_csv(option)
    	xls_data = gas_update_xls(option)
        if self.request.get("updatedb"):
            gas_store_result(xls_data)
        self.render("update.html",
        	options=FUEL_OPTIONS,
        	csv_data=csv_data,
        	xls_data=xls_data)

class Search(BaseHandler):
    def get(self):
        self.render("search.html",
            options=FUEL_OPTIONS,
            provs=PROVS)
    def post(self):
        option = self.request.get("option")
        prov = self.request.get("prov")
        data = gas_update_search(option=option, prov=prov)
        if data:
            markers = filter(None, [info[-1] for info in data["data"]])
            static_map = get_static_map(markers[:50])
        else:
            static_map = ""
        if self.request.get("updatedb"):
            gas_store_result(data, location=True)
        self.render("search.html",
            options=FUEL_OPTIONS,
            provs=PROVS,
            search_data=data,
            static_map=static_map)
class Research(BaseHandler):
    def get(self):
        pass
        
class Test(BaseHandler):
    def get(self):

        class Entidad(db.Model):
            historia = db.StringListProperty()
        d = date.today()
        values = [1, 4, 2.5, 8, 1.90]
        info = d.isoformat()+";".join(map(str, values))
        logging.info(info)
        e = Entidad();
        for i in range(400):
            e.historia.append(info)
        e.put()
        pass



app = webapp2.WSGIApplication([
    ('/', MainHandler),
    ('/update/?', Update),
    ('/search/?', Search),
    ('/research/?', Research),
    ('/test/?', Test)
], debug=True)
