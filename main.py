#!/usr/bin/env python
# -*- coding: utf-8 -*-
    
from gasole_base import *
from gas_db import *
from google.appengine.api import users
from recaptcha import *
from google.appengine.api.mail import is_email_valid
from hashlib import md5
from secrets import SESSION_KEY
import urllib
import re
from gas_slimmer import *
from time import time
import datetime

TIME=0
def tic():
    global TIME 
    TIME = time();
def toc():
    global TIME
    logging.info("Tiempo transcurrido (ms): " + str((time()-TIME)*1000))

def decode_param(s):
    # return urllib.unquote(s.decode('utf-8'))
    return urllib.unquote(s.decode('utf-8')).replace("_", " ").replace("|", "/")

def get_points(s):
    try:
        return int(s)
    except ValueError:
        return None

class MainHandler(BaseAuthHandler):
    def get(self):
        if "_escaped_fragment_" in self.request.arguments():
            # logging.info(compute_stats(json.loads(getGasole().decode('zlib')).get("_data")))
            self.redirect("/static_html/home.html")
            return
        self.render("base.html",
            title = u"GasOle.net: el precio de la gasolina en España.",
            styles =['/css/home.css'],
            scripts=get_js('home.js',DEBUG),
            user=self.get_logged_user(),
            content="home.html",
            show_ads = not DEBUG,
            og={"title": u"GasOle.net",
                "desc": u"La gasolina más barata de España y las gasolineras mejor valoradas.",
                "url": u"http://www.gasole.net"})

# lista de resultados: Provincia, Ciudad o Búsqueda
class List(BaseAuthHandler):
    def get(self, province, city):
        title = "Gasolineras en " + (decode_param(city)+ ", " if city else "la ") + "provincia de " + decode_param(province)
        self.render("base.html", 
            title = title,
            styles=["/css/list.css"],
            scripts=get_js('list.js',DEBUG),
            user=self.get_logged_user(),
            content="list.html",
            show_ads = not DEBUG,
            og={"title": u"Todas las "+title,
                "desc": u"Precios y mapa de todas las gasolineras en GasOle.net",
                "url": self.request.url})

# Detalle de una gasolinera
class Detail(BaseAuthHandler):
    def get(self, province, town, station):
        # Vista de detalle de una gasolinera
        p = decode_param(province)
        t = decode_param(town)
        s = decode_param(station)
        address = s.replace(" [D]", " (m.d.)").replace(" [I]", " (m.i.)").replace(" [N]", "")
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
            user = self.get_logged_user(),
            content="detail.html",
            edit_station=edit_station,
            show_ads = not DEBUG,
            og={"title": title,
                "desc": u"Precios, datos históricos y opiniones de la gasolinera en GasOle.net",
                "url": self.request.url})

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
    def get(self,date=None):
        # when = None
        # if date:
        #     when = datetime.datetime.combine(datetime.date(*map(int,date.split("-"))), datetime.time(12))
        # info = getGasole(when).decode('zlib')
        info = getGasole().decode('zlib')
        self.response.headers['Content-Type'] = 'application/json; charset=utf-8'
        self.write(info)

# api de actualización de estaciones
class StationApi(BaseAuthHandler):
     def post(self,p,t,s):
        if not p or not t or not s:
            return
        pname = decode_param(p)
        tname = decode_param(t)
        sname = decode_param(s)
        # Actualización de datos de la gasolinera:
        if users.is_current_user_admin() and self.request.get("edit_station"):
            sdata = GasStation.get(db.Key.from_path('Province', pname, 'Town', tname, 'GasStation', sname))
            lat = self.request.get("lat")
            lon = self.request.get("lon")
            phone = self.request.get("phone")
            email = self.request.get("email")
            link = self.request.get("link")
            if lat and lon:
                sdata.geopt = db.GeoPt(float(lat), float(lon))
            if phone:
                sdata.phone = phone
            if email:
                sdata.email = email
            if link:
                sdata.link = link
            sdata.put()
            self.redirect("/ficha/"+p+"/"+t+"/"+s)

