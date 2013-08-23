var Lat2Km = 111.03461;
var Km2Lat = 0.009006;
var Lon2Km = 85.39383;
var Km2Lon = 0.01171;
var LL2Km = 98.2;
var Km2LL = 0.010183;

var FUEL_OPTIONS = {"1": {"short": "G95", "name": "Gasolina 95"},
				"3": {"short": "G98", "name": "Gasolina 98"},
				"4": {"short": "GOA", "name": "Gasóleo Automoción"},
				"5": {"short": "NGO", "name": "Nuevo Gasóleo A"},
				"6": {"short": "GOB", "name": "Gasóleo B"},
				"7": {"short": "GOC", "name": "Gasóleo C"},
				"8": {"short": "BIOD", "name": "Biodiésel"}};
var CHART_OPTIONS = [
	{id: "G98", color: "#339933", name: "Gasolina 98"},
	{id: "G95", color: "#006633", name: "Gasolina 95"},
	{id: "NGO", color: "#aaa", name: "Nuevo Gasóleo A"},
	{id: "BIOD", color: "#f1aa41", name: "Biodiésel"},
	{id: "GOA", color: "#000", name: "Gasóleo Automoción"},
	{id: "GOC", color: "#FF3300", name: "Gasóleo C"},
	{id: "GOB", color: "#CC3333", name: "Gasóleo B"}];

var PROVS = {
	"Álava": "01",
	"Albacete": "02",
	"Alicante": "03",
	"Almería": "04",
	"Asturias": "33",
	"Ávila": "05",
	"Badajoz": "06",
	"Balears (Illes)": "07",
	"Barcelona": "08",
	"Burgos": "09",
	"Cáceres": "10",
	"Cádiz": "11",
	"Cantabria": "39",
	"Castellón / Castelló": "12",
	"Ceuta": "51",
	"Ciudad Real": "13",
	"Córdoba": "14",
	"Coruña (A)": "15",
	"Cuenca": "16",
	"Girona": "17",
	"Granada": "18",
	"Guadalajara": "19",
	"Guipúzcoa": "20",
	"Huelva": "21",
	"Huesca": "22",
	"Jaén": "23",
	"León": "24",
	"Lleida": "25",
	"Lugo": "27",
	"Madrid": "28",
	"Málaga": "29",
	"Melilla": "52",
	"Murcia": "30",
	"Navarra": "31",
	"Ourense": "32",
	"Palencia": "34",
	"Palmas (Las)": "35",
	"Pontevedra": "36",
	"Rioja (La)": "26",
	"Salamanca": "37",
	"Santa Cruz De Tenerife": "38",
	"Segovia": "40",
	"Sevilla": "41",
	"Soria": "42",
	"Tarragona": "43",
	"Teruel": "44",
	"Toledo": "45",
	"Valencia / València": "46",
	"Valladolid": "47",
	"Vizcaya": "48",
	"Zamora": "49",
	"Zaragoza": "50"};

// Meses del año
var MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

// Colores de precio mínimo, máximo y medio de un resultado
var COLORS = {
	stroke: "#fff",
	min: "#36AE34",
	max: "#f00",
	mu: "#3399CC"
}

var LS_EXPIRE = 3600000;				// Expiración de localStorage, 1 hora

// Para agregar eventos 
function addEvent(el, evnt, func) {
	if(el.addEventListener) {
		el.addEventListener(evnt, func, false);
	} else if(el.attachEvent) {
		el.attachEvent('on'+evnt, func);
	}
}

// ie8
// getelementsbyclassname 
// http://stackoverflow.com/questions/9568969/getelementsbyclassname-ie8-object-doesnt-support-this-property-or-method
function getAllElementsByClassName(obj,cn){
    if(document.getElementsByClassName) // Returns NodeList here
        return obj.getElementsByClassName(cn);
    // IE8-
    cn = cn.replace(/ *$/, '');
    if(document.querySelectorAll) // Returns NodeList here
        return obj.querySelectorAll((' ' + cn).replace(/ +/g, '.'));
        
}



/* Bloqueo de scroll en el body cuando se hace scroll en un elemento */
function lockScroll(id) {
	if (typeof id=="string") id = document.getElementById(id);
	addEvent(id,"mouseover", function() {document.body.style.overflow = "hidden";})
	addEvent(id,"mouseout", function() {document.body.style.overflow = "auto";})
}

