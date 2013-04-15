var data;
var map;
var place = "";
var markers = [];
var province = "";
var town = "";
var markerCenter;
var pagerN = 15;
var pagerCurrent = null;
var markerIcon = "/img/pump_mark.png";
var windowTimeout;
var focusMarker;
var infoWindow = null;
var cluster = null;
var Stats = {types: {}, n: 0, init: false};
Stats.add = function(station) {
	if (this.init) return;
	for (var t in station) {
		var val = station[t];
		if (this.types.hasOwnProperty(t)) {
			var data = this.types[t];
			if (val>data.max) data.max=val;
			else if (val<data.min) data.min=val;
			data.mean = (data.mean*data.n+val)/(data.n+1);
			data.n++;
		} else this.types[t] = {max: val, min: val, mean: val, n: 1};
	}
	this.n++;
}
Stats.run = function() {
	// Peso relativo de cada tipo de combustible
	var N=0;
	for (var t in this.types) {
		N+=this.types[t].n;
		this.types[t].range = this.types[t].max - this.types[t].min;
	}
	for (var t in this.types) this.types[t].w = this.types[t].n/N;
	this.init = true;
}
var priceMarkers = {};
var COLORS = {
	p_min: "#36AE34",
	p_minStroke: "#288627",
	p_max: "#f00",
	p_maxStroke: "#D30000",
	p_mean: "#FF9933",
	p_meanStroke: "#D07B26"
}

function newReference(loc) {
	if (infoWindow) infoWindow.close();
	var location = loc;
	if(!location) location = document.getElementById("from").value + 
		((town) ? (", " + town ) : ("")) + ", " + province + ", " + "Spain";
	var geocoder = new google.maps.Geocoder();
	geocoder.geocode({'address': location}, function (res, stat) {
		var infoDiv = document.getElementById("distance-info");
		if (stat == google.maps.GeocoderStatus.OK) {
			if (!markerCenter) {
				markerCenter = new google.maps.Marker({
	            	map: map,
	            	position: res[0].geometry.location,
	            	draggable: true
				});
				google.maps.event.addListener(markerCenter, 'click', function(e) {
					if (infoWindow) infoWindow.close();
					infoWindow = new google.maps.InfoWindow({
						content: "Punto de referencia:<br /> " + this.place.bold()
					})
					infoWindow.open(map, this);
				});
			} else {
				markerCenter.setPosition(res[0].geometry.location);
			}
			
			markerCenter.set("place", res[0].formatted_address);
			map.panTo(res[0].geometry.location);
			if(!loc) map.setZoom(14);
			calcDistances();
			var nearest = document.getElementById("table-data").getElementsByTagName("tr")[0];
			infoDiv.innerHTML = "La gasolinera más próxima a " + 
				res[0].formatted_address + " se encuentra en " + 
				nearest.getElementsByClassName("T_ADDR")[0].innerHTML.replace(/ \[.\]/g, "");
			return;
		}
		infoDiv.innerHTML = "No se ha podido localizar la referencia.";
	});
}

