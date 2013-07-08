import logging

GOOGLE_MAPS_API = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyD5XZNFlQsyWtYDeKual-OcqmP_5pgwbds&sensor=false&region=ES&libraries=adsense'
GOOGLE_VIS_API = 'https://www.google.com/jsapi?autoload={modules:[{name:visualization,version:1,packages:[corechart]}]}'
GOOGLE_MAPS_VIS_API = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyD5XZNFlQsyWtYDeKual-OcqmP_5pgwbds&sensor=false&libraries=visualization'

MAPBOX_API = 'http://api.tiles.mapbox.com/mapbox.js/v0.6.7/mapbox.js'
MAPBOX_CSS = 'http://api.tiles.mapbox.com/mapbox.js/v0.6.7/mapbox.css'

JS_PATH = '/js/my_js_files/'
JS_PATH_MIN = '/js/'
JS_PATH_LIBS = '/js/my_js_libs/'

D3_API = 'http://d3js.org/d3.v3.min.js'
OPENLAYERS_API = 'http://openlayers.org/api/OpenLayers.js'

MEDIA_JS = {
	'home.js': {
		'src':		['search.js', 'home.js', 'utils.js'],
		'libs': 	[],
		'extern':	['google_maps_api_v3.js'],
		'api':		[GOOGLE_MAPS_API]
		},
	'mobile.js': {
		'src':		['search.js', 'mobile.js', 'utils.js'],
		'libs': 	[],
		'extern':	['google_maps_api_v3.js'],
		'api':		[GOOGLE_MAPS_API]
		},
	'detail.js': {
		'src': 		['utils.js','detail.js','search.js'],
		'libs': 	['amcharts.js'],
		'extern':	['google_maps_api_v3.js'],
		'api': 		[GOOGLE_MAPS_API]
		},
	'list.js': {
		'src':		['libs/markerclustererplus.min.js','utils.js','list.js','search.js'],
		'libs': 	[],
		'extern':	['google_maps_api_v3.js'],
		'api':		[GOOGLE_MAPS_API]
		},
	'cantidad.js' : {
		'src':		['utils.js','g_cantidad.js','search.js'],
		'libs': 	[],
		'extern':	['google_maps_api_v3.js'],
		'api':		[GOOGLE_MAPS_VIS_API]
		},
	'precio.js': {
		'src':		['utils.js','g_precio.js','search.js'],
		'libs': 	['jscolor.js','heatmap.js','heatmap-openlayers.js','d3.js','raphael.min.js'],
		'extern':	['google_maps_api_v3.js'],
		'api':		[OPENLAYERS_API, GOOGLE_MAPS_API]
		},
	'variedad.js': {
		'src':		['stats.js','search.js', 'utils.js'],
		'libs': 	['polymaps.min.js','jquery.min.js','raphael.min.js','kartograph.min.js'],
		'extern':	['google_maps_api_v3.js'],
		'api':		[D3_API, OPENLAYERS_API, GOOGLE_MAPS_API]
		},
	'noticias.js': {
		'src':		['search.js', 'utils.js'],
		'libs': 	[],
		'extern':	['google_maps_api_v3.js'],
		'api':		[]
		}
	}

def get_js(target, debug=False):
	if debug:
		return [a for a in MEDIA_JS[target]['api']]+[JS_PATH_LIBS+s for s in MEDIA_JS[target]['libs']]+[JS_PATH+s for s in MEDIA_JS[target]['src']]
	else:
		return [a for a in MEDIA_JS[target]['api']]+[JS_PATH_MIN+target]
