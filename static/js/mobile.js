function dist(a, b) {
	var dlat = 2/111.03461;
	var dlon = 2/85.39383;

	if ((Math.abs(a[0]-b[0])<dlat) && (Math.abs(a[1]-b[1])<dlon)) {
		console.log(Math.abs(a[0]-b[0]), Math.abs(a[1]-b[1]));
		return true;
	}
}
/** @constructor */
function Gasole() {
	this.loc = null;
	this.info = null;
	this.init = function(data) {
		this.info = data;
		console.log(this.info);
	}
	this.provinceData = function(p, o) {
		var result = [];
		var province = this.info[p];
		for (var c in province) {
			var city = province[c];
			for (var s in city) {
				var st = city[s];
				var price = st.o[o];
				if (price) result.push([s, st.l, st.g, price]);
				// dirección, rótulo, latlon, precio
			}
		}
		console.log(result);
		return result;
	}
	this.nearData = function(o) {
		var result = [];
		for (var p in this.info) {
			var infop = this.info[p];
			for (var t in infop) {
				var infot = infop[t];
				for (var s in infot) {
					var st = infot[s];
					var geo = st.g;
					var price = st.o[o];

					if (price && geo && dist(geo, this.loc)) {
						console.log(price, geo, dist(geo, this.loc));
						result.push([s, st.l, st.g, price]);
					}
				}
			}
		}
		return result;
	}
}

gasole = new Gasole();

function showList(data) {
	var list = $$("#list");
	list.html("");
	for (var d=0; d<data.length; d++) {
		var item = data[d];
		var title = "<strong>"+item[0]+"</strong>";
		var subtitle = "<small>"+item[1]+"</small>";
		var right = "<div class='right'>"+item[3]+"</div>";
		list.append("<li>"+title+subtitle+right+"</li>");
	}
	Lungo.Router.article("main", "list-art");
}

window.addEventListener("load", function() {
	Lungo.init({
		name: "GasOlé"
	});
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
