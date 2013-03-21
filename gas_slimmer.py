JS_PATH = '/js/my_js_files/'
JS_PATH_MIN = '/js/min/'

MEDIA_JS = {
	'detail.js': [
		'utils.js',
		'detail.js'
		],
	'geocode.js' : ['geocode.js'],
	'list.js': [
		'libs/markerclusterer.min.js',
		'utils.js', 
		'list.js'
		],
	'cantidad.js' : [
		'g_cantidad.js'
		],
	'precio.js': [
		'libs/d3.v3.min.js',
		'g_map.js',
		'g_precio.js'
		]
	}

def get_js(target, debug=False):
	if debug:
		return [JS_PATH+s for s in MEDIA_JS[target]]
	else:
		return [JS_PATH_MIN+target]
