var	gasoleData,		// datos de la api
	map,			// el mapa de Google
	place = "",
	markers = [],	// lista de marcadores sobre el mapa
	province = null,
	town = null,
	markerCenter=null,
	markerDetail=null,
	pagerN = 15,
	pagerCurrent = null,
	cluster = null,
	bounds = new google.maps.LatLngBounds(),
	TO_DAYS = 86400000,
	stats = null;
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
	var rows = document.getElementById("table-data").getElementsByClassName("r_on"),
		rlen = rows.length,
		pager = document.getElementById("pager-links");
	if (!rlen) {
		pager.innerHTML = "<p>No hay resultados coincidentes con los criterios de búsqueda.<br>Comprueba el filtro y tipos de combustible seleccionados.</p>"; 
		return;	
	}
	
	if (index === "more") index = Math.min(pagerCurrent+pagerN, parseInt(rlen/pagerN)*pagerN);
	else if (index === "less") index = Math.max(pagerCurrent-pagerN, 0);
	if (index>=rlen) return;
	pager.innerHTML = "";
	for (var r=0; r<rlen; r++) {
		rows[r].style.display = (((r<index)||(r>=index+pagerN)) ? "none" : "");
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
function updateMarkers() {
	/* Obtiene icono de gasolinera para un precio */
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
	var rows = document.getElementById("table-data").getElementsByTagName("tr"),
		selection = getSelTypes(),
		marker, row, img;
	for (var r=0, rlen=rows.length; r<rlen; r++) {
		row = rows[r];
		marker = markers[row.id.split("-")[1]];
		if (marker) {
			if (row.className.match("r_on")) {
				marker.icon = markerImage(selection, marker.get("price"));
				marker.setMap(map);
			} else {
				marker.setMap(null);
			} 
		}
	}
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
	for (var i=0, fl=filter.length; i<fl; i++) {
		var f=filter[i].split(" "),
			type=f[0],
			c_off=type + " off",
			c_on=type + " on",
			c_na=type,
			cells=document.getElementById("table").getElementsByClassName(type),
			cell,
			disable = (f[1]=="off");
		for (var c=0, clen=cells.length; c<clen; c++) {
			cell = cells[c];
			if (disable) cell.className = c_off;
			else if (cell.textContent) cell.className = c_on;
			else cell.className = c_na;
		}
	}
	var row;
	gasoleProcess(gasoleData._data, function(sdata) {
		row = sdata.row;
		row.className = row.getElementsByClassName("on").length ? "r_on" : "r_off";
	})	
}

function filterText() {
	function cleanFilter(s) {
		return s.toLowerCase()
			.replace(/\s+/g," ")
			.replace(/\s$/,"")
			.replace(/^\s/,"")
			.replace(/´/g,"")
			.replace(/[áàä]/g, "a")
			.replace(/[éèë]/g, "e")
			.replace(/[íìï]/g, "i")
			.replace(/[óòö]/g, "o")
			.replace(/[úùü]/g, "u");
	}
	var filtervalue = cleanFilter(document.getElementById("contains").value);
	if (filtervalue.length) {
		var terms = filtervalue.split(/\s/),
			tlen = terms.length;
		gasoleProcess(gasoleData._data, function(sdata,p,t,s) {
			var row = sdata.row;
			if (row.className=="r_off") return;
			var text = cleanFilter(p+" "+t+" "+s+" "+sdata.l);
			for (var t=0; t<tlen; t++) {
				var found = (RegExp(terms[t]).exec(text)!=null);
				if (!found) {
					row.className = "f_off";
					return;
				} else {
					row.className = "r_on";
				}
			}
		});
	} else {
		gasoleProcess(gasoleData._data, function(sdata) {
			var row = sdata.row;
			if (row.className=="r_off") return;
			row.className = "r_on";
		});
	}
}

function initControl() {
	// Cluster del mapa
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
	document.getElementById("cluster").onclick = mapCluster;
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
/* Muestra los detalles al clickar en un marcador */
function showDetail(marker) {
	function hideDetail() {
		document.getElementById("detail").className = "";
		markerDetail.setAnimation(null);
	}
	google.maps.event.addListenerOnce(map, "mousedown", hideDetail);
	document.getElementById("d-close").onclick=hideDetail;
	if (markerDetail) markerDetail.setAnimation(null);
	markerDetail = marker;
	map.panTo(marker.position);
	marker.setAnimation(google.maps.Animation.BOUNCE);
	var det=document.getElementById("detail");
	det.className = "on";
	var row = document.getElementById(marker.get("id"));
	var label = row.getElementsByClassName("T_ADDR")[0].getAttribute("label");
	var address = row.getElementsByClassName("T_ADDR")[0]
		.getElementsByTagName("a")[0].textContent;
	var link = row.getElementsByClassName("T_ADDR")[0]
		.getElementsByTagName("a")[0].href;
	var city = row.getElementsByClassName("T_LOC")[0].textContent;
	document.getElementById("d-title").textContent = "Gasolinera "+label+" en "+city+", "+address;
	document.getElementById("d-link").href = link;
	var priceList = document.getElementById("d-prices");
	priceList.innerHTML = "";
	var prices = row.getElementsByTagName("td");
	for (var p=4, plen=prices.length; p<plen; p++) {
		var val = prices[p].textContent;
		if (val) {
			var t = prices[p].className.match(/T_\w+/)[0].replace("T_", "");
			var newL = document.createElement("li");
			newL.className = "T_"+t;
			newL.innerHTML="<div>"+FUEL_OPTIONS[t].name+"</div><div class='p'>"+val+"</div>";
			priceList.appendChild(newL);	
		}
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
	dateDiv.innerHTML = "Precios actualizados<br>"+ago;
	clockDiv.className = cname;
}
/* Tipos de comsbutible seleccionados por el usuario */
function getSelTypes() {
	var res = [];
	var types = document.getElementById("types").getElementsByClassName("on");
	for (var t=0; t<types.length; t++) res.push(parseInt(types[t].className.split(" ")[0].split("_")[1]));
	return res;
}
// Procesamiento de los datos, construcción de la tabla
function processData(info) {
	function populateInfo() {
		/* Tabla resumen informativo */
		var divInfo = document.getElementById("info");
		var divSum = document.getElementById("summary-b");
		for (var t in stats) {
			var data = stats[t];
			var tr = document.createElement("tr");
			tr.className = "data T_"+t;
			var td = document.createElement("td");
			td.textContent = FUEL_OPTIONS[t].name; tr.appendChild(td);
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
	function populateTable(data) {
		/* Rellena la tabla de resultados con la información proporcionada */
		var table = document.getElementById("table-data"),
			cities = [],
			today = new Date(),
			pdata, tdata, sdata, t_ref, t_link, s_tlink;
		table.innerHTML = "";
		for (var p in data) {
			pdata = data[p];
			for (var t in pdata) {
				tdata = pdata[t];
				t_ref = encodeName(t);
				t_link = "/gasolineras/"+province+"/"+t_ref // enlace a una ciudad
				s_link = "/ficha/"+province+"/"+t_ref+"/"	// stub de enlacae a una gasolinera
				cities.push([t, t_link]);						// nueva ciudad
				for (var s in tdata) {
					sdata = tdata[s];
					var label = sdata.l;
					var tr = document.createElement("tr");
					tr.className = "r_on";
					var td_town = document.createElement("td");
						var a_town = document.createElement("a");
						a_town.href = t_link;
						a_town.title = "Todas las gasolineras de " + t;
						a_town.textContent = t;
						td_town.className = "T_LOC";
						td_town.appendChild(a_town);
						tr.appendChild(td_town);
					var td_s = document.createElement("td");
						var a_s = document.createElement("a");
						a_s.href = s_link + encodeName(s);
						a_s.textContent = toTitle(s);
						a_s.title = "Ficha de la gasolinera "+label+" en " + t + ", " + a_s.textContent;
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
						// Marcadores
						var geo = sdata.g;
						if (geo) {
							td_dist.className = "T_DIST";
							var pos = new google.maps.LatLng(geo[0], geo[1]);
							var options = { 
								icon: null,
								map: map, 
								position: pos };
							var marker = new google.maps.Marker(options);
							google.maps.event.addListener(marker, 'click', function(e) {
								showDetail(this);
							});
							marker.set("price", sdata.o);
							tr.id="tr-"+markers.length;
							td_dist.id="td-"+markers.length;
							markers.push(marker);
							td_dist.setAttribute("data-geo", geo.join(","));
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
						var date = new Date(sdata.d);
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
						otd.className = "T_" + o;
						var price = sdata.o[o];
						if (price) {
							otd.textContent = price.toFixed(3);
							otd.className += " on";
						}
						tr.appendChild(otd);
					}
					table.appendChild(tr);
					sdata.row = tr;
				}
			}
		}
		map.fitBounds(bounds);
		var clen = cities.length;
		if (clen>1) { // Lista de ciudades
			var citiesList = document.getElementById("cities-list");
			cities.sort(function(a, b) {return sortName(a[0],b[0]);});
			var city;
			for (var c=0; c<clen; c++) {
				city = cities[c];
				citiesList.innerHTML+="<li><a href='"+city[1]+"'>"+city[0]+"</a></li>";
			}
		}
		else document.getElementById("p-cities").style.display = "none";
	}
	function initMap() {
		/* Inicializa el mapa */
		map = new google.maps.Map(document.getElementById("google_map"),
			{mapTypeId: google.maps.MapTypeId.ROADMAP});
		var clusterOptions = {
			imagePath: "/",
			styles: [{height: 40, width: 40, url: "/img/cluster.png", backgroundPosition: "-2px -2px"},
				{height: 50, width: 50, url: "/img/cluster.png", backgroundPosition: "-44px -2px"},
				{height: 60, width: 60, url: "/img/cluster.png", backgroundPosition: "-2px -54px"},
				{height: 70, width: 70, url: "/img/cluster.png", backgroundPosition: "-2px -116px"}]
		}
		cluster = new MarkerClusterer(map, null, clusterOptions);
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
	var h1 = document.getElementById("title");
	if (info["_near"]) {
		h1.textContent = "Gasolineras cerca de: " + info["_near"];
		place = info["_near"];
	}
	else {
		h1.textContent = "Gasolineras en " + ((town) ? (prettyName(town) + ", ") : ("la ")) + "provincia de " + prettyName(province);
		place = ((town) ? (town + ", " + province) : (province));
	}
	initMap();
	populateTable(info._data);
	populateInfo();
	initControl();
	newReference(place);
	updateMarkers();
	paginateTable(0);
}
addEvent(window,"load", function() {
	breadCrumb("breadcrumb");	// miga de pan
	new Gasole(function() {
		gasoleData = {"_data": {}};
		var pathArray = decodeArray(window.location.pathname.split("/"));
		var option = pathArray[1]; // gasolineras, resultados, ficha
		if (option == "gasolineras") {
			province  = pathArray[2];
			if (pathArray[3]) {		// si hay ciudad
				town = pathArray[3];
				gasoleData._data[province] = {};
				gasoleData._data[province][town] = this.info[province][town];
			} else gasoleData._data[province] = this.info[province];
		} else if (option == "resultados") {
			var location = new SearchLocations();
			var place = pathArray[2];
			location.add(place, [parseFloat(pathArray[3]),parseFloat(pathArray[4])]);
			location.radius = parseFloat(pathArray[5]);
			gasoleData._data = this.nearData(location);
			gasoleData._near = place;
		}
		stats = new GasoleStats(gasoleData._data).stats;
		computeWeights(stats);
		processData(gasoleData);
		// fecha de actualización
		document.getElementById("updated").textContent = "("+formatUpdate(this.date)+")";
	});
})