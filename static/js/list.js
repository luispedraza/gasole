var data;
var map;
var markers = [];
var province = "";
var infoWindow = null;
var town = "";
var markerCenter;
var pagerN = 20;
var pagerCurrent = 0;

var FUEL_OPTIONS = {"1": {"short": "G95", "name": "Gasolina 95"},
				// "2": {"short": "G97", "name": "Gasolina 97"},
				"3": {"short": "G98", "name": "Gasolina 98"},
				"4": {"short": "GOA", "name": "Gasóleo Automoción"},
				"5": {"short": "NGO", "name": "Nuevo Gasóleo A"},
				"6": {"short": "GOB", "name": "Gasóleo B"},
				"7": {"short": "GOC", "name": "Gasóleo C"},
				"8": {"short": "BIOD", "name": "Biodiésel"}}

function newDistance() {
	var location = document.getElementById("from").value + 
		((town) ? (", " + town ) : ("")) + 
		", " + province + ", " + "Spain";
	var geocoder = new google.maps.Geocoder();
	geocoder.geocode({'address': location}, function (res, stat){
		if (stat == google.maps.GeocoderStatus.OK) {
			markerCenter.setPosition(res[0].geometry.location);
			map.panTo(res[0].geometry.location);
			calcDistances();
		} else {
			alert("Geocode ha fallado: " + stat);
		}
	});
}

function paginateTable(index) {
	var rows = document.getElementById("table_data").getElementsByTagName("tr");
	var pager_links = document.getElementById("pager_links");
	pager_links.innerHTML = "";
	if (typeof index == "string") {
		if (index == "more") index = Math.min(pagerCurrent+pagerN, parseInt(rows.length/pagerN)*pagerN);
		else if (index == "less") index = Math.max(pagerCurrent-pagerN, 0);
	}
	for (var r=0; r<rows.length; r++) {
		if (r<index) rows[r].className = "r_off";
		else if (r<index+pagerN) rows[r].className = "r_on";
		else rows[r].className = "r_off";
		if (r%pagerN == 0){
			var link = document.createElement("div");
			link.innerHTML = ((r+1) + "<br/>" + Math.min(r+pagerN, rows.length))
				.link("javascript:paginateTable(" + r + ");");
			if (r==index) link.className = "current";
			pager_links.appendChild(link);
		}
	}
	pagerCurrent = index;
}


function calcDistances() {
	var rows = document.getElementById("table_data").getElementsByTagName("tr");
	for (var r=0; r<rows.length; r++) {
		try {
			var latlon = rows[r].id.split(",");
			var dlat = (latlon[0] - markerCenter.position.lat()) * 111.03461;
			var dlon = (latlon[1] - markerCenter.position.lng()) * 85.39383;
			var dist = Math.sqrt(dlat*dlat+dlon*dlon).toFixed(1);
			rows[r].getElementsByClassName("T_DIST")[0].textContent = dist;
		}
		catch(e) {};
	}
	sortTable("T_DIST");
}

