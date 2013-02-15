var data;
var map;
var province = "";
var town = "";

var FUEL_OPTIONS = {"1": {"short": "G95", "name": "Gasolina 95"},
				// "2": {"short": "G97", "name": "Gasolina 97"},
				"3": {"short": "G98", "name": "Gasolina 98"},
				"4": {"short": "GOA", "name": "Gasóleo Automoción"},
				"5": {"short": "NGO", "name": "Nuevo Gasóleo A"},
				"6": {"short": "GOB", "name": "Gasóleo B"},
				"7": {"short": "GOC", "name": "Gasóleo C"},
				"8": {"short": "BIOD", "name": "Biodiésel"}}

function initMap() {
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
			var center = new google.maps.Marker({
            	map: map,
            	position: res[0].geometry.location
			});
		} else {
			alert("Geocode ha fallado: " + stat);
		}
	});
	var latlon = data.latlon;
	var image = "/icon/pump_r.png";
	for (p in latlon) {
		for (t in latlon[p]) {
			for (s in latlon[p][t]) {
				var pos = new google.maps.LatLng(latlon[p][t][s][0], latlon[p][t][s][1]);
				var marker = new google.maps.Marker({
					map: map,
					position: pos,
					icon: image,
					// animation: google.maps.Animation.DROP
				})
				google.maps.event.addListener(marker, 'click', function(e) {
					var infowindow = new google.maps.InfoWindow({
						content: "contenido"
					})
					console.log(this);
					infowindow.open(map, this);
				});
			}
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
				var st_aux = ""
				for (var td=0; td<tds.length; td++) {
					st_aux+=tds[td].innerText;
				}
				row.className = (st_aux.length) ? ("") : "off";
			}
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
		var files = document.getElementById("table").getElementsByTagName("tr");
		for (var f=1; f<files.length; f++) {
			file = files[f];
			var found = false;
			for (var t=0; t<terms.length; t++) {
				term = terms[t];
				if (term.length!=0) {
					var expected = (term[0]!="-");
					if (!expected) {
						term = term.substr(1);
						if (term.length == 0) continue;
					}
					var cells = file.getElementsByTagName("td");
					for (var c=0; c<2; c++) {
						var cell = cells[c];
						found = found || (RegExp(term, "i").exec(cleanFilter(cell.innerText)) != null);
					}
					if (found != expected) 
						file.style.display = "none";
					else 
						file.style.display = "table-row"
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
		heads[h].addEventListener("click", function(e) {
			function quickSort(a) {
				if (a.length<=1) return a;
				var pivot = a.splice(Math.floor(Math.random()*a.length), 1);
				var less = [];
				var greater = [];
				for (var i=0; i<a.length; i++) {
					if (a[i][0]<=pivot[0]) less.push(a[i]);
					else greater.push(a[i]);
				}
				return quickSort(less).concat(pivot, quickSort(greater));
			}
			var cname = e.target.className.match(/T_.+/);
			var table_data = document.getElementById("table_data");
			var values = table_data.getElementsByClassName(cname);
			var array = [];
			for (var v=0; v<values.length; v++)
				if (values[v].innerText)
					array.push([values[v].innerText, v]);
			array = quickSort(array);
			var rows = table_data.getElementsByTagName("tr");
			var static_rows = [];
			for (var r=0; r<rows.length; r++) static_rows.push(rows[r]);
			for (var e=0; e<array.length; e++) {
				table_data.insertBefore(static_rows[array[e][1]], table_data.children[e]);
			}
		})
	}
}
function populateTable(id) {
	var info = data.info;
	var table = document.getElementById(id);
	var path = document.location.pathname.split("/");
	for (var p in info) {
		for (var t in info[p]) {
			for (var s in info[p][t]) {
				p_link = path[2] || encodeName(p);
				t_link = path[3] || encodeName(t);
				var tr = document.createElement("tr");
				var td_town = document.createElement("td");
				var a_town = document.createElement("a");
				a_town.href = "/gasolineras/" + p_link + "/" + t_link;
				a_town.innerText = t;
				td_town.appendChild(a_town);
				tr.appendChild(td_town);
				td_s = document.createElement("td");
				a_s = document.createElement("a");
				a_s.href = "/ficha/" + p_link + "/" + t_link + "/" + encodeName(s);
				a_s.innerText = toTitle(s);
				td_s.appendChild(a_s);
				tr.appendChild(td_s);
				for (var o in FUEL_OPTIONS) {
					var otd = document.createElement("td");
					otd.className = "T_" + FUEL_OPTIONS[o]["short"] + " on";
					otd.innerText = info[p][t][s]["options"][o] || "";
					tr.appendChild(otd);
				}
				table.appendChild(tr);
			}
		}
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
		h1.innerText = "Gasolineras en " + ((town) ? (town + ", ") : ("la ")) + "provincia de " + province;
		var script = document.createElement("script");
  		script.type = "text/javascript";
  		script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyD5XZNFlQsyWtYDeKual-OcqmP_5pgwbds&sensor=false&region=ES&callback=initMap";
  		document.body.appendChild(script);
		populateTable("table_data");
		initControl();
	}
	req.open("GET", document.URL.replace("gasolineras", "api"), true);
	req.send();

	
})

