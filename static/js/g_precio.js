var data = null;
var prov_detail = null;
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

var SKIP = ["Ceuta", "Melilla", "Santa Cruz De Tenerife", "Palmas (Las)"];
// Colores y precios máximo y mínimo para representación gráfica
var C_MIN = [255, 240, 50];
var C_MAX = [255, 0, 0];
var X_MIN = 0;
var X_MAX = 0;
var MOUSE_REF = null;

function array2color(a) {
	return "rgb(" + parseInt(a[0]) + "," + parseInt(a[1]) + "," + parseInt(a[2]) + ")";
}
function pickColor(x) {
	if ((x>X_MAX)||(x<X_MIN)) return "#ccc";
	var rgb = [];
	for (var c=0; c<C_MIN.length; c++) rgb[c] = C_MIN[c] + (x-X_MIN) * (C_MAX[c]-C_MIN[c]) / (X_MAX-X_MIN);
	return array2color(rgb);
}
function drawPriceMap(option, skip) {
	for (var p in data.provinces) {
		var path = document.getElementById("P"+PROVS[p]).getElementsByClassName("prov")[0];
		if (skip && SKIP.indexOf(p)>=0) {
			path.style.fill = "#ccc";
			continue;
		} 
		if (data.provinces[p]._p.hasOwnProperty(option)) {
			var price = data.provinces[p]._p[option].m;
			var color = pickColor(price);
			path.style.fill = color;
		}
		else {
			path.style.fill = "#6699CC";
		}
	}
}
/* Tipo de combustible seleccionado */
function getOption() {
	var options = document.getElementsByName("option");
	for (var o=0; o<options.length; o++) {
		if (options[o].checked) {
			return options[o].value;
			break;
		}
	}
}
/* Obtener nombre de provincia a partir de id */
function getProvName(id) {
	for (k in PROVS) if (PROVS[k] == id) return k;
}
/* Calcular límites de precio para cálculos de color, medias provinciales */
function computeLimits(option, skip) {
	var max=-10;
	var min=10;
	for (var p in data.provinces) {
		if (skip &&  SKIP.indexOf(p)>=0) continue;
		var prov = data.provinces[p];
		if (prov._p.hasOwnProperty(option)) {
			var price = prov._p[option].m;
			if (price > max) max = price;
			if (price < min) min = price;
		}
	}
	X_MAX = max;
	X_MIN = min;
	document.getElementById("bar_min").textContent = X_MIN.toFixed(3);
	document.getElementById("bar_max").textContent = X_MAX.toFixed(3);
}
/* Actualiza todo el gráfico */
function updateAll() {
	var skip = document.getElementById("hide").checked;
	var option = getOption();
	computeLimits(option, skip);
	drawPriceMap(option, skip);
	drawHistogram("spain_hist", option, skip, null);
	if (prov_detail) drawHistogram("prov_hist", option, skip, prov_detail);
}

