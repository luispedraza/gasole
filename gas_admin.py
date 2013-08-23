#!/usr/bin/env python
# -*- coding: utf-8 -*-

from gasole_base import *
from gas_update import *
from gas_maps import *
from gas_db import *
from google.appengine.api import users
from recaptcha import *
from google.appengine.api.mail import is_email_valid
from hashlib import md5
from secrets import SESSION_KEY
import urllib
import re
from gas_slimmer import *
from time import time
import datetime

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
        if not users.is_current_user_admin():
            self.redirect("/")
            return
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
        if not users.is_current_user_admin():
            self.redirect("/")
            return
    	option = self.request.get("option")
        data = None
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

# class AdminSearch(BaseHandler):
#     def get(self):
#         self.render("admin_search.html",
#             options = FUEL_OPTIONS,
#             provs = PROVS)
#     def post(self):
#         option = self.request.get("option")
#         prov = self.request.get("prov")
#         update = self.request.get("updatedb")
#         data = gas_update_search(prov=prov, option=option)
#         static_map = ""
#         if data:
#             markers = filter(None, [d[-1] for d in data])
#             static_map = get_static_map(markers[:50])
#         self.render("admin_search.html",
#             options = FUEL_OPTIONS,
#             provs = PROVS,
#             data = data,
#             static_map = static_map)
#         if update:
#             _geodata = []
#             data = data.data
#             for p in data.keys():
#                 datap = data[p]
#                 for t in datap.keys():
#                     datat = datap[t]
#                     for s in datat.keys():
#                         datas = datat[s]
#                         g = datas.get("latlon")
#                         if g:
#                             station = GasStation.get(db.Key.from_path('Province', p, 'Town', t, 'GasStation', s))
#                             if station:
#                                 station.geopt = db.GeoPt(lat = data[p][t][s]["latlon"][1], lon = data[p][t][s]["latlon"][0])
#                                 _geodata.append(station)
#             db.put(_geodata)
#             logging.info("guardadas %s posiciones" %len(_geodata))

class AdminSearch(BaseHandler):
    def get(self):
        if not users.is_current_user_admin():
            self.redirect("/")
            return
        self.render("admin_search.html",
            options = FUEL_OPTIONS,
            provs = PROVS)
    def post(self):
        if not users.is_current_user_admin():
            self.redirect("/")
            return
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
            update_geopos(data)

# webapp2 config
app_config = {
    'webapp2_extras.sessions': {
        'cookie_name': '_simpleauth_sess',
        'secret_key': SESSION_KEY
        },
    'webapp2_extras.auth': {
        'user_attributes': []
        }
    }
    
app = webapp2.WSGIApplication([
    ('/admin/?', AdminHandler),
    ('/admin/update/?(\w+)?', AdminUpdate),
    ('/admin/search/?', AdminSearch)
], debug=True, config=app_config)