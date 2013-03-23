import logging

GOOGLE_MAPS_API = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyD5XZNFlQsyWtYDeKual-OcqmP_5pgwbds&sensor=false&region=ES'
GOOGLE_VIS_API = 'https://www.google.com/jsapi?autoload={modules:[{name:visualization,version:1,packages:[corechart]}]}'
GOOGLE_MAPS_VIS_API = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyD5XZNFlQsyWtYDeKual-OcqmP_5pgwbds&sensor=false&libraries=visualization'

MAPBOX_API = 'http://api.tiles.mapbox.com/mapbox.js/v0.6.7/mapbox.js'
MAPBOX_CSS = 'http://api.tiles.mapbox.com/mapbox.js/v0.6.7/mapbox.css'

JS_PATH = '/js/my_js_files/'
JS_PATH_MIN = '/js/min/'

D3_API = 'http://d3js.org/d3.v3.min.js'
OPENLAYERS_API = 'http://openlayers.org/api/2.12/OpenLayers.js'

MEDIA_JS = {
	'detail.js': {
		'src': 		['utils.js','detail.js'],
		'api': 		[]
		},
	'geocode.js': {
		'src':		['geocode.js'],
		'api': 		[]
		},
	'list.js': {
		'src':		['libs/markerclusterer.min.js','utils.js','list.js'],
		'api':		[]
		},
	'cantidad.js' : {
		'src':		['g_cantidad.js'],
		'api':		[]
		},
	'precio.js': {
		'src':		['g_precio.js'],
		'api':		[D3_API, OPENLAYERS_API]
		},
	}

def get_js(target, debug=False):
	if debug:
		return [a for a in MEDIA_JS[target]['api']]+[JS_PATH+s for s in MEDIA_JS[target]['src']]
	else:
		return [a for a in MEDIA_JS[target]['api']]+[JS_PATH_MIN+target]