/* Lista de provincias para incluir en un div de ID dado, un acción a ejecutar en el click.
Si el callback es null se agrega un enlace a la página de la provincia */
function initProvLinks(id, callback) {
	var place = document.getElementById(id);
	for (var p in PROVS) {
		var li = document.createElement("li");
		li.id = "plist-"+PROVS[p];
		if (callback) {
			li.textContent = p;
			li.onclick = callback;
		} else {
			var a = document.createElement("a");
			a.title = "Todas las gasolineras de "+p;
			a.textContent = p;
			a.href = "/gasolineras/"+encodeName(p);
			li.appendChild(a);	
		}
		place.appendChild(li);
	}
	lockScroll(place);		// Además se bloquea en scroll de la página
}

/* Obtener nombre de provincia a partir de id */
function getProvName(id) {for (k in PROVS) if (PROVS[k] == id) return k;}

/* Elimina el etiquetado HTML de un texto para su envío al servidor */
function clearHtmlTags(s) {return s.replace(/(<([^>]+)>)/ig,"")}
/* Elimina errores y uniformiza nombres de direcciones de gasolineras */
function toTitle(s) {
	return s.replace(" [N]", "")
		.replace(/^CARRETERA ?|^CR\.? ?/i, "CTRA. ")
		.replace(/(CTRA. )+/i, "CTRA. ")
		.replace(/^AVENIDA ?|^AV. ?/i, "AVDA. ")
		.replace(/^POLIGONO INDUSTRIAL ?|POLIGONO ?|P\.I\. ?/i, "POL. IND. ")
		.replace(/^CALLE |^CL\.? ?|C\/ ?/i, "C/ ")
		.replace(/^RONDA |^RD /i, "RDA. ")
		.replace(/^AUTOPISTA (AUTOPISTA ?)?/i, "AU. ")
		.replace(/^PLAZA ?/i, "PL. ")
		.replace(/^PASEO (PASEO ?)?/i, "Pº ")
		.replace(/^TRAVESS?[IÍ]A /i, "TRAV. ")
		.replace(/^V[ií]A (V[IÍ]A )?/i, "VÍA ")
		.replace(/\B[^\d- ]+[ $]/g, function(t) {return t.toLowerCase()})
		.replace(/\b[NAE]-.+\b/, function(t) {return t.toUpperCase()})
		.replace(/\[D\]$/, "(m.d.)")
		.replace(/\[I\]$/, "(m.i.)")
		.replace(/ \[N\]$/, "")
}

/* Obtiene el identificador correspondiente a una etiqueta de gasolinera */
function getLogo(label) {
	if (label) {
		/* Algunos errores del archivo del Ministerio */
		label = label.replace(/camspa/i, "campsa");
		var logo = label.match(/\b(abycer|agla|alcampo|andamur|a\.?n\.? energeticos|avia|bonarea|b\.?p\.?|buquerin|campsa|carmoned|carrefour|cepsa|empresoil|eroski|esclatoil|galp|gasolben|iberdoex|leclerc|makro|meroil|norpetrol|petrem|petrocat|petromiralles|petronor|ramell|repostar|repsol|saras|shell|simply|staroil|tamoil|valcarce)\b/i);
		if (logo) return logo[0].replace(/\./g, "").replace(/ /g, "_").toLowerCase();	
	}
	return null;
}

