#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sys
if 'lib' not in sys.path:
    sys.path.insert(0, 'libs')
    
from gasole_base import *
from gas_update import *
from gas_maps import *
from gas_db import *
from google.appengine.api import users
from recaptcha import *
from google.appengine.api.mail import is_email_valid
from hashlib import md5
from secrets import SESSION_KEY
import urllib
import re
from gas_slimmer import *
from gas_stats import *
from time import time

TIME=0

def tic():
    global TIME 
    TIME = time();
def toc():
    global TIME
    logging.info("Tiempo transcurrido (ms): " + str((time()-TIME)*1000))


def decode_param(s):
    return s.decode('utf-8').replace("_", " ").replace("|", "/")

def remove_html_tags(data):
    p = re.compile(r'<.*?>')
    return p.sub('', data)

def get_points(s):
    try:
        return int(s)
    except ValueError:
        return None

class MainHandler(BaseAuthHandler):
    def get(self):
        self.render("base.html", 
            title = u"GasOle.net: Gasolina barata en España.",
            styles =['/css/home.css'],
            scripts=get_js('home.js',DEBUG),
            content=jinja_env.get_template("home.html").render(
                map=jinja_env.get_template("spain.svg").render()))

class AdminHandler(BaseHandler):
    def get(self):
        log_url = users.create_login_url(self.request.uri)
        log_text = 'Login'
        if self.user:
            log_url = users.create_logout_url(self.request.uri)
            log_text = 'Logout'
        self.render("admin_main.html",
            log_url = log_url,
            log_text = log_text)

class AdminUpdate(BaseHandler):
    def get(self, method):
        if method and method=="csv":
            self.render("admin_update_csv.html",
            	options=FUEL_OPTIONS,
                csv_data=None)
        elif not method or method=="xls":
            self.render("admin_update_xls.html",
                options=FUEL_OPTIONS,
                xls_data=None)
        else:
            self.redirect("/")

    def post(self, method):
    	option = self.request.get("option")
        data = None
        if method and method=="csv":
            data = gas_update_csv(option)
            self.render("admin_update_csv.html",
                options=FUEL_OPTIONS,
                data=data)
        elif not method or method=="xls":
            data = gas_update_xls(option)
            self.render("admin_update_xls.html",
                options=FUEL_OPTIONS,
                data=data)
        if self.request.get("updatedb"):
                data2store(data.data)

class AdminSearch(BaseHandler):
    def get(self):
        self.render("admin_search.html",
            options = FUEL_OPTIONS,
            provs = PROVS)
    def post(self):
        option = self.request.get("option")
        prov = self.request.get("prov")
        update = self.request.get("updatedb")
        data = gas_update_search(prov=prov, option=option)
        static_map = ""
        if data:
            markers = filter(None, [d[-1] for d in data])
            static_map = get_static_map(markers[:50])
        self.render("admin_search.html",
            options = FUEL_OPTIONS,
            provs = PROVS,
            data = data,
            static_map = static_map)
        if update:
            _geodata = []
            data = data.data
            for p in data.keys():
                for t in data[p].keys():
                    for s in data[p][t].keys():
                        if data[p][t][s].has_key("latlon") and data[p][t][s]["latlon"]:
                            station = GasStation.get(db.Key.from_path('Province', p, 'Town', t, 'GasStation', s))
                            if station:
                                station.geopt = db.GeoPt(lat = data[p][t][s]["latlon"][1], lon = data[p][t][s]["latlon"][0])
                                _geodata.append(station)
            db.put(_geodata)
            logging.info("guardadas %s posiciones" %len(_geodata))

class Stats(BaseAuthHandler):
    def get(self, g_type, province, city):
        if not province and not city:
            pass
        the_scripts = []
        the_styles = []
        title = ""
        if (g_type=="precio"):
            the_scripts = get_js('precio.js',DEBUG)
            the_styles=['/css/graficos.css']
            title = u"El Precio del Combustible en España."
        elif (g_type=="cantidad"):
            the_scripts = [GOOGLE_MAPS_VIS_API, MAPBOX_API]+get_js('cantidad.js',DEBUG)
            the_styles=["/css/g_cantidad.css", MAPBOX_CSS]
        elif (g_type=="variedad"):
            the_scripts = [GOOGLE_MAPS_VIS_API, 
                '/js/stats.js', 
                '/js/libs/polymaps.min.js', 
                '/js/libs/jquery.min.js', 
                '/js/libs/raphael.min.js', 
                '/js/libs/kartograph.min.js',
                'http://d3js.org/d3.v3.min.js']
            the_styles=["/css/g_variedad.css"]
        self.render("base.html",
            title=u"Gráficos: "+title,
            scripts = the_scripts,
            styles  = the_styles,
            content = jinja_env.get_template("g_"+g_type+".html").render(
                map = jinja_env.get_template("spain.svg").render()))

