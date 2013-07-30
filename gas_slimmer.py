import logging

GOOGLE_MAPS_API = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyD5XZNFlQsyWtYDeKual-OcqmP_5pgwbds&sensor=false&region=ES&libraries=adsense'
# GOOGLE_VIS_API = 'https://www.google.com/jsapi?autoload={modules:[{name:visualization,version:1,packages:[corechart]}]}'
# GOOGLE_MAPS_VIS_API = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyD5XZNFlQsyWtYDeKual-OcqmP_5pgwbds&sensor=false&libraries=visualization'

# MAPBOX_API = 'http://api.tiles.mapbox.com/mapbox.js/v0.6.7/mapbox.js'
# MAPBOX_CSS = 'http://api.tiles.mapbox.com/mapbox.js/v0.6.7/mapbox.css'

JS_PATH = '/js/my_js_files/'
JS_PATH_MIN = '/js/'
JS_PATH_LIBS = '/js/my_js_libs/'

D3_API = 'http://d3js.org/d3.v3.min.js'
OPENLAYERS_API = 'http://openlayers.org/api/OpenLayers.js'

MEDIA_JS = {
	'home.js': {
		'src':		['utils.js','search.js','paths.js','home.js'],
		'libs': 	['raphael.min.js'],
		'extern':	['google_maps_api_v3.js'],
		'api':		[]
		},
	'mobile.js': {
		'src':		['utils.js','search.js', 'mobile.js'],
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
	'charts.js': {
		'src':		['paths.js','utils.js','charts.js','search.js'],
		'libs': 	['jscolor.js','heatmap.js','heatmap-openlayers.js','d3.js','raphael.min.js'],
		'extern':	[],
		'api':		[OPENLAYERS_API]
		},
	'info.js': {
		'src':		['utils.js','search.js'],
		'libs': 	[],
		'extern':	['google_maps_api_v3.js'],
		'api':		[]
		},
	'about.js': {
		'src':		['utils.js','search.js'],
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
