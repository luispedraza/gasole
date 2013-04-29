import logging
import webapp2

from google.appengine.api import urlfetch, backends, taskqueue
from gas_db import *

class Update(webapp2.RequestHandler):
	def get(self):
		if DEBUG: 
			taskqueue.add(url='/backends/update', method='GET')
		else:
			urlfetch.fetch(backends.get_url('update') + '/backends/update')
			
app = webapp2.WSGIApplication([
    ('/tasks/update', Update)
], debug=True)