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
	var heatmapData = [];
	for (p in data) {
		for (t in data[p]) {
			for (s in data[p][t]) {
				if (data[p][t][s].g) {
					var pos = new google.maps.LatLng(data[p][t][s].g[0], data[p][t][s].g[1]);
					heatmapData.push(pos);
				}
			}
		}
	}
	
	var heatmap = new google.maps.visualization.HeatmapLayer({
		data: heatmapData,
		dissipating: true,
		radius: 20,
		gradient: ['transparent', "#00f", "#0f0", "#f00"],
		map: map
	});
}
	

window.addEventListener("load", function(){
	initialize();
	new Gasole(function() {
		console.log(this);
		drawData(this.info);
	});
})
