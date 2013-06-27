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
	{id: "GOA", color: "#000", name: "Gasóleo A"},
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
var MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
var COLORS = {
	stroke: "#fff",
	min: "#36AE34",
	max: "#f00",
	mu: "#3399CC"
}

var info = null;
var LS_EXPIRE = 3600000;				// 1 hora
var APIS = 	{ 	"gasolineras": "api",
				"resultados": "geo",
				"ficha": "api"
			};


/* Bloqueo de scroll en el body cuando se hace scroll en un elemento */
function lockScroll(id) {
	if (typeof id=="string") id = document.getElementById(id);
	id.addEventListener("mouseover", function() {
		document.body.style.overflow = "hidden";
	})
	id.addEventListener("mouseout", function() {
		document.body.style.overflow = "auto";
	})
}
/* Enlaces a páginas de provincias a partir de lista */
function initProvLinks(id) {
	var place = document.getElementById(id);
	for (var p in PROVS) {
		var li = document.createElement("li");
		var a = document.createElement("a");
		a.title = "Todas las gasolineras de "+p;
		a.textContent = p;
		a.href = "/gasolineras/"+encodeName(p);
		li.appendChild(a);
		place.appendChild(li);
	}
}
/* Obtener nombre de provincia a partir de id */
function getProvName(id) {
	for (k in PROVS) if (PROVS[k] == id) return k;
}

function clearHtmlTags(s) {
	return s.replace(/(<([^>]+)>)/ig,"")
}
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
function getLogo(label) {
	if (label) {
		/* Algunos errores del archivo del Ministerio */
		label = label.replace(/camspa/i, "campsa");
		logo = label.match(/\b(abycer|agla|alcampo|andamur|a\.?n\.? energeticos|avia|bonarea|b\.?p\.?|buquerin|campsa|carmoned|carrefour|cepsa|empresoil|eroski|esclatoil|galp|gasolben|iberdoex|leclerc|makro|meroil|norpetrol|petrem|petrocat|petromiralles|petronor|repostar|repsol|saras|shell|simply|staroil|tamoil|valcarce)\b/i);
		if (logo) return logo[0].replace(/\./g, "").replace(/ /g, "_").toLowerCase();	
	}
	return null;
}
function decodeName(s) {
	return decodeURI(s).replace(/_/g, " ").replace(/\|/g, "/");
}
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
function decodeArray(a) {
	for (var n=0; n<a.length; n++) a[n]=decodeName(a[n]); return a;
}
function encodeName(s) {
	return s.replace(/\//g, "|").replace(/ /g, "_");
}

function checkLocalStorage() {
	try {
		return 'localStorage' in window && window['localStorage'] !== null;
	} catch (e) {
		return false;
	}
}

function getKey() {return window.location.pathname.split("/").slice(1).join("*");}

/* Obtención de datos de la api a partir de la url de la página actual */
function getApiData(callback) {	
	var key = getKey();
	if (checkLocalStorage()) {
		if (localStorage.hasOwnProperty(key)) {
			localData = JSON.parse(localStorage[key]);
			if ((new Date().getTime()-localData.ts)>LS_EXPIRE) localStorage.removeItem(key);
			else {callback(localData.data); return;};
		}
	} 
	var req = new XMLHttpRequest();
	req.onload = function(r) {
		var info = JSON.parse(this.responseText);
		if (checkLocalStorage())
			localStorage.setItem(key, JSON.stringify(
				{"ts": new Date().getTime(), "data": info}));
		callback(info);
	};
	var option = window.location.pathname.split("/")[1];
	req.open("GET", document.URL.replace(option, APIS[option]));
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
			var dist = Math.sqrt(Math.pow(dlat,2)+Math.pow(dlon,2));
			if (dist<r) return dist;
		}
	}
	return null;
}