/* Paginación de la tabla */
function paginateTable(index) {
	var rows = document.getElementById("table-data").getElementsByClassName("r_on");
	var pager = document.getElementById("pager-links");
	if (!rows.length) {
		pager.innerHTML = "<p>No hay resultados coincidentes con los criterios de búsqueda.<br>Comprueba el filtro y tipos de combustible seleccionados.</p>"; return;	
	}
	if (index === "more") index = Math.min(pagerCurrent+pagerN, parseInt(rows.length/pagerN)*pagerN);
	else if (index === "less") index = Math.max(pagerCurrent-pagerN, 0);
	if (index>=rows.length) return;
	pager.innerHTML = "";
	for (var r=0; r<rows.length; r++) {
		rows[r].className = rows[r].className.replace(" p_off", "");
		if ((r<index)||(r>=index+pagerN)) rows[r].className+=" p_off";
		if (r%pagerN == 0) {
			var p = document.createElement("div");
			p.innerHTML = ((r+1) + "<br/>" + Math.min(r+pagerN, rows.length));
			p.setAttribute("onclick", "javascript:paginateTable(" + r + ");");
			(r==index) ? (p.className="p current"):(p.className="p");
			pager.appendChild(p);
		}
	}
	pagerCurrent = index;
}
/* Cálculo de distancias al marcador de referencia */
function calcDistances() {
	var tds = document.getElementById("table-data").getElementsByClassName("T_DIST");
	for (var i=0; i<tds.length; i++) {
		var latlon = tds[i].getAttribute("data-geo");
		if (latlon) {
			latlon = latlon.split(",");
			var dlat = (latlon[0] - markerCenter.position.lat()) * 111.03461;
			var dlon = (latlon[1] - markerCenter.position.lng()) * 85.39383;
			var dist = Math.sqrt(dlat*dlat+dlon*dlon).toFixed(1);
			tds[i].textContent = dist;
		}
	}
	sortTable("T_DIST", false, true);
}
function mapCluster() {
	if (!cluster) cluster = new MarkerClusterer(map, markers);
	for (var t in priceMarkers) {
		if (priceMarkers[t].on) {
			var mm = priceMarkers[t].markers;
			for (var m=0; m<mm.length; m++) mm[m].setMap(null);
			priceMarkers[t].on = false;
		}
	}
}
function markerColor(price) {

}
function updateMarkers() {
	// Busco las filas visibles:
	var rows = document.getElementById("table-data").getElementsByTagName("tr");
	for (var r=0; r<rows.length; r++) {
		// Precios activos
		var prices = rows[r].getElementsByClassName("on");
		var priceM = 0;
		for (var p=0; p<prices.length; p++) {
			var type = this.className.match(/T_\w+/)[0].replace("T_","");
			var price = parseFloat(prices[p].textContent);
			price = (price-Stats.types[type].min)/Stats.types[type].range;
			priceM += price*Stats[type].w;
		}
	}
}
function mapPrice(type) {
	if (cluster) {
		cluster.clearMarkers();
		cluster = null;
	}
	for (var t in priceMarkers) {
		if (priceMarkers[t].on) {
			if (t==type) return;
			var mm = priceMarkers[t].markers;
			for (var m=0; m<mm.length; m++) mm[m].setMap(null);
			priceMarkers[t].on = false;
		}
	}
	if (priceMarkers.hasOwnProperty(type)) {
		var mm = priceMarkers[type].markers;
		for (var m=0; m<markers.length; m++) mm[m].setMap(map);
		priceMarkers[type].on = true;
		return;
	}
	priceMarkers[type] = {markers:[], on:true};
	var min = Stats.types[type].min;
	var range = Stats.types[type].max - min;
	for (var m=0; m<markers.length; m++) {
		var rowId = markers[m].get("row-id");
		var value = document.getElementById(rowId)
			.getElementsByClassName("T_"+type)[0].innerHTML;
		if (value) value=parseFloat(value); else continue;
		value = (value-min)/range;
		
		
	}
}
function initMap() {
	var mapOptions = {
		center: new google.maps.LatLng(40.400, 3.6833),
		zoom: 8,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById("google_map"),
		mapOptions);
}
/* Ordenación de la tabla */
function sortTable(cname, reverse, isfloat) {
	if (typeof reverse == "undefined") reverse = false;
	function quickSort(a) {
		/* Ordenación QuickSort de una tabla */
		if (a.length<=1) return a;
		var npivot = Math.floor(Math.random()*a.length);
		for (var p=npivot+1; p<a.length; p++)
			if (a[p][0]!=a[npivot][0]) break;
		var pivot = a.splice(p-1, 1);
		var less = [];
		var greater = [];
		for (var i=0; i<a.length; i++) {
			if (a[i][0]<=pivot[0][0])
				less.push(a[i]);
			else greater.push(a[i]);
		}
		return quickSort(less).concat(pivot, quickSort(greater));
	}
	var table_data = document.getElementById("table-data");
	var values = table_data.getElementsByClassName(cname);
	var array = [];
	for (var v=0; v<values.length; v++)
		if (values[v].textContent) {
			var newval = (isfloat ? parseFloat(values[v].textContent) : values[v].textContent);
			array.push([newval, v]);
		}
	array = quickSort(array);
	if (reverse) array.reverse();
	var rows = table_data.getElementsByTagName("tr");
	var static_rows = [];
	for (var r=0; r<rows.length; r++) static_rows.push(rows[r]);
	for (var e=0; e<array.length; e++) {
		table_data.insertBefore(static_rows[array[e][1]], table_data.children[e]);
	}
	var headers = document.getElementById("table").getElementsByTagName("th");
	for (var h=0; h<headers.length; h++) {
		headers[h].className = headers[h].className.replace(" sort_up", "").replace(" sort_down", "");
		if (headers[h].className.match(cname)) {
			headers[h].className = headers[h].className + ((reverse) ? (" sort_down") : (" sort_up"));
		}
	}
	paginateTable(0);
}

