// function init(e) {
// 	if (window.svgDocument == null) {
// 		svgDoc = e.target.ownerDocument;
// 	}
// }

PROVS = {
	"Álava": "01",
	"Albacete": "02",
	"Alicante": "03",
	"Almería": "04",
	"Asturias": "33",
	"Ávila": "05",
	"Badajoz": "06",
	"Balears": "07",
	"Barcelona": "08",
	"Burgos": "09",
	"Cáceres": "10",
	"Cádiz": "11",
	"Cantabria": "39",
	"Castellón": "12",
	"Ceuta": "51",
	"Ciudad": "13",
	"Córdoba": "14",
	"Coruña": "15",
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
	"Palmas": "35",
	"Pontevedra": "36",
	"Rioja": "26",
	"Salamanca": "37",
	"Santa": "38",
	"Segovia": "40",
	"Sevilla": "41",
	"Soria": "42",
	"Tarragona": "43",
	"Teruel": "44",
	"Toledo": "45",
	"Valencia": "46",
	"Valladolid": "47",
	"Vizcaya": "48",
	"Zamora": "49",
	"Zaragoza": "50"};

SKIP = ["Ceuta", "Melilla", "Santa", "Palmas"];

function array2color(a) {
	return "rgb(" + parseInt(a[0]) + "," + parseInt(a[1]) + "," + parseInt(a[2]) + ")";
}
function pickColor(x, xmax, xmin, cmax, cmin) {
	var rgb = [];
	for (var c=0; c<cmin.length; c++) rgb[c] = cmin[c] + (x-xmin) * (cmax[c]-cmin[c]) / (xmax-xmin);
	return array2color(rgb);
}
function drawPriceMap(data, option, skip) {
	if (typeof(skip)=="undefined") skip = false;
	var max=-10;
	var min=10;
	for (var p in data.provinces) {
		if (skip &&  SKIP.indexOf(p.split(" ")[0])>=0) continue;
		var pmean = data.provinces[p]._p[option].m;
		if (pmean > max) max = pmean;
		if (pmean < min) min = pmean;
	}

	console.log(min, max);
	var c_min = [255, 240, 50];
	var c_max = [255, 0, 0];

	for (var p in data.provinces) {
		var pshort = p.split(" ")[0];
		var path = document.getElementById("P"+PROVS[pshort]).getElementsByClassName("prov")[0];
		
		if (skip && SKIP.indexOf(pshort)>=0) {
			path.style.fill = "#ccc";
			continue;
		} 
		var price = data.provinces[p]["_p"][option]["m"];
		var color = pickColor(price, max, min, c_max, c_min);
		path.style.fill = color;
	}
}