class Data(BaseAuthHandler):
    def get(self, option, province):
        data = get_means(option)
        self.render_json(data)

class List(BaseAuthHandler):
    def get(self, province, city):
        title = "Gasolineras en " + (decode_param(city)+ ", " if city else "la ") + "provincia de " + decode_param(province)
        self.render("base.html", 
            title = title,
            styles=["/css/list.css"],
            scripts=get_js('list.js',DEBUG),
            content=jinja_env.get_template("list.html").render())

class Detail(BaseAuthHandler):
    def get(self, province, town, station, error={}, result=None):
        user = {}
        if self.logged_in:
            user = self.current_user
        # Vista de detalle de una gasolinera
        data = {}
        if error:
            data = {k: self.request.get(k) for k in self.request.arguments()}
        p = decode_param(province)
        t = decode_param(town)
        s = decode_param(station)
        address = s.replace(" [D]", " (margen der.)").replace(" [I]", " (margen izq.)").replace(" [N]", "")
        title = "Gasolinera en " + address + ", " + t
        edit_station = {}
        if users.is_current_user_admin():
            sdata = GasStation.get(db.Key.from_path('Province', p, 'Town', t, 'GasStation', s))
            if sdata:
                edit_station = {k: getattr(sdata,k) or "" for k in sdata.properties()}
        self.render("base.html",
            title = title,
            styles=['/css/detail.css'],
            scripts=get_js('detail.js',DEBUG),
            content=jinja_env.get_template("detail.html").render(
                title=title,
                edit_station=edit_station,
                data=data,
                error=error,
                result=result,
                user=user
                ))
    def post(self, province, town, station):
        p = decode_param(province)
        t = decode_param(town)
        s = decode_param(station)
        # Actualización de datos de la gasolinera:
        if users.is_current_user_admin() and self.request.get("edit_station"):
            sdata = GasStation.get(db.Key.from_path('Province', p, 'Town', t, 'GasStation', s))
            sdata.geopt = db.GeoPt(float(self.request.get("lat")), float(self.request.get("lon")))
            sdata.phone = self.request.get("phone")
            sdata.email = self.request.get("email")
            sdata.link = self.request.get("link")
            sdata.put()
            self.get(province=province, town=town, station=station)
            return
        # Creación de un nuevo comentario sobre una estación
        error = {}
        user = {}
        if self.logged_in:
            user = self.current_user
        else:
            name=remove_html_tags(self.request.get("c_name").strip())
            if not name:
                error["c_name"] = u"Debes indicar tu nombre en el comentario."
            email=self.request.get("c_email").strip().lower()
            if not email:
                error["c_email"] = u"Debes indicar tu dirección de correo electrónico (no será guardada ni mostrada)."
            elif not is_email_valid(email):
                error["c_email"] = u"La dirección de correo electrónico no es válida."
            if not len(error):
                hashemail = md5(email).hexdigest()
                avatar = "http://www.gravatar.com/avatar/"+hashemail+"?s=100&d="+urllib.quote_plus(u'http://www.gasole.net/img/avatar.png')
                link = self.request.get("c_link").strip()
                self._on_signin({'name':name,'link':link,'avatar':avatar,'id':hashemail}, None, provider='gasole',redirect=False)
                user = self.current_user
                self.auth.unset_session()
        replyto = self.request.get("c_replyto")
        points = None
        if not replyto:
            points=get_points(self.request.get("c_points"))
            if not points:
                error["c_points"] = u"Olvidaste valorar esta gasolinera."
            else:
                points=int(points)
        content=remove_html_tags(self.request.get("c_content").strip())
        if not content:
            error["c_content"] = u"El texto del comentario está vacío."
        challenge_field = self.request.get("recaptcha_challenge_field")
        response_field = self.request.get("recaptcha_response_field")
        captcha_result = verifyCaptcha(
            challenge_field=challenge_field,
            response_field=response_field,
            remote_ip=self.request.remote_addr)
        if not captcha_result.is_valid:
             error["c_captcha"] = u"La solución del captcha no es correcta."
        result = None
        if not len(error) and user:
            comment = Comment(
                userid=user.key.id(),
                name=user.name,
                avatar=db.Link(user.avatar_url),
                link=user.link,
                points=db.Rating(points) if points!=None else None,
                content=db.Text(content),
                replyto=int(replyto) if replyto else None,
                parent=db.Key.from_path('Province',p,'Town',t,'GasStation',s))
            comment.put()
            result = "El comentario se ha publicado con éxito."
        self.get(province=province, town=town, station=station, error=error, result=result)

