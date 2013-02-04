import logging
import webapp2

from gas_update import *
from gas_db import *

class Update(webapp2.RequestHandler):
	def get(self):
		data = gas_update_xls(option="0")
		data2store(data)
class History(webapp2.RequestHandler):
	def get(self):
		logging.info("CRON history")

app = webapp2.WSGIApplication([
    ('/tasks/update', Update),
    ('/tasks/history', History)
], debug=True)