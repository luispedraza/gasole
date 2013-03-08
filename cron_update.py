import logging
import webapp2

import sys
if 'lib' not in sys.path:
    sys.path.insert(0, 'libs')
    
from gas_update import *
from gas_db import *

class Update(webapp2.RequestHandler):
	def get(self):
		data = gas_update_xls(option="0")
		data2store(data.data)

app = webapp2.WSGIApplication([
    ('/tasks/update', Update)
], debug=True)