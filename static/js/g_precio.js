// https://developers.google.com/maps/documentation/javascript/layers?hl=es#JSHeatMaps
var data;
var map;
var vertices = [];
var layer;

function initMap() {
	var latlon = data.latlon;
	var latSum = lonSum = 0;
	for (p in latlon) {
		for (t in latlon[p]) {
			for (s in latlon[p][t]) {
				vertices.push({
					name: "nombre",
					lng: parseFloat(latlon[p][t][s][1]),
					lat: parseFloat(latlon[p][t][s][0])
				})
				latSum+=parseFloat(latlon[p][t][s][0]);
				lonSum+=parseFloat(latlon[p][t][s][1]);
			}
		}
	}
	var mapOptions = {
		zoom: 10,
		center: new google.maps.LatLng(
			latSum/vertices.length, lonSum/vertices.length),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById('map'),
		mapOptions);
}

function initD3() {
	var overlay = new google.maps.OverlayView();
	overlay.onAdd = function() {
		layer = d3.select(this.getPanes().overlayLayer).append("div")
			.attr("height", "100%")
			.attr("width", "100%")
			.attr("class", "stations")
			.attr("id", "layer");
		layer[0][0].style.width = "1366px";
		layer[0][0].parentNode.style.width = "100%";
		layer[0][0].parentNode.style.height = "100%";
		layer[0][0].parentNode.parentNode.style.width = "100%";
		layer[0][0].parentNode.parentNode.style.height = "100%";
		layer[0][0].parentNode.parentNode.parentNode.style.width = "100%";
		layer[0][0].parentNode.parentNode.parentNode.style.height = "100%";
		layer[0][0].parentNode.parentNode.parentNode.parentNode.style.width = "100%";
		layer[0][0].parentNode.parentNode.parentNode.parentNode.style.height = "100%";
	}

	overlay.draw = function() {
		var projection = this.getProjection();
		var padding = 10;
		var marker = layer.selectAll("svg")
			.data(vertices)
			.each(transform)
			.attr("class", "marker aaa");
		
		marker.append("svg:circle")
			.attr("r", 5)
			.attr("cx", padding)
			.attr("cy", padding);
		marker.append("svg:text")
			.attr("x", padding+7)
			.attr("y", padding)
			.attr("dy", ".31em")
			.text(function(d) {
				return d.name;
			});
		var v = d3.geom.voronoi(translate(vertices));
		console.log( "v is :", v);
		var edges = layer.selectAll("path")
			.data(v)
			.enter()
			.append("svg:svg")
			.attr("width", "100%")
			.attr("width","100%")
			.style("position", "absolute")
			.append("svg:path")
			.attr( "d", function(d){
				var e = transform_path(d)
				var p = 'M' + e.join('L') + 'Z'
				console.log( 'PATH: ' + p)
				return p
			})
			.attr("fill", "none")
			.attr("stroke", "black");

			function translate(data) {
				var d = []
				for( var i=0; i<data.length; i++){
					var c = [ data[i].lat, data[i].lng ]
					d.push( c )
				}
				return d
			}

			function _projection( lat, lng ) {
				e = new google.maps.LatLng( lat, lng );
				e = projection.fromLatLngToDivPixel(e);
				return [ e.x - padding, e.y - padding]
				// return [ e.x, e.y ]
            }

            function transform(d) {
            	e = _projection( d.lat, d.lng )
            	console.log("marker " + d.lat +', ' + d.lng + " -> left: " + e[0] +", top: " + e[1] )
            	return d3.select(this)
            		.style("left", e[0] + "px")
            		.style("top", e[1] + "px");
            }

            function transform_path(data) {
            	var d = []
            	console.log(data)
            	for( var i=0; i<data.length; i++) {
            		var c = _projection( data[i][0], data[i][1] )
            		console.log( ' path point: ' + JSON.stringify(data[i]) + ' -> left: ' + c[0] + ", top: " + c[1])
            		d.push( c )
            	}
            	return d
            }
        };

    	overlay.setMap(map);





	// var svg = d3.select("body").append("svg")
	//     .attr("width", width)
	//     .attr("height", height)
	//     .attr("class", "PiYG");

	// var path = svg.append("g").selectAll("path");

	// svg.selectAll("circle")
	//     .data(vertices.slice(1))
	//   .enter().append("circle")
	//     .attr("transform", function(d) { return "translate(" + d + ")"; })
	//     .attr("r", 2);

	// redraw();

	// function redraw() {
	//   path = path.data(d3.geom.voronoi(vertices).map(function(d) { return "M" + d.join("L") + "Z"; }), String);
	//   path.exit().remove();
	//   path.enter().append("path").attr("class", function(d, i) { return "q" + (i % 9) + "-9"; }).attr("d", String);
	//   path.order();
	// }
}

window.addEventListener("load", function(){
	var req = new XMLHttpRequest();
	req.onload = function(r) {
		data = JSON.parse(r.target.responseText);
		initMap();
		console.log(data);
		initD3();
	}
	var url = document.URL;
	req.open("GET", document.URL.replace("graficos/precio", "api"), true)
	req.send();
})
