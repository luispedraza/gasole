import webapp2

from gas_update import *
from gas_db import *

class Update(webapp2.RequestHandler):
	def get(self):
		data2store(gas_update_xls(option="0").data)

app = webapp2.WSGIApplication([
    ('/tasks/update', Update)
    # ('/tasks/history', History)
], debug=True)