/* Filtro de resultados por tipo de combustible */
function filterTypes(filter) {
	for (var i=0; i<filter.length; i++) {
		var f=filter[i].split(" ");
		var type=f[0];
		var c_off=type + " off";
		var c_on=type + " on";
		var c_na=type;
		var cells=document.getElementById("table").getElementsByClassName(type);
		for (var c=0; c<cells.length; c++) {
			if (f[1]=="off") cells[c].className = c_off;
			else if (cells[c].textContent.length>0) cells[c].className = c_on;
			else cells[c].className = c_na;
		}
	}
	var rows = document.getElementById("table-data").getElementsByTagName("tr");
	for (var r=0; r<rows.length; r++)
		rows[r].className = rows[r].getElementsByClassName("on").length ? "r_on" : "r_off";
}
/* Filtro de resultados por contenido de texto */
function filterText() {
	function cleanFilter(s) {
		return s.toLowerCase()
			.replace(/[áàä]/g, "a")
			.replace(/[éèë]/g, "e")
			.replace(/[íìï]/g, "i")
			.replace(/[óòö]/g, "o")
			.replace(/[úùü]/g, "u");
	}
	var filtervalue = document.getElementById("contains").value;
	if (filtervalue.length) {
		var terms = filtervalue.split(/ +/);
		var rows = document.getElementById("table-data").getElementsByTagName("tr");
		for (var f=0; f<rows.length; f++) {
			var row = rows[f];
			if (row.className=="r_off") continue;
			for (var t=0; t<terms.length; t++) {
				if (terms[t].length) {
					var found = false;
					var term = RegExp(cleanFilter(terms[t]));
					var cells = row.getElementsByTagName("td");
					for (var c=0; c<2; c++) found = found || (term.exec(cleanFilter(cells[c].textContent))!=null);
					row.className = found ? "r_on" : "f_off";
					if (!found) break;
				}
			}
		}
	} else {
		var rows = document.getElementById("table-data").getElementsByClassName("f_off");
		for (var f=0; f<rows.length; f++) rows[f].className="r_on";
	}
}

