#!/usr/bin/env python
# -*- coding: utf-8 -*
import sys
if 'lib' not in sys.path:
    sys.path.insert(0, 'libs')
import webapp2
from jinja2 import Environment, FileSystemLoader
import os
from google.appengine.api import users
import logging
import json
import secrets
from webapp2_extras import auth, sessions

from simpleauth import SimpleAuthHandler

template_dir = os.path.join(os.path.dirname(__file__), 'templates')
jinja_env = Environment(loader = FileSystemLoader(template_dir), autoescape = False)

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
	@webapp2.cached_property
	def session(self):
		"""Returns a session using the default cookie key"""
		return self.session_store.get_session()
	@webapp2.cached_property
  	def auth(self):
  		return auth.get_auth()
  	@webapp2.cached_property
  	def current_user(self):
  		"""Returns currently logged in user"""
  		user_dict = self.auth.get_user_by_session()
  		return self.auth.store.user_model.get_by_id(user_dict['user_id'])

  	@webapp2.cached_property
  	def logged_in(self):
  		"""Returns true if a user is currently logged in, false otherwise"""
  		return self.auth.get_user_by_session() is not None

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
		# logging.info("Usuario: %s" %self.user)

	def render_json(self, d):
		json_txt = json.dumps(d)
		self.response.headers['Content-Type'] = 'application/json; charset=UTF-8'
		self.write(json_txt)

class BaseAuthHandler(BaseHandler, SimpleAuthHandler):
	# Enable optional OAuth 2.0 CSRF guard
	OAUTH2_CSRF_STATE = True
	USER_ATTRS = {
		'facebook' : {
			'id'     : lambda data: ('avatar_url', 
				'http://graph.facebook.com/{0}/picture?type=large'.format(data.get('id'))),
			'name'   : 'name',
			'link'   : 'link',
			'first_name': 'firstName',
			'last_name': 'lastName',
			},
		'google'   : {
			'picture': 'avatar_url',
			'name'   : 'name',
			'profile'   : 'link',
			'family_name': 'lastName',
			'given_name' : 'firstName'
			},
		'twitter'  : {
			'profile_image_url': 'avatar_url',
			'screen_name'      : 'name',
			'link'             : 'link'
			},
		'foursquare'   : {
			'photo'    : lambda data: ('avatar_url', data.get('photo').get('prefix') + '100x100' + data.get('photo').get('suffix')),
			'firstName': 'firstName',
			'lastName' : 'lastName',
			# 'contact'  : lambda data: ('email',data.get('contact').get('email')),
			'id'       : lambda data: ('link', 'http://foursquare.com/user/{0}'.format(data.get('id'))),
			'name'	   : lambda data: ('name', '%s %s' %(data.get('firstName'),data.get('lastName')))
			},
		'gasole'	   : {
			'avatar'   : 'avatar_url',
			'name'	   : 'name',
			'link'     : 'link'
			}
		}

	def _on_signin(self, data, auth_info, provider, redirect=True):
		auth_id = '%s:%s' % (provider, data['id'])
		# logging.info(auth_id)
		user = self.auth.store.user_model.get_by_auth_id(auth_id)
		_attrs = self._to_user_model_attrs(data, self.USER_ATTRS[provider])
		if user:
			logging.info('Found existing user to log in')
			# Existing users might've changed their profile data so we update our
			# local model anyway. This might result in quite inefficient usage
			# of the Datastore, but we do this anyway for demo purposes.
			#
			# In a real app you could compare _attrs with user's properties fetched
			# from the datastore and update local user in case something's changed.
			user.populate(**_attrs)
			user.put()
			self.auth.set_session(self.auth.store.user_to_dict(user))
		else:
			# check whether there's a user currently logged in
			# then, create a new user if nobody's signed in, 
			# otherwise add this auth_id to currently logged in user.
			if self.logged_in:
				logging.info('Updating currently logged in user')
				u = self.current_user
				u.populate(**_attrs)
				# The following will also do u.put(). Though, in a real app
				# you might want to check the result, which is
				# (boolean, info) tuple where boolean == True indicates success
				# See webapp2_extras.appengine.auth.models.User for details.
				u.add_auth_id(auth_id)
			else:
				logging.info('Creating a brand new user')
				ok, user = self.auth.store.user_model.create_user(auth_id, **_attrs)
				if ok:
					self.auth.set_session(self.auth.store.user_to_dict(user))

		if redirect:
			self.redirect(str(self.session.get('ref')) or '/')
			self.session['ref'] = ""


	def _login(self, provider=None):
		self.session['ref'] = self.request.headers['Referer']
		self._simple_auth(provider=provider)

	def _logout(self):
		self.auth.unset_session()
		self.redirect(self.request.headers['Referer'])

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

	def _to_user_model_attrs(self, data, attrs_map):
		"""Get the needed information from the provider dataset."""
		user_attrs = {}
		for k, v in attrs_map.iteritems():
			attr = (v, data.get(k)) if isinstance(v, str) else v(data)
			user_attrs.setdefault(*attr)
		return user_attrs
	def get_logged_user(self):
		if self.logged_in:
			return self.current_user


