import urllib

URL_STATIC_MAPS = "http://maps.googleapis.com/maps/api/staticmap?"

def get_static_map(markers):
	values = {
		"markers": "|".join(markers),
		"size": "380x263",
		"sensor": "false"
	}
	params = urllib.urlencode(values)
	return URL_STATIC_MAPS + params