function drawHistogram(where, option, skip, prov) {
	var chartId = where+"svg";
	var xdata = data._p[option]["x"];
	if (prov) {
		if (data.provinces[prov]._p.hasOwnProperty(option)) {
			hdata = JSON.parse(JSON.stringify(data.provinces[prov]._p[option]));
		} else {
			hdata = {"h": [], "m": "No disponible", "s": "No disponible"};
			for (var i=0; i<xdata.length-1; i++) hdata.h[i] = 0;
		}
	} else { 
		var hdata = JSON.parse(JSON.stringify(data._p[option]));
		if (skip) {
			for (var p=0; p<SKIP.length; p++) {
				var skipdata = data.provinces[SKIP[p]]._p[option];
				if (!skipdata) continue;
				for (var i=0; i<hdata.h.length; i++)
					hdata.h[i] -= skipdata.h[i];
			}
		}
	}
	var d3data = []
	for (var i=0; i<hdata.h.length; i++) {
		d3data[i] = {"h":hdata.h[i], "x": xdata[i], "w": (xdata[i+1]-xdata[i])};
	}
	var formatCount = d3.format(".0f");
	var margin = {top: 5, right: 12, bottom: 30, left: 35},
		width = 500 - margin.left - margin.right,
		height = 150 - margin.top - margin.bottom;
	var bar_w = Math.round(width/d3data.length)-2;
	var ticks = d3.min([5, d3.max(hdata.h)]);


	var x = d3.scale.linear()
		.domain([d3.min(xdata), d3.max(xdata)])
		.range([0,width]);
	var y = d3.scale.linear()
		.domain([0, d3.max(hdata.h)])
		.range([height,0]);
	var xAxis = d3.svg.axis()
		.scale(x)
		.tickValues(xdata)
		.orient("bottom");
	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left")
		.ticks(ticks)
		.tickFormat(formatCount);

	var chart = d3.select("#"+chartId);
	if (chart[0][0] == null) {
		chart = d3.select("#"+where).append("svg")
			.attr("id", chartId)
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		chart.append("g")
			.attr("class", "x axis")
			.attr("id", "x_axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis)
			.selectAll("text")
			.style("text-anchor", "end")
			.attr("dx", "-.9em")
            .attr("dy", "-.2em")
			.attr("transform", "rotate(-90)");
		chart.append("g")
			.attr("class", "y axis")
			.attr("id", "y_axis")
			.call(yAxis);
		var bars = chart.selectAll(".bar")
			.data(d3data)
			.enter().append("rect")
			.attr("class", "bar")
			.attr("x", function(d) {return x(d.x);})
			.attr("width", bar_w)
			.attr("y", function(d) {return y(d.h);})
			.attr("height", function(d) {return height-y(d.h);})
			.on("mouseover", function(d) {
				d3.select('body').selectAll('div.tooltip').remove();
				tooltipDiv = d3.select('body').append('div').attr('class', 'tooltip');
            	var absoluteMousePos = d3.mouse(d3.select('body').node());
            	tooltipDiv.style('left', (absoluteMousePos[0])+'px')
                .style('top', (absoluteMousePos[1] - 50)+'px')
                .style('position', 'absolute') 
            	.style('z-index', 1000);
            	var tooltipText = d.h;
            	tooltipDiv.html(tooltipText);
			})
			.on("mouseout", function() {
				d3.select('body').selectAll('div.tooltip').remove();
			});
		bars.append("text")
			.attr("x", function(d) { return x(d.x); })
			.attr("y", function(d) { return y(d.h); })
			.text(function(d) { return "miraa"});
	} else {
		chart.select("#x_axis")
			.transition().duration(500)
			.call(xAxis)
			.selectAll("text")
			.style("text-anchor", "end")
			.attr("dx", "-.9em")
            .attr("dy", "-.2em")
			.attr("transform", "rotate(-90)");
		chart.select("#y_axis")
			.transition().duration(500)
			.call(yAxis);
		chart.selectAll(".bar")
			.data(d3data)
			.transition().duration(1000).delay(function(d,i) {return i*20;})
			.attr("y", function(d) {return y(d.h);})
			.attr("height", function(d) {return 1+height-y(d.h);});
	}
}
function initProvinces() {
	var div = document.getElementById("prov_h2");
	for (var p in PROVS) {
		var newinput = document.createElement("input");
		newinput.type="radio";
		newinput.name="prov";
		newinput.value=PROVS[p];
		newinput.id=PROVS[p];
		div.appendChild(newinput);
		var newlabel = document.createElement("label");
		newlabel.textContent = p;
		newlabel.htmlFor=PROVS[p];
		div.appendChild(newlabel);
	}
}
function initOpenMap() {
	var openMap = new OpenLayers.Map("openmap");
	var osm = new OpenLayers.Layer.OSM();
	openMap.addLayer(osm);
	openMap.zoomToMaxExtent();
}
window.addEventListener("load", function(){
	var req = new XMLHttpRequest();
	req.onload = function(r) {
		data = JSON.parse(r.target.responseText);
		if (data) {
			console.log(data);
			updateAll();

			document.getElementById("hide").addEventListener("change", function() {
				updateAll();
			})
			var options = document.getElementsByName("option");
			for (var o=0; o<options.length; o++) {
				options[o].addEventListener("change", function() {
					updateAll();
				})
			}
			/* Eventos del mapa */
			for (var p in PROVS) {
				prov = document.getElementById("P"+PROVS[p]);
				prov.addEventListener("click", function() {
					prov_detail = getProvName(this.id.slice(1));
					document.getElementById("prov_h2").textContent = prov_detail;
					updateAll();
				})
			}
			initProvinces();
			initOpenMap();
		}
	}
	var url = document.URL;
	req.open("GET", document.URL.replace("graficos/precio", "stats"), true)
	req.send();
})