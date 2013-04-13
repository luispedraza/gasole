var data;
var map;
var place = "";
var markers = [];
var province = "";
var town = "";
var markerCenter;
var pagerN = 15;
var pagerCurrent = 0;
var markerIcon = "/img/pump_mark.png";
var windowTimeout;
var focusMarker;
var infoWindow = null;
var cluster = null;
var priceMaxMin = {};
priceMaxMin.add = function(type, val) {
	if (this.hasOwnProperty(type)) {
		var data = this[type];
		if (val>data.max) data.max=val;
		else if (val<data.min) data.min=val;
		data.mean = (data.mean*data.n+val)/(data.n+1);
		data.n++;
		
	} else {
		this[type] = {
			max: val,
			min: val,
			mean: val,
			n: 1.0
		};
	}
}
var priceMarkers = {};

function newDistance() {
	var location = document.getElementById("from").value + 
		((town) ? (", " + town ) : ("")) + 
		", " + province + ", " + "Spain";
	var geocoder = new google.maps.Geocoder();
	geocoder.geocode({'address': location}, function (res, stat) {
		var infoDiv = document.getElementById("distante_info");
		if (stat == google.maps.GeocoderStatus.OK) {
			markerCenter.setPosition(res[0].geometry.location);
			markerCenter.set("place", res[0].formatted_address);
			map.panTo(res[0].geometry.location);
			calcDistances();
			paginateTable(0);
			var nearest = document.getElementById("table_data").getElementsByTagName("tr")[0];
			infoDiv.innerHTML = "La gasolinera más próxima a " + 
				res[0].formatted_address + " se encuentra en " + 
				nearest.getElementsByClassName("T_ADDR")[0].innerHTML.replace(/ \[.\]/g, "");
			return;
		}
		infoDiv.innerHTML = "No se ha podido encontrar ese lugar.";
	});
}

function paginateTable(index) {
	var rows = document.getElementById("table_data").getElementsByClassName("r_on");
	var pager_links = document.getElementById("pager_links");
	pager_links.innerHTML = "";
	if (index === "more") index = Math.min(pagerCurrent+pagerN, parseInt(rows.length/pagerN)*pagerN);
	else if (index === "less") index = Math.max(pagerCurrent-pagerN, 0);
	for (var r=0; r<rows.length; r++) {
		var cname = rows[r].className;
		rows[r].className = cname.replace(" p_off", "");
		if ((r<index)||(r>=index+pagerN)) rows[r].className += " p_off";
		if (r%pagerN == 0) {
			var p = document.createElement("div");
			p.innerHTML = ((r+1) + "<br/>" + Math.min(r+pagerN, rows.length));
			p.setAttribute("onclick", "javascript:paginateTable(" + r + ");");
			(r==index) ? (p.className="p current"):(p.className="p");
			pager_links.appendChild(p);
		}
	}
	pagerCurrent = index;
}

function calcDistances() {
	var rows = document.getElementById("table_data").getElementsByTagName("tr");
	for (var r=0; r<rows.length; r++) {
		try {
			var latlon = rows[r].getAttribute("latlon").split(",");
			var dlat = (latlon[0] - markerCenter.position.lat()) * 111.03461;
			var dlon = (latlon[1] - markerCenter.position.lng()) * 85.39383;
			var dist = Math.sqrt(dlat*dlat+dlon*dlon).toFixed(1);
			rows[r].getElementsByClassName("T_DIST")[0].textContent = dist;
		}
		catch(e) {};
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
	var min = priceMaxMin[type].min;
	var range = priceMaxMin[type].max - min;
	for (var m=0; m<markers.length; m++) {
		var rowId = markers[m].get("row-id");
		var value = document.getElementById(rowId)
			.getElementsByClassName("T_"+type)[0].innerHTML;
		if (value) value=parseFloat(value); else continue;
		value = (value-min)/range;
		var color = "#f00";
		var colorS = "#D30000";
		if (value<.25) {color = "#36AE34"; colorS="#288627";}
		else if (value<.75) {color = "#FF9933"; colorS="#D07B26";}
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
			map: map,
			position: markers[m].getPosition()
		}
		var marker = new google.maps.Marker(options);
		marker.set("row-id", rowId);
		marker.addListener("click", function() {
			showDetail(this);
		})
		priceMarkers[type].markers.push(marker);
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
	var geocoder = new google.maps.Geocoder();
	geocoder.geocode({'address': place}, function (res, stat){
		if (stat == google.maps.GeocoderStatus.OK) {
			map.setCenter(res[0].geometry.location);
			markerCenter = new google.maps.Marker({
            	map: map,
            	position: res[0].geometry.location,
            	draggable: true
			});
			markerCenter.set("place", res[0].formatted_address);
			google.maps.event.addListener(markerCenter, 'click', function(e) {
				if (infoWindow) infoWindow.close();
				infoWindow = new google.maps.InfoWindow({
					content: "Punto de referencia:<br /> " + this.place.bold()
				})
				infoWindow.open(map, this);
			});
			calcDistances();
		} else {
			alert("Geocode ha fallado: " + stat);
		}
	});
	// para cambiar la imagen http://stackoverflow.com/questions/4416089/google-maps-api-v3-custom-cluster-icon
	// for (var m=0; m<markers.length; m++) markers[m].setMap(map);
	mapCluster();
}
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
	var table_data = document.getElementById("table_data");
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
		headers[h].className = headers[h].className.replace(" sort_up", "")
			.replace(" sort_down", "");
		if (headers[h].className.match(cname)) {
			headers[h].className = headers[h].className + ((reverse) ? (" sort_down") : (" sort_up"));
		}
	}
	paginateTable(0);
}

