#!/usr/bin/env python
# -*- coding: utf-8 -*-
# https://developers.google.com/appengine/articles/update_schema
import webapp2
from gas_db import *
import logging
from google.appengine.ext import deferred
from google.appengine.ext import db

BATCH_SIZE = 500  # ideal batch size may vary based on entity size.

def CleanHistory(cursor=None, num_updated=0):
	query = models.HistoryData.all()
	if cursor:
		query.with_cursor(cursor)
	to_put = []
	counter = 0
	for h in query.fetch(limit=BATCH_SIZE):
		counter+=1
		modified = False
		for p in h.dynamic_properties():
			if getattr(h, p) == None:
				delattr(h, p)
				modified = True
		if modified: 
			to_put.append(h)
	if to_put:
		db.put(to_put)
		num_updated += len(to_put)
		logging.debug(
			'Put %d entities to Datastore for a total of %d',
			len(to_put), num_updated)
	if counter:
		deferred.defer(
			CleanHistory, cursor=query.cursor(), num_updated=num_updated)
	else:
		logging.debug(
			'UpdateSchema complete with %d updates!', num_updated)

class CleanHistoryHandler(webapp2.RequestHandler):
    def get(self):
        deferred.defer(UpdateSchema)
        self.response.out.write('Schema migration successfully initiated.')

app = webapp2.WSGIApplication([('/clean_history', CleanHistoryHandler)])