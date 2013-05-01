from gasole_base import *
from math import floor
from time import time
from urllib import urlencode, urlopen
# http://tripleodeon.com/2009/03/python-google-adsense-for-mobile-code/
def google_ad(request):
	# logging.info(request.environ)
	is_secure = (request.url.find("https:")==0)
	scheme = 'https://' if is_secure else 'http://'
	params = {
		'ad_type':'text_image',
		'channel':'',
		'client':'ca-mb-pub-9285487390483271',
		'dt':int(floor(1000*time())),
		'format':'mobile_single',
		'https': request.environ['HTTPS'],
		'host': scheme + request.headers.get('Host'),
		'ip':request.remote_addr,
		'markup':'xhtml',
		'oe':'utf8',
		'output':'xhtml',
		'ref':request.referer,
		'url':request.url,
		'useragent':request.headers.get('User-Agent'),
		'u_w': 300,
		'u_h': 600,
		'slotname': '5391581120'
	}
	logging.info(request.body_file.getvalue())
	logging.info(request.get('HTTP_X_UP_DEVCAP_SCREENPIXELS'))
	logging.info(params)
	url = 'http://pagead2.googlesyndication.com/pagead/ads?' + urlencode(params)
	logging.info(url)
	return urlopen(url).read()


class MobileHandler(BaseHandler):
	def get(self):
		self.render("mobile.html", ads=google_ad(self.request))


# webapp2 config
app_config = {
	'webapp2_extras.sessions': {
		'cookie_name': '_simpleauth_sess',
		'secret_key': 'Ym5Dn5l1vr5EIA9358WRDp03JRddn5DN7aXMX69se9L6a04q02'
		},
	'webapp2_extras.auth': {
		'user_attributes': []
		}
	}


app = webapp2.WSGIApplication([
	('/m', MobileHandler)
], debug=True, config=app_config)


# <?php

# $GLOBALS['google']['client']='ca-mb-pub-9285487390483271';
# $GLOBALS['google']['https']=read_global('HTTPS');
# $GLOBALS['google']['ip']=read_global('REMOTE_ADDR');
# $GLOBALS['google']['markup']='xhtml';
# $GLOBALS['google']['output']='xhtml';
# $GLOBALS['google']['ref']=read_global('HTTP_REFERER');
# $GLOBALS['google']['slotname']='5391581120';
# $GLOBALS['google']['url']=read_global('HTTP_HOST') . read_global('REQUEST_URI');
# $GLOBALS['google']['useragent']=read_global('HTTP_USER_AGENT');
# $google_dt = time();
# google_set_screen_res();
# google_set_muid();
# google_set_via_and_accept();
# function read_global($var) {
#   return isset($_SERVER[$var]) ? $_SERVER[$var]: '';
# }

# function google_append_url(&$url, $param, $value) {
#   $url .= '&' . $param . '=' . urlencode($value);
# }

# function google_append_globals(&$url, $param) {
#   google_append_url($url, $param, $GLOBALS['google'][$param]);
# }

# function google_append_color(&$url, $param) {
#   global $google_dt;
#   $color_array = explode(',', $GLOBALS['google'][$param]);
#   google_append_url($url, $param,
#                     $color_array[$google_dt % count($color_array)]);
# }

# function google_set_screen_res() {
#   $screen_res = read_global('HTTP_UA_PIXELS');
#   if ($screen_res == '') {
#     $screen_res = read_global('HTTP_X_UP_DEVCAP_SCREENPIXELS');
#   }
#   if ($screen_res == '') {
#     $screen_res = read_global('HTTP_X_JPHONE_DISPLAY');
#   }
#   $res_array = preg_split('/[x,*]/', $screen_res);
#   if (count($res_array) == 2) {
#     $GLOBALS['google']['u_w']=$res_array[0];
#     $GLOBALS['google']['u_h']=$res_array[1];
#   }
# }

# function google_set_muid() {
#   $muid = read_global('HTTP_X_DCMGUID');
#   if ($muid != '') {
#     $GLOBALS['google']['muid']=$muid;
#      return;
#   }
#   $muid = read_global('HTTP_X_UP_SUBNO');
#   if ($muid != '') {
#     $GLOBALS['google']['muid']=$muid;
#      return;
#   }
#   $muid = read_global('HTTP_X_JPHONE_UID');
#   if ($muid != '') {
#     $GLOBALS['google']['muid']=$muid;
#      return;
#   }
#   $muid = read_global('HTTP_X_EM_UID');
#   if ($muid != '') {
#     $GLOBALS['google']['muid']=$muid;
#      return;
#   }
# }

# function google_set_via_and_accept() {
#   $ua = read_global('HTTP_USER_AGENT');
#   if ($ua == '') {
#     $GLOBALS['google']['via']=read_global('HTTP_VIA');
#     $GLOBALS['google']['accept']=read_global('HTTP_ACCEPT');
#   }
# }

# function google_get_ad_url() {
#   $google_ad_url = 'http://pagead2.googlesyndication.com/pagead/ads?';
#   google_append_url($google_ad_url, 'dt',
#                     round(1000 * array_sum(explode(' ', microtime()))));
#   foreach ($GLOBALS['google'] as $param => $value) {
#     if (strpos($param, 'color_') === 0) {
#       google_append_color($google_ad_url, $param);
#     } else if (strpos($param, 'url') === 0) {
#       $google_scheme = ($GLOBALS['google']['https'] == 'on')
#           ? 'https://' : 'http://';
#       google_append_url($google_ad_url, $param,
#                         $google_scheme . $GLOBALS['google'][$param]);
#     } else {
#       google_append_globals($google_ad_url, $param);
#     }
#   }
#   return $google_ad_url;
# }

# $google_ad_handle = @fopen(google_get_ad_url(), 'r');
# if ($google_ad_handle) {
#   while (!feof($google_ad_handle)) {
#     echo fread($google_ad_handle, 8192);
#   }
#   fclose($google_ad_handle);
# }

# ?>
