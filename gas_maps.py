import urllib
import logging

URL_STATIC_MAPS = "http://maps.googleapis.com/maps/api/staticmap?"

def get_static_map(markers):
	mark_list = []
	for m in markers:
		mark_list.append(m[1]+","+m[0])

	values = {
		"markers": "|".join(mark_list),
		"size": "380x263",
		"sensor": "false"
	}
	params = urllib.urlencode(values)
	return URL_STATIC_MAPS + params
