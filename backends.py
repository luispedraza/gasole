import sys
if 'lib' not in sys.path:
    sys.path.insert(0, 'libs')

import logging
import webapp2
from gas_update import *
from gas_db import *

class UpdateHandler(webapp2.RequestHandler):
    def get(self):
    	data2store(gas_update_xls(option="0").data)

app = webapp2.WSGIApplication([('/backends/update', UpdateHandler)])