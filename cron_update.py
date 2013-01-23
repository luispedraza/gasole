import logging
import webapp2

class Update(webapp2.RequestHandler):
	def get(self):
		logging.info("CRON update")
class History(webapp2.RequestHandler):
	def get(self):
		logging.info("CRON history")

app = webapp2.WSGIApplication([
    ('/tasks/update', Update),
    ('/tasks/history', History)
], debug=True)