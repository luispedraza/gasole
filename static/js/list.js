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
}

function toTitle(s) {
	return s.replace(" [N]", "")
		.replace(/^CARRETERA ?|^CR\.? ?/, "CTRA. ")
		.replace(/(CTRA. )+/, "CTRA. ")
		.replace(/^AVENIDA ?|^AV. ?/, "AVDA. ")
		.replace(/^POLIGONO INDUSTRIAL ?|POLIGONO ?|P\.I\. ?/, "POL. IND. ")
		.replace(/^CALLE |^CL\.? ?|C\/ ?/, "C/ ")
		.replace(/^RONDA |^RD /, "RDA. ")
		.replace(/^AUTOPISTA ?(AUTOPISTA ?)?/, "AU. ")
		.replace(/^PLAZA ?/, "PZA. ")
		.replace(/^PASEO (PASEO ?)?/, "Pº ")
		.replace(/^TRAVESS?[IÍ]A /, "TRAV. ")
		.replace(/\B[^\d- ]+[ $]/g, function(t) {return t.toLowerCase()})
}
function cleanName(s) {
	var r = s.replace("___", "/").replace("__", "/").replace(/_/g, " ");
	if (r.match("/")) {
		r = r.split("/")[1];
	}
	if (r.match(/\)$/)) {
		r = r.match(/\(.+\)$/g)[0]
			.replace("(", "").replace(")", " ") + r.split(" (")[0];
	}
	return r;
}
window.addEventListener("load", function(){
	var req = new XMLHttpRequest();
	req.onload = function(r) {
		data = JSON.parse(r.target.responseText);
		var path = document.location.pathname.split("/");
		province = cleanName(decodeURI(path[2]));
		if (path[3]) {
			town = cleanName(decodeURI(path[3]));
		}
		var h1 = document.getElementById("title");
		h1.innerText = "Gasolineras en " + ((town) ? (town + ", ") : ("la ")) + "provincia de " + province;
		var script = document.createElement("script");
  		script.type = "text/javascript";
  		script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyD5XZNFlQsyWtYDeKual-OcqmP_5pgwbds&sensor=false&region=ES&callback=initMap";
  		document.body.appendChild(script);
		
		console.log(data);
		var info = data.info;
		var latlon = data.latlon;
		var list = document.getElementById("list");
		var path = window.location.pathname.split("/");
		var table = document.getElementById("table_data");
		for (var p in info) {
			for (var t in info[p]) {
				for (var s in info[p][t]) {
					p_link = p.replace(/ \/ /g, "___").replace(/\//g, "__").replace(/ /g, "_");
					t_link = t.replace(/ \/ /g, "___").replace(/\//g, "__").replace(/ /g, "_");
					var tr = document.createElement("tr");
					var td = document.createElement("td");
					var a = document.createElement("a");
					a.href = "/gasolineras/" + p_link + "/" + t_link;
					a.innerText = t;
					td.appendChild(a)
					tr.appendChild(td);
					td = document.createElement("td");
					station = toTitle(s);
					td.innerText = station;
					tr.appendChild(td);
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

		initControl();
	}
	req.open("GET", document.URL.replace("gasolineras", "api"), true);
	req.send();

	
})