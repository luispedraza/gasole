# import sys
# if 'lib' not in sys.path:
#     sys.path.insert(0, 'libs')

import webapp2
from gas_update import gas_update_xls
from gas_db import data2store

class UpdateHandler(webapp2.RequestHandler):
    def get(self):
    	result = gas_update_xls(option="0")
    	if result:
    		data2store(result.data)

app = webapp2.WSGIApplication([('/backends/update', UpdateHandler)])