// Distancia de un punto a una recta
function distanceOrto(p, p1,p2) {
    // if start and end point are on the same x the distance is the difference in X.
    if (p1.lng()==p2.lng()) return Math.abs(p.lat()-p1.lat());
    else {
        var slope = (p2.lat() - p1.lat())/(p2.lng() - p1.lng());
        var intercept = p1.lat()-(slope*p1.lng());
        return Math.abs(slope*p.lng()-p.lat()+intercept)/Math.sqrt(slope*slope+1);
    }
}
// Ramer–Douglas–Peucker algorithm
// http://karthaus.nl/rdp/js/rdp.js
function properRDP(points,epsilon){
	if (typeof(epsilon)=="undefined") epsilon = 1*Km2LL;
    var firstPoint=points[0];
    var lastPoint=points[points.length-1];
    if (points.length<3){
        return points;
    }
    var index=-1;
    var dist=0;
    for (var i=1;i<points.length-1;i++){
        var cDist=distanceOrto(points[i],firstPoint,lastPoint);
        if (cDist>dist){
            dist=cDist;
            index=i;
        }
    }
    if (dist>epsilon){
        var l1=points.slice(0, index+1);
        var l2=points.slice(index);
        var r1=properRDP(l1,epsilon);
        var r2=properRDP(l2,epsilon);
        // concat r2 to r1 minus the end/startpoint that will be the same
         return r1.slice(0,r1.length-1).concat(r2);
    } else return [firstPoint,lastPoint];
}

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
function GasoleStats(gasoleData) {
	// Estadisticas de todos los datos de gasole
	var stats = this.stats = {};						// estadísticas nacionales
	this.provinces = {};								// estadísticas provinciales
	for (var p in gasoleData) {
		var datap = gasoleData[p];						// datos de la provincia
		var statp = this.provinces[p] = {};				// estadisticas provinciales, optiones y límites geográficos
		for (var t in datap) {
			var datat = datap[t];						// datos de la ciudad
			for (var s in datat) {
				datas = datat[s];						// datos de la estación
				var g = datas.g;						// posición de la estación
				for (var o in datas.o) {				// tipos de combustible
					if (!statp.hasOwnProperty(o)) statp[o] = new Stats();
					if (!stats.hasOwnProperty(o)) stats[o] = new Stats();
					statp[o].add(datas.o[o],[p,t,s],g);
					stats[o].add(datas.o[o],[p,t,s],g);
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
		console.log(loc);
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
	this.routeData = function(route) {
		var result = [];
		var type = this.type;
		this.stats = new Stats();
		var dist = Km2LL;
		// Puntos kilométricos

		for (var prov in this.info) {
			var infop = this.info[prov];
			for (var town in infop) {
				var infot = infop[town];
				for (var station in infot) {
					var st = infot[station];
					var price = st.o[type];
					if (price) {
						var g = st.g;
						if (g) {
							var valid = false;
							var geo = new google.maps.LatLng(g[0],g[1]);
							for (var wp=0; wp<route.length-1; wp++) {
								var d0 = distance(g, [route[wp].lat(), route[wp].lng()], dist);
								if (d0) valid = true;
								else {
									var d1 = distance(g, [route[wp+1].lat(), route[wp+1].lng()], dist);
									if (d1) valid = true;
									else {
										var area = new google.maps.LatLngBounds(route[wp],route[wp+1]);
										if (area.contains(geo)) {
											var d = distanceOrto(geo,route[wp],route[wp+1]);
											if (d<dist) valid = true;
										}
									}
								}
							}
							if (valid) {
								result.push({a:station,r:st.r,g:g,p:price,t:town,l:st.l,d:d});
								this.stats.add(price);
							}
						}
					}
				}
			}
		}
		return result;
	}

	this.callback = callback;
	this.stats = null;
	this.info = null; 		// datos de la api
	this.date = null;		// fecha de actualización
	this.type = "1";
	var storedData = localStorage["gasole"];	// datos guardados
	if (!storedData || ((new Date().getTime()-parseInt(JSON.parse(storedData).ts))>LS_EXPIRE)) {
		// buscar nuevos datos
		var req = new XMLHttpRequest();
		req.gasole = this;
		req.onload = function() {
			var date = new Date();
			this.gasole.init(JSON.parse(this.responseText), date);
			localStorage.setItem("gasole", '{"ts": '+ date.getTime() +',"data": '+this.responseText+',"stats": '+JSON.stringify(this.gasole.stats)+'}');
			if (this.gasole.callback) this.gasole.callback();
		}
		req.open("GET", "/api/All");
		req.send();
	} else {
		var data = JSON.parse(storedData);
		this.init(data.data, new Date(data.ts), data.stats);
		if (this.callback) this.callback();
	}
}

/* Rellena dígitos de información numérica */
function fillPriceDigits(div, price) {
	div.innerHTML = "";
	var digits = price.toFixed(3);
	for (var d=0; d<digits.length; d++){
		var digitBack = document.createElement("div");
		digitBack.className = "back";
		(digits[d]==".") ? (digitBack.className += " point") : (digitBack.textContent = 8);
		var digitDiv = document.createElement("div"); 
		digitDiv.className = "digit"; 
		digitDiv.textContent = digits[d];
		digitBack.appendChild(digitDiv);
		div.appendChild(digitBack);
	}
}