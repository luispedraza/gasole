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
var stats = null;

//var pump_svg = "M213.275-53.875c2.913,2.906,4.371,6.415,4.375,10.525v215.8c0.005,4.14-1.453,7.673-4.375,10.6l-0.025,0.025 c-2.927,2.922-6.46,4.381-10.6,4.375H160.2c-4.14,0.006-7.674-1.453-10.601-4.375l-0.024-0.025c-2.923-2.927-4.381-6.46-4.375-10.6 v-146h-18.55V83.85c0,6.667-3.334,10-10,10H96.05L72.275,191H127v45.15h-256V191h55.65l-24.3-97.15h-20.6c-6.667,0-10-3.333-10-10 v-76h42.85V56.3h171V-50.95H-85.05V2h-43.2v-81.85c0-6.667,3.333-10,10-10h44.3v-6.25c0-6.667,3.333-10,10-10h126.3 c6.667,0,10,3.333,10,10v6.25h44.301c6.666,0,10,3.333,10,10v76.3h33.55c4.14-0.006,7.673,1.453,10.6,4.375l0.025,0.025 c1.849,1.854,3.107,3.954,3.774,6.3c0.058,0.197,0.099,0.397,0.125,0.6c0.099,0.252,0.173,0.519,0.226,0.8 c0.168,0.93,0.251,1.896,0.25,2.9v146h12.45V-2.2c-5.996-2.521-10.996-5.596-15-9.225l-0.051-0.05 c-0.477-0.45-0.935-0.9-1.375-1.35c-0.571-0.565-1.104-1.132-1.6-1.7c-0.016-0.018-0.032-0.034-0.05-0.05 c-1.509-1.708-2.851-3.507-4.025-5.4v0.025c-1.046-1.694-1.929-3.461-2.649-5.3c-1.189-2.647-2.073-5.447-2.65-8.4v-0.025 c-0.3-1.553-0.524-3.161-0.675-4.825v-0.05c-0.594-7.077,0.448-15.043,3.125-23.9l-23.75-24.025 c-2.877-2.978-4.311-6.502-4.3-10.575c-0.003-4.168,1.497-7.71,4.5-10.625l0.024-0.025c2.932-2.868,6.457-4.301,10.575-4.3h0.05 c4.098,0.047,7.598,1.539,10.5,4.475l53,53.65H213.275z";
// marcadores de gasolineras
var MARKER_IMG = {
	max: new google.maps.MarkerImage("/img/sprt.png", new google.maps.Size(25, 25, "px", "px"), new google.maps.Point(2,390), null, null),
	min: new google.maps.MarkerImage("/img/sprt.png", new google.maps.Size(25, 25, "px", "px"), new google.maps.Point(2,336), null, null),
	mu: new google.maps.MarkerImage("/img/sprt.png", new google.maps.Size(25, 25, "px", "px"), new google.maps.Point(2,444), null, null)
}


