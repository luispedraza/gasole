(function(w) {
	var distance = null;
	/* Ir a por los resultados de búsqueda */
	function searchLocation (loc) {
		var lat="", lon="", address="";
		if (typeof(loc)=="object") {
			lat = loc.geometry.location.lat();
			lon = loc.geometry.location.lng();
			address = encodeURI(loc.formatted_address);
		} else if (typeof(loc)=="string") {
			var temp = loc.split("##");
			address = temp[0];
			lat = temp[1];
			lon = temp[2];
		}
		var d = document.getElementById("search-d").getAttribute("value");
		window.location = "/resultados/"+address+"/"+lat+"/"+lon+"/"+distance.getvalue();
	}
	/* Muestra el spinner de carga */
	function showLoader() {
		document.getElementById("results-title").textContent = "Buscando…";
		var div = document.getElementById("results-list");
		div.innerHTML = "";
		var img = new Image();
		img.src = "/img/search-loader.gif";
		div.appendChild(img);
	}
	/* Inicializa funciones de geolocalización del navegador */
	function initGeoloc() {
		/* Obtiene la posición del navegador */
		function loadCurrentPosition() {
			showLoader();
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
		}
		var loc = document.getElementById("current-loc");
		if (!navigator.geolocation) {
			loc.style.display = "none";
		} else {
			addEvent(loc,"click", loadCurrentPosition);
		}
	}
	/* Muestra los resultados de geolocalización */
	function showResult(r,s) {
		console.log(r,s);
		var resultsDiv = document.getElementById("results");
		resultsDiv.style.display = "block";
		var resultsList = document.getElementById("results-list");
		resultsList.innerHTML = "";
		if (s == google.maps.GeocoderStatus.OK) {
			var valid=0, added=0;
			for (var i=0; i<r.length; i++) {
				var addr = r[i].formatted_address;
				if (addr.match(/España$/)) {
					console.log(typeof(r[i]));
					valid++; added=i;
					var newL = document.createElement("li");
					var newA = document.createElement("a");
					newL.appendChild(newA);
					newA.textContent = addr;
					newA.href = "#";
					newA.setAttribute("loc", 
						[r[i].formatted_address, r[i].geometry.location.lat(), r[i].geometry.location.lng()]
						.join("##"));
					addEvent(newA,"click", function() {
						searchLocation(this.getAttribute("loc"));
					});
					resultsList.appendChild(newL);
				}
			}
			if (valid==1) {
				searchLocation(r[added]); return;
			}
	 		else if (valid > 1) {
				document.getElementById("results-title").textContent = "Encontrados "+valid+ " lugares:";
				return;
			};
		}
		resultsList.innerHTML = "<li>No se ha podido encontrar el lugar. Inténtalo de nuevo</li>";
	}
	/* Codifica una dirección, obteniendo lat y lon */
	function geoCode() {
		showLoader();
		var l = document.getElementById("address").value;
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode({'address': l, 'region': 'es'}, showResult);
		return false;
	}
	function Slider(div) {
		this.value = 2.6,
		this.max = 10,
		this.min = 1,
		this.step = .5,
		this.candidate = this.value;
		var slider = this;
			sliderDiv=document.getElementById(div),
			barDiv = document.createElement("div"),
			padDiv = document.createElement("div");
		sliderDiv.style.position = "relative";
		barDiv.style.position = "absolute";
		barDiv.style.left = "0";
		barDiv.style.top = "0";
		barDiv.className = "bar";
		sliderDiv.appendChild(barDiv);
		padDiv.style.position = "absolute";
		padDiv.style.top = padDiv.style.left = padDiv.style.right = padDiv.style.bottom = 0;
		sliderDiv.appendChild(padDiv);
		this.getvalue = function() {return Math.round(this.value/this.step)*this.step;}
		function updateSlider(v) {
			var width = (v-slider.min) * sliderDiv.clientWidth/(slider.max-slider.min);
			barDiv.style.width = Math.round(width)+"px";
			barDiv.textContent = "Radio: " + v.toFixed(1) + " km.";
		}
		updateSlider(this.value);
		addEvent(padDiv,"mousemove", function(e) {
			var width = (e.clientX-2) - this.getBoundingClientRect().left;
			var newval = slider.min + width * (slider.max-slider.min)/this.clientWidth;
			newval = Math.round(newval/slider.step)*slider.step;
			newval = Math.max(slider.min,newval);
			newval = Math.min(slider.max,newval);
			slider.candidate = newval;
			updateSlider(slider.candidate);
		});
		addEvent(padDiv,"click", function(e) {
			slider.value=slider.candidate;
			updateSlider(slider.value);
		});
		addEvent(padDiv,"mouseout", function(e) {
			updateSlider(slider.value);
		})
	}
	addEvent(w,"load", function() {
		document.getElementById("search-form").onsubmit=geoCode;
		lockScroll("results-list");
		distance = new Slider("search-d");
		initGeoloc();
	});
})(window);
