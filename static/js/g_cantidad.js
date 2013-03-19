// https://developers.google.com/maps/documentation/javascript/layers?hl=es#JSHeatMaps
var data;
var map;

function initialize() {
	var mapOptions = {
		zoom: 8,
		center: new google.maps.LatLng(40.4000, -3.6833),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById('map'), mapOptions);
}

function drawData(data) {
	console.log("procesando)")
	var heatmapData = [];
	var latSum = lonSum = 0;
	for (p in data) {
		for (t in data[p]) {
			for (s in data[p][t]) {
				if (data[p][t][s]["latlon"]) {
					var pos = new google.maps.LatLng(data[p][t][s]["latlon"][0], data[p][t][s]["latlon"][1]);
					latSum += pos.lat();
					lonSum += pos.lng();
					heatmapData.push(pos);
				}
			}
		}
	}
	map.panTo(new google.maps.LatLng(latSum/heatmapData.length, lonSum/heatmapData.length));
	var heatmap = new google.maps.visualization.HeatmapLayer({
		data: heatmapData,
		dissipating: true,
		radius: 15,
		gradient: ['transparent', "#00f", "#0f0", "#f00"],
		map: map
	});
}
	

window.addEventListener("load", function(){
	initialize();
	var req = new XMLHttpRequest();
	req.onload = function(r) {
		data = JSON.parse(r.target.responseText);
		if (data) {
			console.log(data);
			// drawData(data._data);
		}
		
	}
	var url = document.URL;
	req.open("GET", document.URL.replace("graficos/cantidad", "stats"), true)
	req.send();

})
