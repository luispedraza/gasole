#!/usr/bin/env python
# -*- coding: utf-8 -*-
import webapp2
from jinja2 import Environment, FileSystemLoader
import os
from google.appengine.api import users
import logging
import json
from simpleauth import SimpleAuthHandler
import secrets
from webapp2_extras import auth, sessions

template_dir = os.path.join(os.path.dirname(__file__), 'templates')
#styles_dir = os.path.join(os.path.dirname(__file__), 'styles')
jinja_env = Environment(loader = FileSystemLoader(template_dir), autoescape = False)

def dumper(o):
	if hasattr(o, 'isoformat'):
		return o.isoformat()
	else:
		raise TypeError, 'Object of type %s with value of %s is not JSON serializable' % (type(o), repr(o)) 

# Basic handler with common functions
class BaseHandler(webapp2.RequestHandler):
	def dispatch(self):
		# Get a session store for this request.
		self.session_store = sessions.get_store(request=self.request)
		try:
			# Dispatch the request.
			webapp2.RequestHandler.dispatch(self)
		finally:
			# Save all sessions.
			self.session_store.save_sessions(self.response)
			
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
		logging.info("Usuario: %s" %self.user)

	def render_json(self, d):
		json_txt = json.dumps(d, default=dumper)
		self.response.headers['Content-Type'] = 'application/json; charset=UTF-8'
		self.write(json_txt)

class BaseAuthHandler(BaseHandler, SimpleAuthHandler):
	def _on_signin(self, data, auth_info, provider):
		logging.info(data)
		logging.info(auth_info)
		logging.info(provider)
		auth_id = '%s:%s' % (provider, data['id'])
		logging.info(auth_id)
		# user = User.get_by_auth_id(auth_id)
		# if not user:
		#     User(**data).put()
		self.session['_user_id'] = auth_id
	def _logout(self):
		self.auth.unset_session()
		self.redirect('/')
	def _callback_uri_for(self, provider):
		return self.uri_for('auth_callback', provider=provider, _full=True)

	def _get_consumer_info_for(self, provider):
		"""Should return a tuple (key, secret) for auth init requests.
		For OAuth 2.0 you should also return a scope, e.g.
		('my app id', 'my app secret', 'email,user_about_me')

		The scope depends solely on the provider.
		See example/secrets.py.template
		"""
		return secrets.AUTH_CONFIG[provider]

	def logged_in(self):
		return self.auth.get_user_by_session() is not None