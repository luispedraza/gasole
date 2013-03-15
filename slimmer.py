#!/usr/bin/env python
# -*- coding: utf-8 -*-

from slimit import minify
from gas_slimmer import *


MEDIA_JS_PATH = '/static/js/'
MEDIA_JS_OUPUT = '/static/js/min/'


for target in MEDIA_JS:
	scripts = MEDIA_JS[target]
	source = ""
	for s in scripts:
		source += open("."+MEDIA_JS_PATH+s, 'r').read()+"\n"
	output = open("."+MEDIA_JS_OUPUT+target, 'w+')
	output.write(minify(source))
	output.close()