#api de comentarios de una gasolinera
class CommentsApi(BaseAuthHandler):
    def remove_html_tags(self,s):
        p = re.compile(r'<.*?>')
        return p.sub('', s)
    def clean_field(self,s):
        return self.remove_html_tags(urllib.unquote(s).strip())
    def get(self,p,t,s):
        self.response.headers['Content-Type'] = 'application/json; charset=utf-8'
        comments = get_comments(decode_param(p), decode_param(t), decode_param(s))
        self.write(json.dumps(comments))
    def post(self,p,t,s):
        if not p or not t or not s:
            return
        pname = decode_param(p)
        tname = decode_param(t)
        sname = decode_param(s)
        # Creación de un nuevo comentario sobre una estación
        errors = []
        result = {}
        user = None
        if self.logged_in:
            user = self.current_user
        else:
            name=self.clean_field(self.request.get("c_name"))
            if not name:
                errors.append("no_name")
            email=self.clean_field(self.request.get("c_email")).lower()
            if not email:
                errors.append("no_email")
            elif not is_email_valid(email):
                errors.append("nv_email")
            if not len(errors):
                hashemail = md5(email).hexdigest()
                avatar = "http://www.gravatar.com/avatar/"+hashemail+"?s=100&d="+urllib.quote_plus(u'http://www.gasole.net/img/avatar.png')
                link = self.clean_field(self.request.get("c_link"))
                self._on_signin({'name':name,'link':link,'avatar':avatar,'id':hashemail}, None, provider='gasole',redirect=False)
                user = self.current_user
                self.auth.unset_session()
        replyto = self.request.get("c_replyto")
        points = None
        if not replyto:
            points=get_points(self.request.get("c_points"))
            if not points:
                errors.append("no_points")
            else:
                points=int(points)
        content=self.clean_field(self.request.get("c_content"))
        if not content:
            errors.append("no_content")
        challenge_field = self.clean_field(self.request.get("recaptcha_challenge_field"))
        response_field = self.clean_field(self.request.get("recaptcha_response_field"))
        try:
            captcha_result = verifyCaptcha(
                challenge_field=challenge_field,
                response_field=response_field,
                remote_ip=self.request.remote_addr)
            if not captcha_result.is_valid:
                errors.append("bad_captcha")
        except:
            errors.append("err_captcha")
        if not len(errors):
            new_id = add_comment(pname, tname, sname, user, points, content, replyto)
            if new_id!=None:
                result["OK"] = new_id
            else:
                errors.append("server_error")
        result["ERROR"] = errors
        self.response.headers['Content-Type'] = 'application/json; charset=utf-8'
        self.write(json.dumps(result))

# API de históricos de una gasolinera
class HistoryApi(BaseHandler):
    def get(self,p,t,s):
        self.response.headers['Content-Type'] = 'application/json; charset=utf-8'
        history = get_history(decode_param(p), decode_param(t), decode_param(s))
        self.write(history)

# class GeoApi(BaseHandler):
#     def get(self, place, lat, lon, dist):
#         self.render_json({"_near": place, "_data": get_near(lat=float(lat), lon=float(lon), dist=float(dist))})

class SearchResults(BaseAuthHandler):
    def get(self, place, lat, lon, dist):
        place = decode_param(place)
        title = "Gasolineras cerca de " + place
        self.render("base.html", 
            title = title,
            styles=["/css/list.css"],
            scripts=get_js('list.js',DEBUG),
            user=self.get_logged_user(),
            content="list.html",
            og={"title": title,
                "desc": u"Búsqueda de gasolineras en GasOle.net, cerca de "+place,
                "url": self.request.url})

class SearchRoute(BaseAuthHandler):
    def get(self, place1, place2):
        place1 = decode_param(place1)
        place2 = decode_param(place2)
        title = "Gasolineras entre " + place1 + " y " + place2
        self.render("base.html", 
            title = title,
            styles=["/css/list.css"],
            scripts=get_js('list.js',DEBUG),
            user=self.get_logged_user(),
            content="list.html",
            og={"title": title,
                "desc": u"Gasolineras en ruta entre "+place1+" y "+place2,
                "url": self.request.url})

