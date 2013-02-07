import logging
import webapp2

from gas_update import *
from gas_db import *

class Update(webapp2.RequestHandler):
	def get(self):
		data = gas_update_xls(option="0")
		data2store(data.data)
class History(webapp2.RequestHandler):
	def get(self):
		_history = []
		for p in PriceData.all():
			props = dict((k, getattr(p, k)) for k in p.dynamic_properties())
			_history.append(HistoryData(parent = p.key().parent(), **props))
		db.put(_history)

app = webapp2.WSGIApplication([
    ('/tasks/update', Update),
    ('/tasks/history', History)
], debug=True)