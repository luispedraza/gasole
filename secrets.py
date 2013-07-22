# Copy this file into secrets.py and set keys, secrets and scopes.

# This is a session secret key used by webapp2 framework.
# Get 'a random and long string' from here: 
# http://clsc.net/tools/random-string-generator.php
# or execute this from a python shell: import os; os.urandom(64)
SESSION_KEY = "3G2qgHj1hdt8Or14Bh9ISjZ1g01F9p0p"

# Google APIs
GOOGLE_APP_ID = '176787073068.apps.googleusercontent.com'
GOOGLE_APP_SECRET = '0bQW04GwazaZ6NGG6W75cado'

# Facebook auth apis
FACEBOOK_APP_ID = ' 490761724315971'
FACEBOOK_APP_SECRET = '2767adcf73fe6bd67a55c0a480a89c86'

# https://www.linkedin.com/secure/developer
# LINKEDIN_CONSUMER_KEY = 'consumer key'
# LINKEDIN_CONSUMER_SECRET = 'consumer secret'

# https://manage.dev.live.com/AddApplication.aspx
# https://manage.dev.live.com/Applications/Index
# WL_CLIENT_ID = 'client id'
# WL_CLIENT_SECRET = 'client secret'

# https://dev.twitter.com/apps
TWITTER_CONSUMER_KEY = 'rS5bk7yQiJJdNqfpzQDFHA'
TWITTER_CONSUMER_SECRET = 'HNEXUHIBisqHcgmrxpcyC7WB1P4rZlgLreslwpyWA'

# https://foursquare.com/developers/apps
FOURSQUARE_CLIENT_ID = 'T4NRI1OJGWCDRVGI5N2WM0PBAKA1LEWSQKJNOQLAL5RPSP32'
FOURSQUARE_CLIENT_SECRET = 'SXEPJQ4BLPI2A3YO2M3BWHIREDPBX0LDFX0VXBC3S2ET3YQW'

# config that summarizes the above
AUTH_CONFIG = {
  # OAuth 2.0 providers
  'google'      : (GOOGLE_APP_ID, GOOGLE_APP_SECRET,
                  'https://www.googleapis.com/auth/userinfo.profile'),
  'facebook'    : (FACEBOOK_APP_ID, FACEBOOK_APP_SECRET,
                  'user_about_me'),
  # 'windows_live': (WL_CLIENT_ID, WL_CLIENT_SECRET,
  #                 'wl.signin'),
  'foursquare'  : (FOURSQUARE_CLIENT_ID,FOURSQUARE_CLIENT_SECRET,
                  'authorization_code'),

  # OAuth 1.0 providers don't have scopes
  'twitter'     : (TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET),
  # 'linkedin'    : (LINKEDIN_CONSUMER_KEY, LINKEDIN_CONSUMER_SECRET),

  # OpenID doesn't need any key/secret
}