function initControl() {
	// Filtro de tipo de gasolina. Elimina columnas
	var filterT = document.getElementById("fuel-type").getElementsByTagName("li");
	var filter = [];
	for (var f=0; f<filterT.length; f++) {
		filter.push(filterT[f].className);
		filterT[f].addEventListener("click", function() {
			var cname = this.className.split(" ");
			var newCname = cname[0]+" "+((cname[1]=="on") ? "off" : "on");
			this.className = newCname;
			filterTypes([newCname]);
			filterText();
			paginateTable(0);
		})
	}
	filterTypes(filter);
	// Filtro de contenido de texto
	document.getElementById("contains").onkeyup = function() {
		filterText();
		paginateTable(0);
	}
	// Ordenación de la tabla
	var heads = document.getElementById("table").getElementsByTagName("th");
	for (var h=0; h<heads.length; h++) {
		heads[h].addEventListener("click", function(ev) {
			sortTable(this.className.match(/T_\w+/)[0],
				this.className.match("sort_up"),
				this.hasAttribute("data-float"));
		})
	}
}
function showDetail(marker) {
	map.panTo(marker.position);
	map.setZoom(16);
	var det=document.getElementById("detail");
	det.className = "on";
	var row = document.getElementById(marker.get("id"));
	var label = row.getElementsByClassName("T_ADDR")[0].getAttribute("label");
	var address = row.getElementsByClassName("T_ADDR")[0]
		.getElementsByTagName("a")[0].textContent;
	var link = row.getElementsByClassName("T_ADDR")[0]
		.getElementsByTagName("a")[0].href;
	var city = row.getElementsByClassName("T_LOC")[0].textContent;
	document.getElementById("d-title").textContent = 
		"Gasolinera '"+label+"' en "+city+", "+address;
		document.getElementById("d-link").href = link;
	var priceList = document.getElementById("d-prices");
	priceList.innerHTML = "";
	var prices = row.getElementsByClassName("price");
	for (var p=0; p<prices.length; p++) {
		var t = prices[p].className.match(/T_\w+/)[0].replace("T_", "");
		var newL = document.createElement("li");
		newL.textContent = FUEL_NAMES[t];
		var newP = document.createElement("div");
		newP.textContent = prices[p].textContent;
		newL.appendChild(newP);
		priceList.appendChild(newL);
	}

	google.maps.event.addListenerOnce(map, "mousedown", function() {
		document.getElementById("detail").className = "";
	})
}
function populateInfo() {
	var divInfo = document.getElementById("info");
	divInfo.innerHTML = "<p>Se han encontrado " + Stats.n + " puntos de venta.</p>";
	var divSum = document.getElementById("summary");
	for (var t in Stats.types) {
		var data = Stats.types[t];
		var tr = document.createElement("tr");
		tr.className = "data T_"+t;
		var td = document.createElement("td");
		td.textContent = FUEL_OPTIONS[t]["name"]; tr.appendChild(td);
		td = document.createElement("td");
		td.textContent = data.n; tr.appendChild(td);
		td = document.createElement("td");
		td.textContent = data.min.toFixed(3); td.className="price min"; tr.appendChild(td);
		td = document.createElement("td");
		td.textContent = data.mean.toFixed(3); td.className="price mean"; tr.appendChild(td);
		td = document.createElement("td");
		td.textContent = data.max.toFixed(3); td.className="price max"; tr.appendChild(td);
		divSum.appendChild(tr);
	}
}

