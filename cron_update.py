import logging
import webapp2
# from google.appengine.api import taskqueue, backends
from google.appengine.api import urlfetch, backends, taskqueue

# import sys
# if 'lib' not in sys.path:
#     sys.path.insert(0, 'libs')
    
# from gas_update import *
from gas_db import *

class Update(webapp2.RequestHandler):
	def get(self):
		url = '/backends/update'
		# if DEBUG:
		# 	# taskqueue.add(url='/backends/update', method='GET')

		# else:
		# 	# taskqueue.add(url='/backends/update', target='update', method='GET')
		# 	# taskqueue.add(url='%s/backends/update' %(backends.get_url('update')))
		if DEBUG: 
			taskqueue.add(url='/backends/update', method='GET')
		else:
			urlfetch.fetch(backends.get_url('update') + url)
		
			
app = webapp2.WSGIApplication([
    ('/tasks/update', Update)
], debug=True)