/* Decodifica un nombre de url a representación humana */
function decodeName(s) {
	// return decodeURI(s);
	return decodeURI(s).replace(/_/g, " ").replace(/\|/g, "/");
}
/* Decodifica un array de nombres url a nombre legible */
function decodeArray(a) {
	for (var n=0; n<a.length; n++) a[n]=decodeName(a[n]); return a;
}
/* Codifica un nombre para utilizar en una url */
function encodeName(s) {
	// return encodeURI(s);
	return encodeURI(s.replace(/\//g, "|").replace(/ /g, "_"));
}

/* Hace que un nombre sea más bonito para representación en pantalla */
function prettyName(s) {
	if (s.match("/")) {
		 s = s.split("/")[1]; // dos idiomas
	}
	if (s.match(/\)$/)) {
		s = s.match(/\(.+\)$/g)[0]
			.replace("(", "").replace(")", " ") + s.split(" (")[0];
	}
	return s;
}

/* Comprueba si existe almacenamiento local en el navegador */
function checkLocalStorage() {
	try {
		return 'localStorage' in window && window['localStorage'] !== null;
	} catch (e) {
		return false;
	}
}

/* Clave de la página actual, para guardado o recuperación de LocalStorage */
function getKey() {return window.location.pathname.split("/").slice(1).join("*");}

/* Obtención de datos de la api a partir de la url de la página actual */
function getApiData(option, callback, reload) {
	if (typeof reload == "undefined") reload=false;
	var key = option+"*"+getKey();
	var ts = new Date().getTime();
	if (checkLocalStorage()) {
		var localData = localStorage[key];
		if (localData) {
			localData = JSON.parse(localData);
			if (((ts-localData.ts)>LS_EXPIRE) || reload)
				localStorage.removeItem(key);
			else {callback(localData.data); return;};
		}
	}
	var req = new XMLHttpRequest();
	req.onreadystatechange = function(r) {
		if ((this.readyState==4)&&(this.status==200)) {
			var info = JSON.parse(this.responseText);
			if (checkLocalStorage())
				localStorage.setItem(key, JSON.stringify(
					{"ts": ts, "data": info}));
			callback(info);
		}
	};
	var url = "api/";
	if 		(option=="history") 	url+="h";
	else if (option=="comments") 	url+="c";
	var current = window.location.pathname.split("/")[1];
	req.open("GET", document.URL.replace(current, url));
	req.send();
}

/****************************/
/* FUNCIONES GEOMETRICAS ****/
/****************************/

/* Distancia entre dos puntos */
function distance(a,b,r) {
	var dlat = Math.abs(a[0]-b[0])*Lat2Km;
	if (dlat<r) {
		var dlon = Math.abs(a[1]-b[1])*Lon2Km;
		if (dlon<r) {
			var dist = Math.sqrt(dlat*dlat+dlon*dlon);
			if (dist<r) return dist;
		}
	}
	return false;
}

// Distancia de un punto a una recta
// function distanceOrto(p, p1,p2) {
// 	// if start and end point are on the same x the distance is the difference in X.
// 	if (p1.lng()==p2.lng()) return Math.abs(p.lat()-p1.lat());
// 	else {
// 		var slope = (p2.lat() - p1.lat())/(p2.lng() - p1.lng());
// 		var intercept = p1.lat()-(slope*p1.lng());
// 		return Math.abs(slope*p.lng()-p.lat()+intercept)/Math.sqrt(slope*slope+1);
// 	}
// }

function distanceOrto(p,a,b,r)  {
	// http://www.matematicas.unam.mx/gfgf/ga20071/data/lecturas/lectura13a.pdf
	var u = [b[0]-a[0], b[1]-a[1]],	// vector del segmento
		norm_u_2 = u[0]*u[0]+u[1]*u[1],
		ap = [p[0]-a[0],p[1]-a[1]],
		t = (ap[0]*u[0]+ap[1]+u[1])/norm_u_2;
	if (t<=0) return distance(p,a,r);
	else if (t>=1) return distance(p,b,r);
	else {
		var v = [(a[0]+t*u[0]-p[0])*Lat2Km, (a[1]+t*u[1]-p[1])*Lon2Km],
			dseg = Math.sqrt(v[0]*v[0] + v[1]*v[1]);
		// var d = Math.abs((ap[0]*u[1]-ap[1]*u[0]) / Math.sqrt(norm_u_2));
		return (dseg<r);
	}
}
// Ramer–Douglas–Peucker algorithm
// http://karthaus.nl/rdp/js/rdp.js
// function properRDP(points,epsilon){
// 	if (typeof(epsilon)=="undefined") epsilon = 1*Km2LL;
// 	var firstPoint=points[0];
// 	var lastPoint=points[points.length-1];
// 	if (points.length<3){
// 		return points;
// 	}
// 	var index=-1;
// 	var dist=0;
// 	for (var i=1;i<points.length-1;i++){
// 		var cDist=distanceOrto(points[i],firstPoint,lastPoint);
// 		if (cDist>dist){
// 			dist=cDist;
// 			index=i;
// 		}
// 	}
// 	if (dist>epsilon){
// 		var l1=points.slice(0, index+1);
// 		var l2=points.slice(index);
// 		var r1=properRDP(l1,epsilon);
// 		var r2=properRDP(l2,epsilon);
// 		// concat r2 to r1 minus the end/startpoint that will be the same
// 		 return r1.slice(0,r1.length-1).concat(r2);
// 	} else return [firstPoint,lastPoint];
// }

/********************/
/* EL OBJETO GASOLE */
/********************/

/** @constructor */
function SearchLocations() {
	this.locs=[];
	this.radius=2;
	this.length = function() {return this.locs.length};
	this.add = function(p, ll) { this.locs.push({name: p, latlng: ll})};
	this.latlng = function() {return (this.length()==1) ? this.locs[0].latlng : null};
	this.name = function() {return (this.length()==1) ? this.locs[0].name : null};
	this.get = function(m) {return this.locs[m]};
	this.select = function(m) {this.locs = [this.locs[m]]};
	this.clear = function() {this.locs=[]};
};	

/** @constructor */
function Stats() {
	// estadisticas para resultados de un tipo de combustible
	this.n = 0;
	this.max = this.min = this.mu = this.range = null;
	this.smin = [];		// estaciones con mínimo
	this.smax = [];		// estaciones con máximo
	this.g = null;
	this.range = function() {
		if (this.range==null) this.range=this.max-this.min;
		return this.range;
	}
	this.add =function(p, s, g) {
		if (this.mu) {
			if (p>this.max) {this.max=p;this.smax=[s];}
			else if (p==this.max) this.smax.push(s);
			else if (p<this.min) {this.min=p;this.smin=[s]}
			else if (p==this.min) this.smin.push(s);
			this.mu = (this.mu*this.n+p)/(++this.n);
		} else {
			this.max = this.min = this.mu = p;
			this.smin = [s];
			this.smax = [s];
			this.n = 1;
		}
		if (g) {
			if (this.g) {
				if (g[0]<this.g[0]) this.g[0]=g[0];
				else if (g[0]>this.g[1]) this.g[1]=g[0];
				if (g[1]<this.g[2]) this.g[2]=g[1];
				else if (g[1]>this.g[3]) this.g[3]=g[1];
			} else this.g = [g[0],g[0],g[1],g[1]];	
		}
		
	};
}

/** @constructor **/
function GasoleStats(gasoleData, types) {
	// Estadisticas de todos los datos de un objeto gasole
	// types indica sobre qué tipos de quiere calcular la aestadística
	// if (typeof types == "undefined") types = null;
	var stats = this.stats = {};						// estadísticas globales
	this.provinces = {};								// estadísticas provinciales
	function addData(datas, statP, statGlobal, o) {
		if (!statP[o]) statP[o] = new Stats();
		if (!statGlobal[o]) statGlobal[o] = new Stats();
		statP[o].add(datas.o[o],[p,t,s],datas.g);
		statGlobal[o].add(datas.o[o],[p,t,s],datas.g);
	}
	for (var p in gasoleData) {
		var datap = gasoleData[p];						// datos de la provincia
		var statp = this.provinces[p] = {};				// estadisticas provinciales, optiones y límites geográficos
		for (var t in datap) {
			var datat = datap[t];						// datos de la ciudad
			for (var s in datat) {
				datas = datat[s];						// datos de la estación
				if (types) {
					for (var i=types.length-1; i>=0; i--) {
						var o = types[i];
						if (datas.o[o]) addData(datas, statp, stats, o);
					}
				} else {
					for (var o in datas.o) addData(datas, statp, stats, o);
				}
			}
		}	
	}
}

/** @constructor */
function Gasole(callback) {
	this.color = function(p) {
		var range = this.stats.range();
		if (range!=0) {
			var v = (p-this.stats.min)/range;
			if (v<.33) return COLORS.min;
			if (v>.66) return COLORS.max;
		}
		return COLORS.mu;
	}
	this.init = function(data, date, stats) {
		this.info = data;
		this.date = date; 
		this.stats = stats ? stats : new GasoleStats(this.info);
	};
	// Obtiene datos de una provincia como estructura de datos
	this.provinceDataArray = function(p) {
		this.stats = new Stats();
		var type = this.type;
		result = [];
		var province = this.info[p];
		for (var t in province) {
			var infot = province[t];
			for (var s in infot) {
				var st = infot[s];
				var price = st.o[type];
				if (price){
					result.push({a:s,r:st.r,g:st.g,p:price,t:t,l:st.l,d:null});
					this.stats.add(price);
				}
			}
		}
		return result;
	}
	// Obtiene estructura de gasolineras próximas a una ubicación
	// @param loc: lugar y radio de búsqueda
	this.nearData = function(loc) {
		var l = loc.latlng(); if (!l) return;			// lugar de búsqueda
		var r = loc.radius;								// radio de búsqueda
		var result = {};
		for (var prov in this.info) {					// para todas las provincias…
			var infop = this.info[prov];				// info de provincia
			result[prov]={};
			for (var town in infop) {					// para todas las ciudades…
				var infot = infop[town];				// info de la ciudad
				result[prov][town]={};
				for (var station in infot) {			// para todas las estaciones…
					var st = infot[station];			// información de la estación
					var geo = st.g;				
					if (geo) {
						var dist = distance(geo,l,r);
						if (dist) result[prov][town][station] = st;
					}
				}
				if (!Object.keys(result[prov][town]).length) delete result[prov][town];
			}
			if (!Object.keys(result[prov]).length) delete result[prov];
		}
		return result;
	}
	// Obtiene array de gasolineras próximas a una ubicación
	// @param loc: lugar y radio de búsqueda
	// @param sort: criterio de ordenación
	this.nearDataArray = function(loc, type, sort) {
		var l = loc.latlng(); if (!l) return;			// lugar de búsqueda
		var r = loc.radius;								// radio de búsqueda
		this.stats = new Stats();
		var result = [];
		for (var prov in this.info) {					// para todas las provincias…
			var infop = this.info[prov];				// info de provincia
			for (var town in infop) {					// para todas las ciudades…
				var infot = infop[town];				// info de la ciudad
				for (var station in infot) {			// para todas las estaciones…
					var st = infot[station];			// información de la estación
					if (st.o.hasOwnProperty(type)) {
						var geo = st.g;
						if (geo) {
							var dist = distance(geo,l,r);
							if (dist) {
								var price = st.o[type];	// el precio en la estación
								result.push({a:station,prov:prov,g:geo,p:price,t:town,l:st.l,d:dist});
								this.stats.add(price);
							}
						}
					}
				}
			}
		}
		if (sort) return result.sort(function(a,b){return (a[sort]<b[sort]) ? -1 : 1;});
		return result;
	}
	// this.routeData = function(route) {
	// 	var result = [];
	// 	var type = this.type;
	// 	this.stats = new Stats();
	// 	var dist = Km2LL;
	// 	// Puntos kilométricos
	// 	for (var prov in this.info) {
	// 		var infop = this.info[prov];
	// 		for (var town in infop) {
	// 			var infot = infop[town];
	// 			for (var station in infot) {
	// 				var st = infot[station];
	// 				var price = st.o[type];
	// 				if (price) {
	// 					var g = st.g;
	// 					if (g) {
	// 						var valid = false;
	// 						var geo = new google.maps.LatLng(g[0],g[1]);
	// 						for (var wp=0; wp<route.length-1; wp++) {
	// 							var d0 = distance(g, [route[wp].lat(), route[wp].lng()], dist);
	// 							if (d0) valid = true;
	// 							else {
	// 								var d1 = distance(g, [route[wp+1].lat(), route[wp+1].lng()], dist);
	// 								if (d1) valid = true;
	// 								else {
	// 									var area = new google.maps.LatLngBounds(route[wp],route[wp+1]);
	// 									if (area.contains(geo)) {
	// 										var d = distanceOrto(geo,route[wp],route[wp+1]);
	// 										if (d<dist) valid = true;
	// 									}
	// 								}
	// 							}
	// 						}
	// 						if (valid) {
	// 							result.push({a:station,r:st.r,g:g,p:price,t:town,l:st.l,d:d});
	// 							this.stats.add(price);
	// 						}
	// 					}
	// 				}
	// 			}
	// 		}
	// 	}
	// 	return result;
	// }
	this.routeData = function(route) {
		var result = {},
			dist = 1;
		gasoleProcess(this.info, function(station,p,t,s) {
			var g = station.g;
			if (g) {
				for (var wp=0,wpl=route.length-1; wp<wpl; wp++) {
					var p1=route[wp],
						p2=route[wp+1];
					if (distanceOrto(g,[p1.lat(),p1.lng()],[p2.lat(),p2.lng()],dist)) {
						var presult = result[p];
						if (!presult) presult=result[p]={};
						var tresult = presult[t];
						if (!tresult) tresult=presult[t]={};
						tresult[s] = station;		
					}
				}
			}
		});
		return result;
	}

	this.callback = callback;	// al final de la carga de los datos
	this.stats = null;
	this.info = null; 		// datos de la api
	this.date = null;		// fecha de actualización
	this.type = "1";
	var storedData = null;
	if (checkLocalStorage()) {
		storedData = localStorage["gasole"];	// datos guardados
		if (storedData) storedData=JSON.parse(storedData);
	}
	if (!storedData || ((new Date().getTime()-parseInt(storedData.ts))>LS_EXPIRE)) {
		// buscar nuevos datos
		var req = new XMLHttpRequest();
		req.gasole = this;
		req.onreadystatechange = function() {
			if ((this.readyState==4)&&(this.status==200)) {
				var date = null;
				var newdata = JSON.parse(this.responseText);
				if (newdata._meta) {		// compatibilidad api antigua sin _meta
					date = new Date(newdata._meta.ts);
					newdata = newdata._data;
				} else {
					date = new Date();
				}
				this.gasole.init(newdata,date);
				if (checkLocalStorage()) {
					var data2store = {	ts: date.getTime(),
									data: newdata,
									stats: this.gasole.stats};
					localStorage.setItem("gasole", JSON.stringify(data2store));
				}
				if (this.gasole.callback) this.gasole.callback();
			}
		}
		req.open("GET", "/api/gasole");
		req.send();
	} else {
		this.init(storedData.data, new Date(storedData.ts), storedData.stats);
		if (this.callback) this.callback();
	}
}

/* Rellena dígitos de información numérica 
para conseguir el efecto de tablero de precios */
function fillPriceDigits(div, price) {
	div.innerHTML = price.toFixed(3);
	// div.innerHTML = "";
	// var digits = price.toFixed(3);
	// for (var d=0; d<digits.length; d++){
	// 	var digitBack = document.createElement("div");
	// 	digitBack.className = "back";
	// 	(digits[d]==".") ? (digitBack.className += " point") : (digitBack.textContent = 8);
	// 	var digitDiv = document.createElement("div"); 
	// 	digitDiv.className = "digit"; 
	// 	digitDiv.textContent = digits[d];
	// 	digitBack.appendChild(digitDiv);
	// 	div.appendChild(digitBack);
	// }
}

/* Función para procesar datos de gasole, que ejecuta
el callback para cada estación encontrada */
function gasoleProcess(ginfo, callback) {
	for (var p in ginfo) {						// para todas las provincias
		var datap = ginfo[p];
		for (var t in datap) {					// para todas las ciudades
			var datat = datap[t];
			for (var s in datat) {				// para todas las estaciones
				callback(datat[s],p,t,s);		// llamamos a la función callback
			}
		}
	}
}

// Para propagación de evento
// http://blog.patricktresp.de/2012/02/internet-explorer-8-and-all-the-fun-stuff-e-stoppropagation-e-preventdefault-mousedown/
function stopEvent(e) {
	//e.cancelBubble is supported by IE -
	// this will kill the bubbling process.
	e.cancelBubble = true;
	e.returnValue = false;
	//e.stopPropagation works only in Firefox.
	if ( e.stopPropagation ) e.stopPropagation();
	if ( e.preventDefault ) e.preventDefault();		
	return false;
}

// Para ordenar dos nombres alfabéticamente
// http://stackoverflow.com/questions/990904/javascript-remove-accents-in-strings
function sortName(a,b) {
	function accentsTidy(s) {
		var r=s.toLowerCase();
		r = r.replace(new RegExp(/\s/g),"");	// borrar espacios
		r = r.replace(new RegExp(/[àá]/g),"a");
		r = r.replace(new RegExp(/[èé]/g),"e");
		r = r.replace(new RegExp(/[ìí]/g),"i");
		r = r.replace(new RegExp(/[òó]/g),"o");
		r = r.replace(new RegExp(/[ùú]/g),"u");
		return r;
	}
	return (accentsTidy(a)<accentsTidy(b)) ?  -1 : 1;
}

// Formateo de la fecha de actualización
function formatUpdate(date) {
	var u = "Precios actualizados el ";
	u += date.getDate() + " de " + MONTHS[date.getMonth()];
	u += " a las " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2);
	return u;
}

