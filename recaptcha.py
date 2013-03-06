import urllib2, urllib

VERIFY_SERVER="http://www.google.com/recaptcha/api/verify"
CAPTCHA_PUBLIC_KEY = "6Lfg290SAAAAAF7lz7UcKF7Sn0KOCQne8TWwqjAF"
CAPTCHA_PRIVATE_KEY = "6Lfg290SAAAAAGMlKrgAiWE5_-5THwbuAv0NcoLm"

class RecaptchaResponse(object):
	def __init__(self, is_valid, error_code=None):
		self.is_valid = is_valid
		self.error_code = error_code

def verifyCaptcha(
	challenge_field,
	response_field,
	remote_ip):
	if not (response_field and challenge_field and len (response_field) and len (challenge_field)):
		return RecaptchaResponse (is_valid = False, error_code = 'incorrect-captcha-sol')
	def encode_if_necessary(s):
		if isinstance(s, unicode):
			return s.encode('utf-8')
		return s
	params = urllib.urlencode ({
		'privatekey': CAPTCHA_PRIVATE_KEY,
		'remoteip' :  encode_if_necessary(remote_ip),
		'challenge':  encode_if_necessary(challenge_field),
		'response' :  encode_if_necessary(response_field),
		})
	request = urllib2.Request (
		url = VERIFY_SERVER,
		data = params,
		headers = {
			"Content-type": "application/x-www-form-urlencoded",
			"User-agent": "reCAPTCHA Python"
			}
		)
	
	httpresp = urllib2.urlopen(request)
	return_values = httpresp.read().splitlines();
	httpresp.close();
	return_code = return_values[0]
	if (return_code == "true"):
		return RecaptchaResponse(is_valid=True)
	else:
		return RecaptchaResponse(is_valid=False, error_code = return_values[1])