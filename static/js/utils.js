var FUEL_OPTIONS = {"1": {"short": "G95", "name": "Gasolina 95"},
				"3": {"short": "G98", "name": "Gasolina 98"},
				"4": {"short": "GOA", "name": "Gasóleo Automoción"},
				"5": {"short": "NGO", "name": "Nuevo Gasóleo A"},
				"6": {"short": "GOB", "name": "Gasóleo B"},
				"7": {"short": "GOC", "name": "Gasóleo C"},
				"8": {"short": "BIOD", "name": "Biodiésel"}}
var CHART_OPTIONS = {
	"G95": {color: "#006633", name: "Gasolina 95"},
	"G98": {color: "#339933", name: "Gasolina 98"},
	"GOA": {color: "#000", name: "Gasóleo A"},
	"NGO": {color: "#aaa", name: "Nuevo Gasóleo A"},
	"GOB": {color: "#CC3333", name: "Gasóleo B"},
	"GOC": {color: "#FF3300", name: "Gasóleo C"},
	"BIOD": {color: "#f1aa41", name: "Biodiésel"}
}

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

var info = null;
var LS_EXPIRE = 3600000;				// 1 hora
var APIS = 	{ 	"gasolineras": "api",
				"resultados": "geo",
				"ficha": "api"
			};

/* Obtener nombre de provincia a partir de id */
function getProvName(id) {
	for (k in PROVS) if (PROVS[k] == id) return k;
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
	for (var n=0; n<a.length; n++) {
		a[n] = decodeName(a[n]);
	}
	return a;
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

function getApiData(url, key, callback) {
	var req = new XMLHttpRequest();
	req.onload = function(r) {
		info = JSON.parse(r.target.responseText);
		if (key) {
			localStorage.setItem(key, JSON.stringify(info));
			if (!localStorage.timestamp) localStorage.setItem("timestamp", new Date().getTime());
		}
		callback(info);
	}
	req.open("GET", url);
	req.send();
}
function getKey() {
	return window.location.pathname.split("/").slice(1).join("***");
}
function getData(callback) {
	var key = null, info = null;
	var pathArray = window.location.pathname.split("/");
	var option = pathArray[1];
	if (checkLocalStorage()) {
		// Limpieza de datos antiguos
		var ts = localStorage["timestamp"];
		if (ts && (new Date().getTime() - parseInt(ts))>LS_EXPIRE) localStorage.clear();
		key = getKey();
		
		var storedData = localStorage[key];
		if (storedData) info = JSON.parse(storedData);
		else if ((option=="gasolineras") && (pathArray[3])) {
			storedData = localStorage[pathArray.slice(1,3).join("***")];
			if (storedData) {
				var prov  = decodeName(pathArray[2]);
				var town = decodeName(pathArray[3]);
				info = {"_data": {}};
				info._data[prov] = {};
				info._data[prov][town] = JSON.parse(storedData)._data[prov][town];
			}
		}
	}
	if (info) callback(info);
	else getApiData(document.URL.replace(option, APIS[option]), key, callback);
}