var FUEL_OPTIONS = {"1": {"short": "G95", "name": "Gasolina 95"},
				"3": {"short": "G98", "name": "Gasolina 98"},
				"4": {"short": "GOA", "name": "Gasóleo Automoción"},
				"5": {"short": "NGO", "name": "Nuevo Gasóleo A"},
				"6": {"short": "GOB", "name": "Gasóleo B"},
				"7": {"short": "GOC", "name": "Gasóleo C"},
				"8": {"short": "BIOD", "name": "Biodiésel"}}
var FUEL_COLORS = {
	"G95": "#006633",
	"G98": "#339933",
	"GOA": "#000",
	"NGO": "#aaa",
	"GOB": "#CC3333",
	"GOC": "#FF3300",
	"BIOD": "#FFCC33"
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

var info = null;
var LOCAL_EXPIRATION = 3600000;	// 1 hora
var APIS = 	{ 	"gasolineras": "api",
				"resultados": "geo",
				"ficha": "api"
			}

function getApiData(url, key, callback) {
	var req = new XMLHttpRequest();
	req.onload = function(r) {
		info = JSON.parse(r.target.responseText);
		console.log("datos obtenidos: ", info);
		if (key) {
			localStorage.setItem(key, JSON.stringify(info));
			localStorage.setItem("timestamp", new Date().getTime());
		}
		callback(info);
	}
	req.open("GET", url);
	req.send();
}

function clearCurrentStorage() {
	if (!checkLocalStorage()) return;
	// Limpia los datos locales de la página actual
	var pathArray = window.location.pathname.split("/");
	var option = pathArray[1];		// ficha
	if (option=="ficha") {
		localStorage.removeItem(pathArray.slice(2).join("*"));
	}
}

function getData(callback) {
	var pathArray = window.location.pathname.split("/");
	var option = pathArray[1];		// resultados, gasolineras, ficha
	var where1 = pathArray[2];		
	var where2 = pathArray[3];
	var key = null;	
	if (checkLocalStorage()) {
		// Limpieza de datos antiguos
		var timestamp = localStorage["timestamp"];
		if (timestamp && (new Date().getTime() - parseInt(timestamp))>LOCAL_EXPIRATION) {		
			console.log("datos antiguos");	
		}
		
		var storedData = null;
		if (option == "resultados") {
			key = where1;
			storedData = localStorage[key];
		} else if (option == "gasolineras") {
			if (where2) {
				key = [where1,where2].join("*");
				storedData = localStorage[key];
				if (!storedData) storedData = localStorage[where1];
			} 
			else {
				key = where1;
				storedData = localStorage[key];
			}
		} else if (option == "ficha") {
			var where3 = pathArray[4];
			key = [where1,where2,where3].join("*");
			storedData = localStorage[key];
		}
		if (storedData) info = JSON.parse(storedData);
	}
	if (info) {
		if ((option=="gasolineras") && (where2)) {
			var prov  = decodeName(where1);
			var town = decodeName(where2);
			tempData = {};
			tempData["_data"] = {};
			tempData["_data"][prov] = {};
			tempData["_data"][prov][town] = info._data[prov][town];
			info = tempData;
		}
		console.log("datos recuperados: ", info);
		callback(info);
	} else {
		// Buscamos datos nuevos
		console.log(key);
		getApiData(document.URL.replace(option, APIS[option]), key, callback);
	}
	return null;
}