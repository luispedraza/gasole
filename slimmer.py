#!/usr/bin/env python
# -*- coding: utf-8 -*-

from slimit import minify
from gas_slimmer import *
import rcssmin

MEDIA_JS_PATH = '/static/js/'
MEDIA_JS_OUPUT = '/static/js/min/'


for target in MEDIA_JS:
	scripts = MEDIA_JS[target]
	print scripts
	source = ""
	for s in scripts['src']:
		source += open("."+MEDIA_JS_PATH+s, 'r').read()+"\n"
	output = open("."+MEDIA_JS_OUPUT+target, 'w+')
	output.write(minify(source))
	output.close()


