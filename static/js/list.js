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


window.addEventListener("load", function(){
	var req = new XMLHttpRequest()
	req.onload = function(r) {
		data = JSON.parse(r.target.responseText);
		var list = document.getElementById("list");
		var path = window.location.pathname.split("/");
		for (i in data) {
			var h1 = document.getElementById("title");
			var province = i;
			place = province;
			if (province.match(",")){
				province = province.split(", ").reverse().join(" ");
			}
			if (province.match("/")){
				province = province.split(" /")[0];
			}
			h1.innerText = "Todas las gasolineras de la provincia de " + province;
			var table = document.getElementById("table");
			for (j in data[i]) {
				var tr = document.createElement("tr");
				var td = document.createElement("td");
				td.innerText = j;
				tr.appendChild(td);
				table.appendChild(tr);
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