function initMap(callback) {
	var place = ((town) ? (town + ", " + province) : (province));
	var mapOptions = {
		center: new google.maps.LatLng(40.400, 3.6833),
		zoom: 8,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById("google_map"),
		mapOptions);
	var geocoder = new google.maps.Geocoder();
	geocoder.geocode({'address': place}, function (res, stat){
		if (stat == google.maps.GeocoderStatus.OK) {
			map.setCenter(res[0].geometry.location)
			markerCenter = new google.maps.Marker({
            	map: map,
            	position: res[0].geometry.location,
            	draggable: true
			});
		} else {
			alert("Geocode ha fallado: " + stat);
		}
		callback();
	});
	var latlon = data.latlon;
	var image = "/icon/pump_r.png";
	for (p in latlon) {
		for (t in latlon[p]) {
			for (s in latlon[p][t]) {
				var pos = new google.maps.LatLng(latlon[p][t][s][0], latlon[p][t][s][1]);
				var marker = new google.maps.Marker({
					// map: map,
					position: pos,
					icon: image,
					// animation: google.maps.Animation.DROP
				})
				google.maps.event.addListener(marker, 'click', function(e) {
					if (infoWindow) infoWindow.close();
					infoWindow = new google.maps.InfoWindow({
						content: "contenido"
					})
					infoWindow.open(map, this);
				});
				markers.push(marker);
			}
		}
	}
	// para cambiar la imagen http://stackoverflow.com/questions/4416089/google-maps-api-v3-custom-cluster-icon
	var markerCluster = new MarkerClusterer(map, markers);
}
function sortTable(cname, reverse) {
	if (typeof reverse == "undefined")
		reverse = false;
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
			if (a[i][0]<=pivot[0]) less.push(a[i]);
			else greater.push(a[i]);
		}
		return quickSort(less).concat(pivot, quickSort(greater));
	}
	var table_data = document.getElementById("table_data");
	var values = table_data.getElementsByClassName(cname);
	var array = [];
	for (var v=0; v<values.length; v++)
		if (values[v].textContent)
			array.push([values[v].textContent, v]);
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
		headers[h].className = headers[h].className.replace(" sort_up", "")
			.replace(" sort_down", "");
		if (headers[h].className.match(cname)) {
			headers[h].className = headers[h].className + ((reverse) ? (" sort_down") : (" sort_up"));
		}
	}
}

