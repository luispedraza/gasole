import logging
import webapp2
from google.appengine.api import taskqueue, backends

import sys
if 'lib' not in sys.path:
    sys.path.insert(0, 'libs')
    
from gas_update import *
from gas_db import *

class Update(webapp2.RequestHandler):
	def get(self):
		if DEBUG:
			data2store(gas_update_xls(option="0").data)
		else:
			taskqueue.add(url='/backends/update', target='update', method='GET')
			
app = webapp2.WSGIApplication([
    ('/tasks/update', Update)
], debug=True)