/* Tipos dec omsbutible seleccionados por el usuario */
function getSelTypes() {
	var res = [];
	var types = document.getElementById("types").getElementsByClassName("on");
	for (var t=0; t<types.length; t++) res.push(types[t].className.split(" ")[0]);
	return res;
}
function populateTable(types) {
	var table = document.getElementById("table-data");
	table.innerHTML = "";
	var path = document.location.pathname.split("/");
	var cities = [];
	for (var p in data) {
		var p_link = encodeName(p);
		for (var t in data[p]) {
			var t_link = encodeName(t);
			var s_link = "/gasolineras/" + p_link + "/" + t_link;
			cities.push([t, s_link]);
			for (var s in data[p][t]) {
				var dataPTS = data[p][t][s];
				var label = dataPTS["label"];
				var tr = document.createElement("tr");
				tr.className = "r_on";
				var td_town = document.createElement("td");
				var a_town = document.createElement("a");
				a_town.href = s_link;
				a_town.title = "Todas las gasolineras de " + t;
				a_town.textContent = t.toUpperCase();
				td_town.className = "T_LOC";
				td_town.appendChild(a_town);
				tr.appendChild(td_town);
				var td_s = document.createElement("td");
				var a_s = document.createElement("a");
				a_s.href = "/ficha/" + p_link + "/" + t_link + "/" + encodeName(s);
				a_s.textContent = toTitle(s);
				a_s.title = "Detalles de la gasolinera en " + t + ", " + a_s.textContent;
				td_s.appendChild(a_s);
				td_s.className = "T_ADDR";
				td_s.setAttribute("label", label);
				var logo = getLogo(label);
				if (logo) td_s.style.backgroundImage = "url('/img/logos/"+logo+"_mini.png')";
				tr.appendChild(td_s);
				var td_dist = document.createElement("td");
				td_dist.className = "T_DIST";
				// Marcadores
				if (dataPTS.hasOwnProperty("latlon")) {
					var pos = new google.maps.LatLng(dataPTS.latlon[0], dataPTS.latlon[1]);
					var color = COLORS.p_max;
					var colorS = COLORS.p_maxStroke;
					var options = { 
						icon: {
							path: google.maps.SymbolPath.CIRCLE,
							strokeColor: colorS,
							strokeOpacity: 1.0,
							strokeWeight: 2,
							fillColor: color,
							fillOpacity: .7,
							scale: 8
						}, 
						map: map, position: pos };
					var marker = new google.maps.Marker(options);
					google.maps.event.addListener(marker, 'click', function(e) {
						showDetail(this);
					});
					tr.id="tr-"+markers.length;
					td_dist.id="td-"+markers.length;
					markers.push(marker);
					td_dist.setAttribute("data-geo", dataPTS["latlon"].join(","));
					td_dist.addEventListener("click", function() {
						var marker = markers[this.id.split("-")[1]];
						showDetail(marker);
					});
					marker.set("id", tr.id);
				}
				tr.appendChild(td_dist);
				// Precios
				for (var o in FUEL_OPTIONS) {
					otd = document.createElement("td");
					var price = dataPTS["options"][o];
					if (price) {
						otd.textContent = price.toFixed(3);
						otd.className = "T_" + o + " on";
					} else otd.className = "T_" + o;
					tr.appendChild(otd);
				}
				table.appendChild(tr);
				Stats.add(dataPTS["options"]);
			}
		}
	}
	Stats.run();
	if (cities.length > 1) { // Lista de ciudades
		var citiesList = document.getElementById("cities-list");
		cities.sort(function(a, b) {
			if (a[0].toLowerCase()<b[0].toLowerCase()) return -1;
			if (a[0].toLowerCase()>b[0].toLowerCase()) return 1;
			return 0;
		});
		for (var c=0; c<cities.length; c++) {
			var newCity = document.createElement("li");
			newCity.innerHTML = cities[c][0].link(cities[c][1]);
			citiesList.appendChild(newCity);
		}
	}
	else document.getElementById("p-cities").style.display = "none";
}

function processData(info) {
	console.log(info);
	var h1 = document.getElementById("title");
	if (info["_near"]) {
		h1.textContent = "Gasolineras cerca de: " + info["_near"];
		place = info["_near"];
	}
	else {
		var pts = decodeArray(document.location.pathname.split("/").splice(2));
		province = prettyName(pts[0]);
		if (pts[1]) town = prettyName(pts[1]);
		h1.textContent = "Gasolineras en " + ((town) ? (town + ", ") : ("la ")) + "provincia de " + province;
		place = ((town) ? (town + ", " + province) : (province));
	}
	data=info._data;
	initMap();
	populateTable();
	populateInfo();
	// para cambiar la imagen http://stackoverflow.com/questions/4416089/google-maps-api-v3-custom-cluster-icon
	// for (var m=0; m<markers.length; m++) markers[m].setMap(map);
	initControl();
	newReference(place);
	paginateTable(0);
}

window.addEventListener("load", function() {
	getData(processData);
})