// Array.filter
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
if (!Array.prototype.filter) {
	Array.prototype.filter = function(fun /*, thisp*/) {
		"use strict";
		if (this == null) throw new TypeError();
		var t = Object(this);
		var len = t.length >>> 0;
		if (typeof fun != "function") throw new TypeError();
		var res = [];
		var thisp = arguments[1];
		for (var i = 0; i < len; i++) {
			if (i in t) {
				var val = t[i]; // in case fun mutates this
				if (fun.call(thisp, val, i, t)) res.push(val);
			}
		}
		return res;
	};
}


// Para medir tiempo
var TIME;
function tic() {
	TIME = new Date().getTime();
}
function toc(s) {
	console.log((s ? (s+" :") : "Transcurridos: ") + (new Date().getTime()-TIME) + " ms");
}
/* Inserta la miga de pan */
function breadCrumb(id, label) {
	var div = document.getElementById(id);
	if (div) {
		var separator = "<span class='sprt breadcrumb'>&nbsp;</span>";
		div.innerHTML = "<a href='/' class='bc'>Gasolineras</a>"+separator;
		var pathArray = window.location.pathname.split("/");
		var bc = document.createElement("a");
		bc.className = "bc";
		if (pathArray[1]=="resultados") {
			bc.textContent = "Cerca de "+decodeURIComponent(pathArray[2]);
			bc.href = "#";
			div.appendChild(bc);
			return;
		} else if (pathArray[1]=="ruta") {
			bc.textContent = "Ruta entre "+decodeURIComponent(pathArray[2]) + " y" + decodeURIComponent(pathArray[3]);
			bc.href = "#";
			bc.title = bc.textContent;
			div.appendChild(bc);
			return;
		}
		var name = decodeName(pathArray[2]);
		bc.textContent = name;
		bc.title = "Ver todas las gasolineras en la provincia de "+name;
		var plink = "/gasolineras/"+pathArray[2];
		bc.href = plink;
		div.appendChild(bc);
		if (pathArray[3]) {
			div.innerHTML+=separator;
			bc = document.createElement("a");
			bc.className = "bc";
			name = decodeName(pathArray[3]);
			bc.textContent = name;
			bc.title = "Ver todas las gasolineras en la localidad de "+name;
			bc.href = plink+"/"+pathArray[3];
			div.appendChild(bc);
		}
		if (pathArray[4]) {
			div.innerHTML+=separator;
			bc = document.createElement("a");
			bc.className = "bc";
			bc.textContent = "Gasolinera " + (label ? label : "") + " en " + toTitle(decodeName(pathArray[4]));
			bc.href = window.location.pathname;
			div.appendChild(bc);
		}
	}
}
/* Para ordenamiento de vectores (no empleado) */
// function quickSort(a) {
// 	var alen = a.length;
// 	/* Ordenación QuickSort de una tabla */
// 	if (alen<=1) return a;
// 	var npivot = Math.floor(Math.random()*alen);
// 	for (var p=npivot+1; p<alen; p++)
// 		if (a[p][0]!=a[npivot][0]) break;
// 	var pivot = a.splice(p-1, 1);
// 	alen = a.length;
// 	var less = [];
// 	var greater = [];
// 	for (var i=0; i<alen; i++) {
// 		if (a[i][0]<=pivot[0][0])
// 			less.push(a[i]);
// 		else greater.push(a[i]);
// 	}
// 	return quickSort(less).concat(pivot, quickSort(greater));
// }


/* Función que confierte un círculo en un path, para transformaciones de raphael */
// NO BORRAR, PUEDE SER ÚTIL
// function circle2path(x , y, r) // x and y are center and r is the radius
// {
// 	// https://groups.google.com/forum/#!topic/raphaeljs/6gH8TiOWlAw
// 	var s = "M";
// 	s = s + "" + (x) + "," + (y-r) + "A"+r+","+r+",0,1,1,"+(x-0.1)+","+(y-r)+"z";
// 	return s;
// }