function initControl() {
	// Filtro de tipo de gasolina
	var filterT = document.getElementById("fuel-type").getElementsByTagName("li");
	for (var f=0; f<filterT.length; f++) {
		filterT[f].addEventListener("click", function(e) {
			var cname = e.target.className;
			var cnameA = cname.split(" ");
			var type = cnameA[0];
			var s0 = cnameA[1];
			var s1 = ((s0=="on") ? "off" : "on");
			e.target.className = cname.replace(s0, s1);
			var trs = document.getElementById("table").getElementsByTagName("tr");
			for (var tr=0; tr<trs.length; tr++) {
				var td = trs[tr].getElementsByClassName(type)[0];
				cname = td.className;
				td.className = cname.replace(s0, s1);
				var ons = trs[tr].getElementsByClassName("on");
				var t="";
				for (var o=0; o<ons.length; o++) {
					t+=ons[o].textContent;
				}
				trs[tr].className = (t.length) ? ("r_on") : "r_off";
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
		if (filtervalue.length==0) {
			for (var f=1; f<rows.length; f++) rows[f].className = "r_on";
		} else {
			for (var f=1; f<rows.length; f++) {
				var row = rows[f];
				var found = false;
				for (var t=0; t<terms.length; t++) {
					var term = terms[t];
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
		paginateTable(0);
	}
	// Ordenación de la tabla
	var heads = document.getElementById("table").getElementsByTagName("th");
	for (var h=0; h<heads.length; h++) {
		heads[h].addEventListener("click", function(ev) {
			sortTable(this.className.match(/T_\w+/)[0],
				this.className.match("sort_up"),
				this.hasAttribute("isfloat"));
		})
	}
}
function showDetail(marker) {
	map.panTo(marker.position);
	map.setZoom(16);
	var det=document.getElementById("detail");
	det.className = "on";
	var row = document.getElementById(marker.get("row-id"));
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

function populateTable(id) {
	var table = document.getElementById(id);
	var path = document.location.pathname.split("/");
	var nTotal = nG95 = nG98 = nGOA = nGO = nGOB = nGOC = nBIOD = 0;
	var cities = [];
	for (var p in data) {
		var p_link = encodeName(p);
		for (var t in data[p]) {
			var t_link = encodeName(t);
			var s_link = "/gasolineras/" + p_link + "/" + t_link;
			cities.push([t, s_link]);
			for (var s in data[p][t]) {
				var label = data[p][t][s]["label"];
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
				td_dist.addEventListener("click", function() {
					var marker = markers[this.parentElement.id.split("-")[1]];
					showDetail(marker);
				})
				tr.appendChild(td_dist);
				for (var o in FUEL_OPTIONS) {
					var otd = document.createElement("td");
					var price = data[p][t][s]["options"][o] || "";
					var type = FUEL_OPTIONS[o]["short"];
					if (price) {
						price = parseFloat(price);
						priceMaxMin.add(type, price);
						otd.className = "price T_" + type + " on";
						otd.textContent = price.toFixed(3);
					} else otd.className = "T_" + type + " on";
					tr.appendChild(otd);
				}
				try { // Marcadores
					var pos = new google.maps.LatLng(data[p][t][s].latlon[0], data[p][t][s].latlon[1]);
					var marker = new google.maps.Marker({
						position: pos,
						icon: markerIcon
					});
					google.maps.event.addListener(marker, 'click', function(e) {
						showDetail(this);
					});
					markers.push(marker);
					tr.id="mark-"+(markers.length-1);
					tr.setAttribute("latlon", data[p][t][s]["latlon"].join(","));
					marker.set("row-id", tr.id);
				}
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
	populateTable("table_data");
	initMap();
	initControl();
}

window.addEventListener("load", function() {
	getData(processData);
	console.log(data);
})