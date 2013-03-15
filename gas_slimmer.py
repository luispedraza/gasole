JS_PATH = '/js/'
JS_PATH_MIN = '/js/min/'

MEDIA_JS = {
	'detail.js': [
		'utils.js',
		'detail.js'
		],
	'geocode.js' : ['geocode.js'],
	'list.js': [
		'libs/markerclusterer_compiled.js',
		'utils.js', 
		'list.js'
		]
	}

def get_js(target, debug=False):
	if debug:
		return [JS_PATH+s for s in MEDIA_JS[target]]
	else:
		return [JS_PATH_MIN+target]
