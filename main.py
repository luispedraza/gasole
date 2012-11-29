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


class MainHandler(webapp2.RequestHandler):
    def get(self):
        self.response.write('Hello world!')

class Update(BaseHandler):
    def get(self):
        self.render("update.html",
        	options=FUEL_OPTIONS)
    def post(self):
    	option = self.request.get("option")
    	csv_data = gas_update_csv(FUEL_OPTIONS[option][0])
    	xls_data = gas_update_xls(option)
        self.render("update.html",
        	options=FUEL_OPTIONS,
        	filename=csv_data["filename"],
        	csv_data=csv_data["data"],
        	xls_data_h=xls_data["headers"],
        	xls_data_d=xls_data["data"])

app = webapp2.WSGIApplication([
    ('/', MainHandler),
    ('/update/?', Update)
], debug=True)
