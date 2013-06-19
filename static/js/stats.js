// https://developers.google.com/maps/documentation/javascript/layers?hl=es#JSHeatMaps
var data;
var map;

function initialize() {
	var mapOptions = {
		zoom: 10,
		center: new google.maps.LatLng(40.4000, -3.6833),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById('map'),
		mapOptions);
}

var scale = 1;
function y2lat(a) { return 180/Math.PI * (2 * Math.atan(Math.exp(a*Math.PI/180)) - Math.PI/2); }
function lat2y(a) { return 180/Math.PI * Math.log(Math.tan(Math.PI/4+a*(Math.PI/180)/2)); }
function mercator(latlon) {
	var y = lat2y(latlon[0]);
	var x = latlon[1]*scale;
	return [x, y];
}
function unMercator(xy) {
	var lat = y2lat(xy[1]);
	var lon = xy[0]/scale;
	return [lat, lon];
}


function drawData(data) {
	var heatmapData = [];
	var latlon = data.latlon;
	for (p in latlon) {
		for (t in latlon[p]) {
			for (s in latlon[p][t]) {
				var pos = new google.maps.LatLng(latlon[p][t][s][0], latlon[p][t][s][1]);
				var magnitude = data.info[p][t][s]["options"][1] || null;
				if (magnitude) {
					magnitude = (magnitude-1.4)*100;
					heatmapData.push({
						location: pos,
						weight: magnitude
					});
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
	


function initKarto() {
	var map = $K.map('#kartomap');

};

function initD3() {
	var width = 960,
    height = 500;
	var vertices = [];
	var latlon = data.latlon;
	for (p in latlon) {
		for (t in latlon[p]) {
			for (s in latlon[p][t]) {
				var xy = mercator(latlon[p][t][s]);
				
				xy[0] = (xy[0] + 4)*1000;
				xy[1] = (xy[1] - 44)*1000;
				console.log(xy);
				vertices.push(xy);
			}
		}
	}

	var svg = d3.select("body").append("svg")
	    .attr("width", width)
	    .attr("height", height)
	    .attr("class", "PiYG");

	var path = svg.append("g").selectAll("path");

	svg.selectAll("circle")
	    .data(vertices.slice(1))
	  .enter().append("circle")
	    .attr("transform", function(d) { return "translate(" + d + ")"; })
	    .attr("r", 2);

	redraw();

	function redraw() {
	  path = path.data(d3.geom.voronoi(vertices).map(function(d) { return "M" + d.join("L") + "Z"; }), String);
	  path.exit().remove();
	  path.enter().append("path").attr("class", function(d, i) { return "q" + (i % 9) + "-9"; }).attr("d", String);
	  path.order();
	}
}

window.addEventListener("load", function(){
	initialize();
	var req = new XMLHttpRequest();
	req.onload = function(r) {
		data = JSON.parse(r.target.responseText);
		console.log(data);
		drawData(data);
		initD3();
	}
	var url = document.URL;
	req.open("GET", document.URL.replace("stats", "api"), true)
	req.send();


	/* polymaps */
	var po = org.polymaps;
	var pomap = po.map()
	.container(document.getElementById("polymap").appendChild(po.svg("svg")))
	.center({lat: 39, lon: -96})
	.zoom(4)
	.zoomRange([3, 7])
	.add(po.interact());

	pomap.add(po.image()
		.url(po.url("http://{S}tile.cloudmade.com"
			+ "/b4172e597d5b480399bf5e11670649cd" // http://cloudmade.com/register
			+ "/20760/256/{Z}/{X}/{Y}.png")
		.hosts(["a.", "b.", "c.", ""])));

	pomap.add(po.geoJson()
		.url("http://polymaps.appspot.com/county/{Z}/{X}/{Y}.json")
		.on("load", load)
		.id("county"));

	pomap.add(po.geoJson()
		.url("http://polymaps.appspot.com/state/{Z}/{X}/{Y}.json")
		.id("state"));

	pomap.add(po.compass()
		.pan("none"));

	function load(e) {
		for (var i = 0; i < e.features.length; i++) {
			var feature = e.features[i];
			feature.element.setAttribute("id", feature.data.id);
		}
	}

})