// Pesos para colores de gasolinera
function computeWeights(stats) {
	var N=0;
	for (var t in stats) N+=stats[t].n;
	for (var t in stats) stats[t].w = stats[t].n/N;
}

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
	var rlen = rows.length;
	var pager = document.getElementById("pager-links");
	if (!rlen) {
		pager.innerHTML = "<p>No hay resultados coincidentes con los criterios de búsqueda.<br>Comprueba el filtro y tipos de combustible seleccionados.</p>"; return;	
	}
	if (index === "more") index = Math.min(pagerCurrent+pagerN, parseInt(rlen/pagerN)*pagerN);
	else if (index === "less") index = Math.max(pagerCurrent-pagerN, 0);
	if (index>=rlen) return;
	pager.innerHTML = "";
	for (var r=0; r<rlen; r++) {
		rows[r].className = rows[r].className.replace(" p_off", "");
		if ((r<index)||(r>=index+pagerN)) rows[r].className+=" p_off";
		if (r%pagerN == 0) {
			var p = document.createElement("div");
			p.innerHTML = ((r+1) + "<br/>" + Math.min(r+pagerN, rlen));
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
	for (var i=0, tdslen=tds.length; i<tdslen; i++) {
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
		for (var m=0, mlen=markers.length; m<mlen; m++) {
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
		var s = stats[current];
		if (s && p) {
			var range = s.max-s.min;
			if (range) mean = (mean*n+((p-s.min)/range))/++n;
			else mean = mean*n+.5/++n;
		}
	}
	if (n==0) return null;
	if (mean<.33) return COLORS.min;
	if (mean<.66) return COLORS.mu;
	return COLORS.max;
}
function markerImage(sel, price) {
	var mean = 0;
	var n = 0;
	for (var i=0; i<sel.length; i++) {
		var current = sel[i];
		var p = price[current];
		var s = stats[current];
		if (s && p) {
			var range = s.max-s.min;
			if (range) mean = (mean*n+((p-s.min)/range))/++n;
			else mean = mean*n+.5/++n;
		}
	}
	if (n==0) return null;
	if (mean<.33) return MARKER_IMG.min;
	if (mean<.66) return MARKER_IMG.mu;
	return MARKER_IMG.max;
}
function updateMarkers() {
	var rows = document.getElementById("table-data").getElementsByTagName("tr");
	selection = getSelTypes();
	for (var r=0; r<rows.length; r++) {
		var marker = markers[rows[r].id.split("-")[1]];
		if (marker) {
			if (rows[r].className.match("r_on")) {
				// var color = markerColor(selection, marker.get("price"));
				var img = markerImage(selection, marker.get("price"));
				if (img) {
					marker.setMap(map);
					// marker.icon.fillColor = color;
					marker.icon = img;
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
		var alen = a.length;
		/* Ordenación QuickSort de una tabla */
		if (alen<=1) return a;
		var npivot = Math.floor(Math.random()*alen);
		for (var p=npivot+1; p<alen; p++)
			if (a[p][0]!=a[npivot][0]) break;
		var pivot = a.splice(p-1, 1);
		alen = a.length;
		var less = [];
		var greater = [];
		for (var i=0; i<alen; i++) {
			if (a[i][0]<=pivot[0][0])
				less.push(a[i]);
			else greater.push(a[i]);
		}
		return quickSort(less).concat(pivot, quickSort(greater));
	}
	var table_data = document.getElementById("table-data");
	var values = table_data.getElementsByClassName(cname);
	var array = [];
	for (var v=0, vlen=values.length; v<vlen; v++)
		if (values[v].textContent) {
			var newval = (isfloat ? parseFloat(values[v].textContent) : values[v].textContent);
			array.push([newval, v]);
		}
	array = quickSort(array);
	if (reverse) array.reverse();
	var rows = table_data.getElementsByTagName("tr");
	var static_rows = [];
	for (var r=0, rlen=rows.length; r<rlen; r++) static_rows.push(rows[r]);
	for (var e=0, alen=array.length; e<alen; e++) {
		table_data.insertBefore(static_rows[array[e][1]], table_data.children[e]);
	}
	var headers = document.getElementById("table").getElementsByTagName("th");
	for (var h=0, hlen=headers.length; h<hlen; h++) {
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
		for (var c=0, clen=cells.length; c<clen; c++) {
			var cell = cells[c];
			if (f[1]=="off") cell.className = c_off;
			else if (cell.textContent) cells[c].className = c_on;
			else cells[c].className = c_na;
		}
	}
	var rows = document.getElementById("table-data").getElementsByTagName("tr");
	for (var r=0, rlen=rows.length; r<rlen; r++)
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
	var rows = document.getElementById("table-data").getElementsByTagName("tr");
	var rlen = rows.length;
	if (filtervalue.length) {
		var terms = filtervalue.split(/ +/);
		for (var f=0; f<rlen; f++) {
			var row = rows[f];
			if (row.className=="r_off") continue;
			for (var t=0, tlen=terms.length; t<tlen; t++) {
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
		for (var f=0; f<rlen; f++) rows[f].className="r_on";
	}
}

function initControl() {
	// Filtro de tipo de gasolina. Elimina columnas
	var filterT = document.getElementById("fuel-type").getElementsByTagName("li");
	var filter = [];
	for (var f=0; f<filterT.length; f++) {
		if (stats[filterT[f].className.split(" ")[0].split("_")[1]]) {
			filter.push(filterT[f].className);
			addEvent(filterT[f],"click", function() {
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
		addEvent(heads[h],"click", function() {
			sortTable(this.className.match(/T_\w+/)[0],
				this.className.match("sort_up"),
				this.hasAttribute("data-float"));
		})
	}
	// Para que no haga scroll el documento cuando se hace scroll en cities-list
	lockScroll("cities-list");

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
	for (var p=4, plen=prices.length; p<plen; p++) {
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
	var divSum = document.getElementById("summary-b");
	for (var t in stats) {
		var data = stats[t];
		var tr = document.createElement("tr");
		tr.className = "data T_"+t;
		var td = document.createElement("td");
		td.textContent = FUEL_OPTIONS[t]["name"]; tr.appendChild(td);
		td = document.createElement("td");
		td.textContent = data.n; tr.appendChild(td);
		td = document.createElement("td");
		td.innerHTML = "<span>"+data.min.toFixed(3)+"</span>"; td.className="price min"; tr.appendChild(td);
		td = document.createElement("td");
		td.innerHTML = "<span>"+data.mu.toFixed(3)+"</span>"; td.className="price mean"; tr.appendChild(td);
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
				var dl = document.createElement("div");
				dl.className = "logo " + (getLogo(label) || "otra");
				td_ref.appendChild(dl);
				td_ref.appendChild(a_s);
				td_s.appendChild(td_ref);
				tr.appendChild(td_s);
				var td_dist = document.createElement("td");
				td_dist.className = "T_DIST";
				// Marcadores
				if (dataPTS.hasOwnProperty("g")) {
					var pos = new google.maps.LatLng(dataPTS.g[0], dataPTS.g[1]);
					var options = { 
						icon: null,
						// icon: {
						// 	path: pump_svg,
						// 	// path: google.maps.SymbolPath.CIRCLE,
						// 	strokeColor: COLORS.stroke,
						// 	strokeOpacity: 1,
						// 	strokeWeight: 1,
						// 	fillOpacity: .9,
						// 	scale: .08
						// }, 
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
					addEvent(td_dist,"click", function() {
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
			}
			map.fitBounds(bounds);
		}
	}
	var clen = cities.length;
	if (clen>1) { // Lista de ciudades
		var citiesList = document.getElementById("cities-list");
		cities.sort(function(a, b) {
			if (a[0].toLowerCase()<b[0].toLowerCase()) return -1;
			if (a[0].toLowerCase()>b[0].toLowerCase()) return 1;
			return 0;
		});
		for (var c=0; c<clen; c++) {
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

addEvent(window,"load", function() {
	breadCrumb("breadcrumb");	// miga de pan 
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
		stats = new GasoleStats(info._data).stats;
		computeWeights(stats);
		processData(info);
		document.getElementById("updated").textContent = "("+formatUpdate(this.date)+")";
	});
})