function initControl() {
	// Filtro de tipo de gasolina
	var filterT = document.getElementById("fuel_type").getElementsByTagName("li");
	for (var f=0; f<filterT.length; f++) {
		filterT[f].addEventListener("click", function(e) {
			var cname = e.target.className.split(" ")[0];
			if (e.target.className.match("off")) {
				e.target.className = e.target.className.replace("off", "on");
			}
			else {
				e.target.className = e.target.className.replace("on", "off");
			}
			var trs = document.getElementById("table").getElementsByTagName("tr");
			for (var tr=0; tr<trs.length; tr++) {
				var row = trs[tr];
				row.getElementsByClassName(cname)[0].className = e.target.className;
				var tds = row.getElementsByClassName("on");
				var st_aux = "";
				for (var td=0; td<tds.length; td++) {
					st_aux+=tds[td].textContent;
				}
				row.className = (st_aux.length) ? ("r_on") : "r_off";
			}
			paginateTable(0);
		})
	}
	// Filtro de contenido de texto
	document.getElementById("contains").onkeyup = function(e) {
		function cleanFilter(s) {
			return s.toLowerCase()
				.replace("/áàä/g", "a")
				.replace("/éèë/g", "e")
				.replace("/íìï/g", "i")
				.replace("/óòö/g", "o")
				.replace("/úùü/g", "u")
		}
		var filtervalue = e.target.value;
		var terms = filtervalue.split(" ");
		var rows = document.getElementById("table").getElementsByTagName("tr");
		for (var f=1; f<rows.length; f++) {
			row = rows[f];
			var found = false;
			for (var t=0; t<terms.length; t++) {
				term = terms[t];
				if (term.length!=0) {
					var expected = (term[0]!="-");
					if (!expected) {
						term = term.substr(1);
						if (term.length == 0) continue;
					}
					var cells = row.getElementsByTagName("td");
					for (var c=0; c<2; c++) {
						var cell = cells[c];
						found = found || (RegExp(term, "i").exec(cleanFilter(cell.textContent)) != null);
					}
					row.className = ((found != expected) ? ("r_off") : ("r_on"));
				}
			}
		}
	}
	// Interactividad con la tabla 
	var rows = document.getElementById("table_data").getElementsByTagName("tr");
	for (var r=0; r<rows.length; r++) {
		rows[r].addEventListener("mouseover", function() {

		})
	}
	// Ordenación de la tabla
	var heads = document.getElementById("table").getElementsByTagName("th");
	for (var h=0; h<heads.length; h++) {
		heads[h].addEventListener("click", function(ev) {
			sortTable(this.className.match(/T_\w+/)[0],
				this.className.match("sort_up"));
		})
	}

	// Tamaño del mapa 
	document.getElementById("zoom_google_map").addEventListener("click", function() {
		var mapDiv = document.getElementById("google_map");
		mapDiv.className = ((mapDiv.className) ? "" : "big");
		setTimeout(function() {
			google.maps.event.trigger(map, 'resize');
		}, 1000);
	})
	// Control de resultados
	var controls = document.getElementsByClassName("c_item");
	for (var c=0; c<controls.length; c++) {
		controls[c].addEventListener("click", function(ev) {
			var c_contents = document.getElementsByClassName("c_content");
			for (var cc=0; cc<c_contents.length; cc++)
				c_contents[cc].className = c_contents[cc].className.replace(" on", "");
			document.getElementById(ev.target.id.replace("c_", "")).className += " on";
			var c_items = document.getElementsByClassName("c_item");
			for (var cc=0; cc<c_items.length; cc++)
				c_items[cc].className = c_items[cc].className.replace(" on", "");
			this.className += " on";
		})
	}
}
function populateTable(id) {
	var info = data.info;
	var table = document.getElementById(id);
	var path = document.location.pathname.split("/");
	var nTotal = nG95 = nG98 = nGOA = nGO = nGOB = nGOC = nBIOD = 0;
	var cities = [];
	var p_link, t_link, s_link;
	for (var p in info) {
		p_link = path[2] || encodeName(p);
		for (var t in info[p]) {
			t_link = path[3] || encodeName(t);
			s_link = "/gasolineras/" + p_link + "/" + t_link;
			cities.push([t, s_link]);
			for (var s in info[p][t]) {
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
				tr.appendChild(td_s);
				// Distancia al marcador
				var td_dist = document.createElement("td");
				try {
					var dlat = (data.latlon[p][t][s][0] - markerCenter.position.lat()) * 111.03461;
					var dlon = (data.latlon[p][t][s][1] - markerCenter.position.lng()) * 85.39383;
					td_dist.textContent = Math.sqrt(dlat*dlat+dlon*dlon).toFixed(1);
				}
				catch(e) {
					td_dist.textContent = "";
				}
				td_dist.className = "T_DIST";
				tr.appendChild(td_dist);
				for (var o in FUEL_OPTIONS) {
					var otd = document.createElement("td");
					otd.className = "T_" + FUEL_OPTIONS[o]["short"] + " on";
					otd.textContent = info[p][t][s]["options"][o] || "";
					tr.appendChild(otd);
				}
				// ID de fila, que coincide con lat,lon
				try {tr.id = data.latlon[p][t][s].join(",");}
				catch (e){}
				table.appendChild(tr);
				nTotal++;
			}
		}
	}
	paginateTable(0);
	var divInfo = document.getElementById("info");
	divInfo.innerHTML = "<p>Se han encontrado " + nTotal + " gasolineras en " + ((town)?(town):(province)).bold() + ".</p>";
	if (cities.length > 1) { // Lista de ciudades
		var citiesList = document.getElementById("cities_list");
		for (var c=0; c<cities.length; c++) {
			var newCity = document.createElement("li");
			newCity.innerHTML = cities[c][0].link(cities[c][1]);
			citiesList.appendChild(newCity);
		}
	}
	else {
		document.getElementById("c_cities").style.display = "none";
	}
}

window.addEventListener("load", function(){
	var req = new XMLHttpRequest();
	req.onload = function(r) {
		data = JSON.parse(r.target.responseText);
		console.log(data);
		var pts = decodeArray(document.location.pathname.split("/").splice(2));
		province = prettyName(pts[0]);
		if (pts[1]) {
			town = prettyName(pts[1]);
		}
		var h1 = document.getElementById("title");
		h1.textContent = "Gasolineras en " + ((town) ? (town + ", ") : ("la ")) + "provincia de " + province;
		initMap(function() {populateTable("table_data");});
		initControl();
	}
	var url = document.URL;
	if (url.match("gasolineras")) {
		req.open("GET", document.URL.replace("gasolineras", "api"), true)
	}
	else if (url.match("resultados")) {
		req.open("GET", document.URL.replace("resultados", "geo"), true);
	}
	req.send();
})

