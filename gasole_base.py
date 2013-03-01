#!/usr/bin/env python
# -*- coding: utf-8 -*-
import webapp2
from jinja2 import Environment, FileSystemLoader
import os
from google.appengine.api import users
import logging
import json

template_dir = os.path.join(os.path.dirname(__file__), 'templates')
#styles_dir = os.path.join(os.path.dirname(__file__), 'styles')
jinja_env = Environment(loader = FileSystemLoader(template_dir),
	autoescape = False)

def dumper(o):
	if hasattr(o, 'isoformat'):
		return o.isoformat()
	else:
		raise TypeError, 'Object of type %s with value of %s is not JSON serializable' % (type(o), repr(o)) 
# Basic handler with common functions
class BaseHandler(webapp2.RequestHandler):
	def write(self, *a, **kw):
		self.response.out.write(*a, **kw)

	def render_str(self, template, **params):
		t = jinja_env.get_template(template)
		return t.render(params)

	def render(self, template, **kw):
		self.write(self.render_str(template, **kw))

	def check_user_name(self):
		if self.user.nickname() != "luispedraza":
			self.redirect("/")

	def initialize(self, *a, **kw):
		webapp2.RequestHandler.initialize(self, *a, **kw)
		self.user = users.get_current_user()

	def render_json(self, d):
		json_txt = json.dumps(d, default=dumper)
		self.response.headers['Content-Type'] = 'application/json; charset=UTF-8'
		self.write(json_txt)
