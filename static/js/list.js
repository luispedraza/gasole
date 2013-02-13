var data;
var map;
var place = "Madrid";
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
			map.setCenter(res[0].geometry.location)
			var marker = new google.maps.Marker({
            	map: map,
            	position: res[0].geometry.location
			});
		} else {
			alert("Geocode ha fallado: " + stat);
		}
	});
}

function toTitle(s) {
 return s.toLowerCase().replace(/(^| )\w(?=\S)/g, function(t){return t.toUpperCase()});
}

window.addEventListener("load", function(){
	var req = new XMLHttpRequest()
	req.onload = function(r) {
		data = JSON.parse(r.target.responseText);
		console.log(data);
		var info = data.info;
		var latlon = data.latlon;
		var list = document.getElementById("list");
		var path = window.location.pathname.split("/");
		for (p in info) {
			var h1 = document.getElementById("title");
			var province = p;
			place = province;
			if (province.match(",")){
				province = province.split(", ").reverse().join(" ");
			}
			if (province.match("/")){
				province = province.split(" /")[0];
			}
			h1.innerText = "Todas las gasolineras de la provincia de " + province;
			var table = document.getElementById("table");
			for (c in info[p]) {
				for (s in info[p][c]) {
					p_link = p.replace(/ \/ /g, "__").replace(/ /g, "_");
					c_link = c.replace(/ \/ /g, "__").replace(/ /g, "_");
					var tr = document.createElement("tr");
					var td = document.createElement("td");
					var a = document.createElement("a");
					a.href = "/gasolineras/" + p_link + "/" + c_link;
					a.innerText = c;
					tr.appendChild(a);
					td = document.createElement("td");
					station = s.replace(/CL\./, "").replace(/\.(?=\w)/g, ". ")
					station = toTitle(s);
					station = station.replace("Carretera", "Ctra")
						.replace("Avenida", "Avda")
						.replace("Calle", "")
						.replace("Avda.Avda.", "Avda")
						.replace("Cr ", "Ctra ")
						.replace("[n]", "")
						.replace("Plaza", "Pl");
					td.innerText = station;
					tr.appendChild(td);
					table.appendChild(tr);
				}
			}
		}
		var script = document.createElement("script");
  		script.type = "text/javascript";
  		script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyD5XZNFlQsyWtYDeKual-OcqmP_5pgwbds&sensor=false&region=ES&callback=initMap";
  		document.body.appendChild(script);
	}
	req.open("GET", document.URL.replace("gasolineras", "api"), true);
	req.send();
})