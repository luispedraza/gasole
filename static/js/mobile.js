function dist(a, b) {
	var dlat = 2/111.03461;
	var dlon = 2/85.39383;

	if ((Math.abs(a[0]-b[0])<dlat) && (Math.abs(a[1]-b[1])<dlon)) {
		console.log(Math.abs(a[0]-b[0]), Math.abs(a[1]-b[1]));
		return true;
	}
}

/** @constructor */
function Sound(id) {
	this.html5audio = document.getElementById(id);
	this.play = function() {
		if (this.html5audio) {
			// this.html5audio.pause();
			// this.html5audio.currentTime=0;
			this.html5audio.play();
		}
	}
}
var click = null;

function initMap() {
	var mapOptions = {
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	var mapdiv = document.getElementById("map-art");
	map = new google.maps.Map(mapdiv, mapOptions);
}
/** @constructor */
function Gasole() {
	this.loc = null;		// posición del usuario
	this.info = null; 		// datos de la api
	this.init = function(data) {
		this.info = data;
		console.log(this.info);
	}
	this.provinceData = function(p, t) {
		this.result = {};
		var province = this.info[p];
		for (var c in province) {
			var city = province[c];
			for (var s in city) {
				var st = city[s];
				var price = st.o[t];
				if (price) this.result[s]=st;
			}
		}
		return this.result;
	}
	this.nearData = function() {
		this.result = {};
		for (var p in this.info) {
			var infop = this.info[p];
			for (var t in infop) {
				var infot = infop[t];
				for (var s in infot) {
					var st = infot[s];
					var geo = st.g;
					var price = st.o[this.type];
					if (price && geo && dist(geo, this.loc)) {
						this.result[s] = st;
					}
				}
			}
		}
		return this.result;
	}
}
var map = null;
gasole = new Gasole();

function showList(data) {
	var list = $$("#list");
	list.html("");
	var options = { 
		icon: {
			path: google.maps.SymbolPath.CIRCLE,
			strokeOpacity: 1.0,
			strokeWeight: 1,
			fillOpacity: .8,
			scale: 6,
			strokeColoe: "#0f0"
		}, 
		map: map
	};
	var bounds = new google.maps.LatLngBounds();
	for (var s in data) {
		var item = data[s];
		var title = "<strong>"+s+"</strong>";
		var subtitle = "<small>"+item.l+"</small>";
		var right = "<div class='right'>"+item.o[1]+"</div>";
		list.append("<li>"+title+subtitle+right+"</li>");
		// marker
		var pos = new google.maps.LatLng(item.g[0], item.g[1]);
		options.position = pos;
		bounds.extend(pos);
		marker = new google.maps.Marker(options);
	}
	Lungo.Router.article("results-sec", "list-art");
	map.fitBounds(bounds);
}

window.addEventListener("load", function() {
	Lungo.init({
		name: "GasOlé"
	});
	click = new Sound("click");

	var storedData = localStorage["gasole"];
	if (storedData) gasole.init(JSON.parse(storedData));
	else {
		var req = new XMLHttpRequest();
		req.onload = function() {
			gasole.init(JSON.parse(this.responseText));
			localStorage.setItem("gasole", this.responseText);
		}
		req.open("GET", "/api/All");
		req.send();
	}
	initMap();
	Lungo.dom("#map-art").on("load", function() {
		google.maps.event.trigger(map, 'resize');
	})

	$$('.type').tap(function() {
		click.play();
		$$('.type').removeClass('sel');
		this.className+=" sel";
		gasole.type=this.getAttribute("data-type");

	});
	$$('.p').tap(function() {
		var data = gasole.provinceData($$(this).text(), "1");
		showList(data);
	});
	$$('#search-button').tap(function() {
		var data = gasole.nearData("1");
		showList(data);
	});
	$$('#location').tap(function() {
		navigator.geolocation.getCurrentPosition(showPosition, showError);
		function showPosition(pos) {
			var geocoder = new google.maps.Geocoder();
			var latlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
			geocoder.geocode({'latLng': latlng}, showResult);
		}
		function showError(e) {
			switch(e.code) {
			case e.PERMISSION_DENIED:
				console.log("User denied the request for Geolocation.");
				break;
			case e.POSITION_UNAVAILABLE:
				console.log("Location information is unavailable.");
				break;
			case e.TIMEOUT:
				console.log("The request to get user location timed out.");
				break;
			case e.UNKNOWN_ERROR:
				console.log("An unknown error occurred.");
				break;
			}
		}
		function showResult(r,s) {
			console.log(r);
			if (s == google.maps.GeocoderStatus.OK) {
				var place = r[0];
				$$("#search-input").val(place.formatted_address);
				gasole.loc = [place.geometry.location.lat(), place.geometry.location.lng()];
			}
		}
	});
})