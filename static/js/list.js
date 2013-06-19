var data;			// datos obtenidos de la api
var map;			// el mapa de Google
var place = "";
var markers = [];	// lista de marcadores sobre el mapa
var province = "";
var town = "";
var markerCenter=null;
var markerDetail=null;
var pagerN = 15;
var pagerCurrent = null;
var cluster = null;
var bounds = new google.maps.LatLngBounds();
var TO_DAYS = 86400000;

/** @constructor */
function Stats() {
	this.types = {};
	this.n = 0;
	this.init = false;
	this.add =function(station) {
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
	};
	this.run = function() {
		// Peso relativo de cada tipo de combustible
		var N=0;
		for (var t in this.types) {
			N+=this.types[t].n;
			this.types[t].range = this.types[t].max - this.types[t].min;
		}
		for (var t in this.types) this.types[t].w = this.types[t].n/N;
		this.init = true;
	};
}

var stats = new Stats();

function newReference(loc) {
	var location = loc;
	if(!location) location = document.getElementById("from").value;
	var geocoder = new google.maps.Geocoder();
	geocoder.geocode({'address': location}, function (res, stat) {
		var infoDiv = document.getElementById("distance-info");
		if (stat == google.maps.GeocoderStatus.OK) {
			if (!markerCenter) {
				markerCenter = new google.maps.Marker({
	            	map: map,
	            	position: res[0].geometry.location,
	            	icon: '/img/center_mark.png'
				});
			} else {
				markerCenter.setPosition(res[0].geometry.location);
			}
			markerCenter.set("place", res[0].formatted_address);
			map.panTo(res[0].geometry.location);
			bounds.extend(markerCenter.position);
			map.fitBounds(bounds);
			calcDistances();
			var nearest = document.getElementById("table-data").getElementsByTagName("tr")[0];
			if (nearest) {
				infoDiv.innerHTML = "La gasolinera más próxima a " + 
					res[0].formatted_address + " se encuentra en " + 
					nearest.getElementsByClassName("T_ADDR")[0].textContent;
			} else infoDiv.innerHTML = "No se ha encontrado ninguna gasolinera. Intenta ampliar el radio de busqueda";
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
			var dlat = (latlon[0] - markerCenter.position.lat()) * Lat2Km;
			var dlon = (latlon[1] - markerCenter.position.lng()) * Lon2Km;
			var dist = Math.sqrt(dlat*dlat+dlon*dlon).toFixed(1);
			tds[i].getElementsByTagName("span")[0].textContent = dist;
		}
	}
	sortTable("T_DIST", false, true);
}
function mapCluster() {
	if (document.getElementById("cluster").checked) {
		for (var m=0; m<markers.length; m++) {
			if (markers[m].getMap()) cluster.addMarker(markers[m]);
		}
	} else {
		cluster.clearMarkers();
		updateMarkers();
	}
}
function markerColor(sel, price) {
	var mean = 0;
	var n = 0;
	for (var i=0; i<sel.length; i++) {
		var current = sel[i];
		var p = price[current];
		var s = stats.types[current];
		if (s && p) {
			if (s.range) mean = (mean*n+((p-s.min)/s.range))/++n;
			else mean = mean*n+.5/++n;
		}
	}
	if (n==0) return null;
	if (mean<.33) return [COLORS.minStroke, COLORS.min];
	if (mean<.66) return [COLORS.muStroke, COLORS.mu];
	return [COLORS.maxStroke, COLORS.max];
}
function updateMarkers() {
	var rows = document.getElementById("table-data").getElementsByTagName("tr");
	selection = getSelTypes();
	for (var r=0; r<rows.length; r++) {
		var marker = markers[rows[r].id.split("-")[1]];
		if (marker) {
			if (rows[r].className.match("r_on")) {
				var color = markerColor(selection, marker.get("price"));
				if (color) {
					marker.setMap(map);
					marker.icon.strokeColor = color[0];
					marker.icon.fillColor = color[1];
					continue;
				}
			}
			marker.setMap(null);
		}
	}
}

function initMap() {
	var mapOptions = {
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById("google_map"),
		mapOptions);
	var clusterOptions = {
		imagePath: "/",
		styles: [{height: 40, width: 40, url: "/img/cluster.png", backgroundPosition: "-2px -2px"},
			{height: 50, width: 50, url: "/img/cluster.png", backgroundPosition: "-44px -2px"},
			{height: 60, width: 60, url: "/img/cluster.png", backgroundPosition: "-2px -54px"},
			{height: 70, width: 70, url: "/img/cluster.png", backgroundPosition: "-2px -116px"}]
	}
	// cluster = new MarkerClusterer(map);
	cluster = new MarkerClusterer(map, null, clusterOptions);
	// adsense
	if (window.location.hostname.match("localhost")) return;
	var adUnitDiv = document.createElement('div');
	var adUnitOptions = {
		format: google.maps.adsense.AdFormat.VERTICAL_BANNER,
		position: google.maps.ControlPosition.RIGHT_TOP,
		backgroundColor: '#c4d4f3',
		borderColor: '#e5ecf9',
		titleColor: '#0000cc',
		textColor: '#000000',
		urlColor: '#009900',
		map: map,
		visible: true,
		publisherId: 'pub-9285487390483271'
	}
	adUnit = new google.maps.adsense.AdUnit(adUnitDiv, adUnitOptions);
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
			var cell = cells[c];
			if (f[1]=="off") cell.className = c_off;
			else if (cell.textContent) cells[c].className = c_on;
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
		if (stats.types[filterT[f].className.split(" ")[0].split("_")[1]]) {
			filter.push(filterT[f].className);
			filterT[f].addEventListener("click", function() {
				var cname = this.className.split(" ");
				var newCname = cname[0]+" "+((cname[1]=="on") ? "off" : "on");
				this.className = newCname;
				filterTypes([newCname]);
				filterText();
				paginateTable(0);
				updateMarkers();
			})
		} else {
			filter.push(filterT[f].className.replace("on", "off"));
			filterT[f].className = "disabled";
		}
	}
	filterTypes(filter);
	// Filtro de contenido de texto
	document.getElementById("contains").onkeyup = function() {
		filterText();
		paginateTable(0);
		updateMarkers();
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
	// map.setZoom(16);
	if (!markerDetail) markerDetail = new google.maps.Marker({
		position: marker.position,
		map: map,
		animation: google.maps.Animation.BOUNCE,
		icon: '/img/pump_mark.png'
	}); 
	else {
		markerDetail.setMap(map); 
		markerDetail.position = marker.position;
		markerDetail.setAnimation(google.maps.Animation.BOUNCE);};
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
	var prices = row.getElementsByTagName("td");
	for (var p=4; p<prices.length; p++) {
		var val = prices[p].textContent;
		if (!val) continue;
		var t = prices[p].className.match(/T_\w+/)[0].replace("T_", "");
		var newL = document.createElement("li");
		newL.textContent = FUEL_OPTIONS[t].name;
		newL.className = "T_"+t;
		var newP = document.createElement("div");
		newP.textContent = val;
		newL.appendChild(newP);
		priceList.appendChild(newL);
	}
	var dateDiv = document.getElementById("d-date");
	var clockDiv = document.getElementById("d-clock");
	var days = (new Date() - new Date(parseInt(row.getElementsByClassName("T_DATE")[0].textContent)))/TO_DAYS;
	var ago = "", cname="sprt clock";
	if (days<1) {ago = " hoy"; cname+="_new"}
	else {
		ago = " hace "+Math.floor(days)+" día" + ((days>2) ? "s" : "");
		cname += (days<=7) ? "_med" : "_old";
	}
	dateDiv.textContent = "Precios actualizados "+ago;
	clockDiv.className = cname;
	google.maps.event.addListenerOnce(map, "mousedown", function() {
		document.getElementById("detail").className = "";
		markerDetail.setMap(null);
	})
}
function populateInfo() {
	var divInfo = document.getElementById("info");
	divInfo.innerHTML = "<p>Se han encontrado " + stats.n + " puntos de venta.</p>";
	var divSum = document.getElementById("summary-b");
	for (var t in stats.types) {
		var data = stats.types[t];
		var tr = document.createElement("tr");
		tr.className = "data T_"+t;
		var td = document.createElement("td");
		td.textContent = FUEL_OPTIONS[t]["name"]; tr.appendChild(td);
		td = document.createElement("td");
		td.textContent = data.n; tr.appendChild(td);
		td = document.createElement("td");
		td.innerHTML = "<span>"+data.min.toFixed(3)+"</span>"; td.className="price min"; tr.appendChild(td);
		td = document.createElement("td");
		td.innerHTML = "<span>"+data.mean.toFixed(3)+"</span>"; td.className="price mean"; tr.appendChild(td);
		td = document.createElement("td");
		td.innerHTML = "<span>"+data.max.toFixed(3)+"</span>"; td.className="price max"; tr.appendChild(td);
		divSum.appendChild(tr);
	}
}

/* Tipos dec omsbutible seleccionados por el usuario */
function getSelTypes() {
	var res = [];
	var types = document.getElementById("types").getElementsByClassName("on");
	for (var t=0; t<types.length; t++) res.push(parseInt(types[t].className.split(" ")[0].split("_")[1]));
	return res;
}
function populateTable(types) {
	var table = document.getElementById("table-data");
	table.innerHTML = "";
	var path = document.location.pathname.split("/");
	var cities = [];
	var today = new Date;
	for (var p in data) {
		var p_link = encodeName(p);
		for (var t in data[p]) {
			var t_link = encodeName(t);
			var s_link = "/gasolineras/" + p_link + "/" + t_link;
			cities.push([t, s_link]);
			for (var s in data[p][t]) {
				var dataPTS = data[p][t][s];
				var label = dataPTS["l"];
				var tr = document.createElement("tr");
				tr.className = "r_on";
				var td_town = document.createElement("td");
				var a_town = document.createElement("a");
				a_town.href = s_link;
				a_town.title = "Todas las gasolineras de " + t;
				a_town.textContent = t; // .toUpperCase();
				td_town.className = "T_LOC";
				td_town.appendChild(a_town);
				tr.appendChild(td_town);
				var td_s = document.createElement("td");
				var a_s = document.createElement("a");
				a_s.href = "/ficha/" + p_link + "/" + t_link + "/" + encodeName(s);
				a_s.textContent = toTitle(s);
				a_s.title = "Detalles de la gasolinera en " + t + ", " + a_s.textContent;
				td_s.className = "T_ADDR";
				td_s.setAttribute("label", label);
				var td_ref = document.createElement("div");
				td_ref.className = "ref";
				var logo = getLogo(label);
				if (logo) {
					var dl = document.createElement("div");
					dl.className = "logo "+logo;
					td_ref.appendChild(dl);
				}
				td_ref.appendChild(a_s);
				td_s.appendChild(td_ref);
				tr.appendChild(td_s);
				var td_dist = document.createElement("td");
				td_dist.className = "T_DIST";
				// Marcadores
				if (dataPTS.hasOwnProperty("g")) {
					var pos = new google.maps.LatLng(dataPTS.g[0], dataPTS.g[1]);
					var options = { 
						icon: {
							path: google.maps.SymbolPath.CIRCLE,
							strokeOpacity: 1.0,
							strokeWeight: 1,
							fillOpacity: .8,
							scale: 6
						}, 
						map: map, position: pos };
					var marker = new google.maps.Marker(options);
					google.maps.event.addListener(marker, 'click', function(e) {
						showDetail(this);
					});
					marker.set("price", dataPTS["o"]);
					tr.id="tr-"+markers.length;
					td_dist.id="td-"+markers.length;
					markers.push(marker);
					td_dist.setAttribute("data-geo", dataPTS.g.join(","));
					td_dist.addEventListener("click", function() {
						var marker = markers[this.id.split("-")[1]];
						showDetail(marker);
					});
					marker.set("id", tr.id);
					bounds.extend(pos);
					td_dist.innerHTML = "<div class='ref'><div title='Mostrar en el mapa' class='sprt locate'></div><span></span></div>";
				}
				tr.appendChild(td_dist);
				// Fecha de actualización
				var td_date = document.createElement("td");
				td_date.className = "T_DATE";
				var dd = document.createElement("div");
				var date = new Date(dataPTS.d);
				var days = (today-date)/TO_DAYS;
				dd.className = "sprt clock";
				if (days<1) dd.className += "_new";
				else if (days>7) dd.className += "_old";
				else dd.className += "_med";
				td_date.title = date.toLocaleDateString();
				td_date.innerHTML = "<span>"+date.getTime()+"</span>";
				td_date.appendChild(dd);
				tr.appendChild(td_date);
				// Precios
				for (var o in FUEL_OPTIONS) {
					otd = document.createElement("td");
					var price = dataPTS["o"][o];
					if (price) {
						otd.textContent = price.toFixed(3);
						otd.className = "T_" + o + " on";
					} else otd.className = "T_" + o;
					tr.appendChild(otd);
				}
				table.appendChild(tr);
				stats.add(dataPTS["o"]);
			}
			map.fitBounds (bounds);
		}
	}
	stats.run();
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
	initControl();
	newReference(place);
	updateMarkers();
	paginateTable(0);
}

window.addEventListener("load", function() {
	new Gasole(function() {
		var info = {"_data": {}};
		var pathArray = decodeArray(window.location.pathname.split("/"));
		var option = pathArray[1]; // gasolineras, resultados, ficha
		if (option == "gasolineras") {
			var prov  = pathArray[2];
			if (pathArray[3]) {
				var town = pathArray[3];
				info._data[prov] = {};
				info._data[prov][town] = this.info[prov][town];
			} else info._data[prov] = this.info[prov];
		} else if (option == "resultados") {
			var location = new SearchLocations();
			var place = pathArray[2];
			location.add(place, [parseFloat(pathArray[3]),parseFloat(pathArray[4])]);
			location.radius = parseFloat(pathArray[5]);
			info._data = this.nearData(location);
			info._near = place;
		}
		processData(info);
	});
})