class Info(BaseAuthHandler):
    def get(self, section):
        logging.info(section)
        title=""
        desc=""
        content=""
        scripts=get_js('info.js',DEBUG)
        styles=["/css/info.css"]
        canonical=u"http://gasole.net/info/"
        if section=="combustibles":
            content="info_combustibles.html"
            canonical+="combustibles"
            title=u"Información sobre gasolina y otros combustibles en España"
            desc=u"Aquí encontrarás datos sobre los tipos de combustible a la venta en España y los impuestos que se aplican"
        elif section=="tarjetas":
            content="info_tarjetas.html"
            canonical+="tarjetas"
        elif section=="noticias":
            content="info_noticias.html"
            styles = ["/css/noticias.css"]
            canonical+="noticias"
            title=u"Recortes de prensa sobre gasolinas e hidrocarburos"
            desc=u"Noticias recopiladas de los principales medios de comunicación sobre el mundo de la gasolina y otros combustibles"
        elif section=="acercade":
            content="info_acercade.html"
            styles = ["/css/acercade.css"]
            canonical+="acercade"
            title=u"Información acerca de GasOle.net"
            desc=u"Condiciones de uso de esta página, política de privacidad y agradecimientos"
        self.render("base.html",
            content=content,
            scripts=scripts,
            styles=styles,
            user=self.get_logged_user(),
            og={"title": title,
                "desc": desc,
                "url": canonical})

def handle_404(request, response, exception):
    #http://webapp-improved.appspot.com/guide/exceptions.html
    logging.info(request)
    logging.exception(exception)
    response.set_status(404)
    response.write(jinja_env.get_template("404.html").render())

def handle_500(request, response, exception):
    logging.exception(exception)
    response.set_status(500)
    response.write(jinja_env.get_template("500.html").render())

class Stats(BaseAuthHandler):
    def get(self):
        self.render("base.html",
            title = u"Gráficos: el precio de la gasolina y su distribución en España.",
            scripts = get_js('charts.js',DEBUG),
            styles  = ['/css/graficos.css'],
            user=self.get_logged_user(),
            content = "charts.html",
            og={"title": u"Gráficos de gasolinas en GasOle.net",
                "desc": u"Gráficos del precio de la gasolina y la densidad de gasolineras en España..",
                "url": self.request.url})
        
# class StatsApi(BaseHandler):
#     def get(self, prov, town):
#         info = {}
#         if not prov and not town:
#             # info = memcache.get("stats");
#             # if not info:
#             #     info = compute_stats()
#             #     memcache.set("stats", info)
#             self.render_json(compute_stats())

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
    ('/?', MainHandler),
    ('/graficos/?', Stats),
    # ('/stats/?([^ \/]+)?/?([^ \/]+)?/?', StatsApi),
    # ('/data/(\w+)/(\w+)', Data),
    ('/gasolineras/?([^ \/]+)/?([^ \/]+)?/?', List),
    ('/ficha/?([^ \/]+)/?([^ \/]+)?/?([^ \/]+)?', Detail),
    ('/api/gasole', Api),
    # ('/geo/(.+)/(.+)/(.+)/(.+)/?', GeoApi),
    ('/resultados/(.+)/(.+)/(.+)/(.+)/?', SearchResults),
    ('/ruta/(.+)/(.+)/?', SearchRoute),
    ('/info/(noticias|acercade|combustibles)/?', Info),
    webapp2.Route(r'/api/c/<p>/<t>/<s>', handler=CommentsApi, name='comments-api'), # comentarios
    webapp2.Route(r'/api/h/<p>/<t>/<s>', handler=HistoryApi, name='history-api'),   # históricos
    webapp2.Route(r'/api/s/<p>/<t>/<s>', handler=StationApi, name='station-api'),   # actualización de info
    webapp2.Route('/login/<provider>', handler=BaseAuthHandler, name='auth_login', handler_method='_login'),
    webapp2.Route('/login/<provider>/callback', handler=BaseAuthHandler, name='auth_callback', handler_method='_auth_callback'),
    webapp2.Route('/logout', handler=BaseAuthHandler, name='auth_logout', handler_method='_logout'),
], debug=True, config=app_config)

app.error_handlers[404] = handle_404
app.error_handlers[500] = handle_500