# class Gzip(BaseHandler):
#     def get(self, prov, town, station):
#         tic()
#         info = {}
#         if prov:
#             prov = decode_param(prov)
#             data = memcache.get("gzip"+prov) or store2data(prov_kname=prov).get(prov)
#             logging.info(type(data))
#         self.response.headers['Content-Type'] = 'application/json/gzip; charset=utf-8'
#         self.response.headers['Content-Encoding'] = 'gzip'
#         self.write(data)
#         toc()

class Api(BaseHandler):
    def get(self, prov, town, station):
        tic()
        info = None
        prov = decode_param(prov)
        if station:
            info = getStationJson(prov, decode_param(town), decode_param(station))
        elif prov=="All":
            info = memcache.get("All").decode('zlib')
        else:
            info = getProvinceJson(prov)
        self.response.headers['Content-Type'] = 'application/json; charset=utf-8'
        self.write(info)
        toc()

class StatsApi(BaseHandler):
    def get(self, prov, town):
        info = {}
        if not prov and not town:
            info = compute_stats()
            self.render_json(info)


class GeoApi(BaseHandler):
    def get(self, place, lat, lon, dist):
        self.render_json({"_near": place, "_data": get_near(lat=float(lat), lon=float(lon), dist=float(dist))})

class SearchResults(BaseAuthHandler):
    def get(self, place, lat, lon, dist):
        title = "Gasolineras cerca de " + decode_param(place)
        self.render("base.html", 
            title = title,
            styles=["/css/list.css"],
            scripts=[GOOGLE_MAPS_API]+get_js('list.js',DEBUG),
            content=jinja_env.get_template("list.html").render())

class Info(BaseAuthHandler):
    def get(self, section):
        content_html = ""
        if section=="combustibles":
            content_html="info_combustibles.html"
        elif section=="tarjetas":
            content_html="info_tarjetas.html"
        elif section=="noticias":
            content_html="info_noticias.html"
        self.render("base.html",
            content=jinja_env.get_template(content_html).render())

def handle_404(request, response, exception):
    #http://webapp-improved.appspot.com/guide/exceptions.html
    logging.exception(exception)
    response.set_status(404)
    response.write(jinja_env.get_template("404.html").render())
    
def handle_500(request, response, exception):
    logging.exception(exception)
    response.set_status(500)
    response.write(jinja_env.get_template("500.html").render())
    
# webapp2 config
app_config = {
    'webapp2_extras.sessions': {
        'cookie_name': '_simpleauth_sess',
        'secret_key': SESSION_KEY
        },
    'webapp2_extras.auth': {
        'user_attributes': []
        }
    }


app = webapp2.WSGIApplication([
    ('/', MainHandler),
    ('/admin/?', AdminHandler),
    ('/admin/update/?(\w+)?', AdminUpdate),
    ('/admin/search/?', AdminSearch),
    ('/graficos/([^ \/]+)/?([^ \/]+)?/?([^ \/]+)?/?', Stats),
    ('/stats/?([^ \/]+)?/?([^ \/]+)?/?', StatsApi),
    ('/data/(\w+)/(\w+)', Data),
    ('/gasolineras/?([^ \/]+)/?([^ \/]+)?/?', List),
    ('/ficha/?([^ \/]+)/?([^ \/]+)?/?([^ \/]+)?', Detail),
    ('/api/?([^ \/]+)/?([^ \/]+)?/?([^ \/]+)?', Api),
    ('/geo/(.+)/(.+)/(.+)/(.+)/?', GeoApi),
    ('/resultados/(.+)/(.+)/(.+)/(.+)/?', SearchResults),
    ('/info/(noticias|tarjetas|combustibles)/?', Info),
    webapp2.Route('/login/<provider>', handler=BaseAuthHandler, name='auth_login', handler_method='_login'),
    webapp2.Route('/login/<provider>/callback', handler=BaseAuthHandler, name='auth_callback', handler_method='_auth_callback'),
    webapp2.Route('/logout', handler=BaseAuthHandler, name='auth_logout', handler_method='_logout'),
], debug=True, config=app_config)

app.error_handlers[404] = handle_404
app.error_handlers[500] = handle_500