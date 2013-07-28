(function(w) {
	function loadMapsAPI(callback) {
		// carga dinámica de la api, para el buscador, en páginas sin mapa
		if (!window.google || !window.google.maps) {
			var script = document.createElement("script");
			script.type = "text/javascript";
			script.src = "http://maps.googleapis.com/maps/api/js?key=AIzaSyD5XZNFlQsyWtYDeKual-OcqmP_5pgwbds&sensor=false&callback="+callback;
			document.body.appendChild(script);
			return true;
		}
		return false;
	}
	var searchDistance = null;
	/* Va a por los resultados de búsqueda */
	function loadLocation(l) {
		window.location=l+"/"+searchDistance.getvalue()
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
	/* Busca la posición actual del usuario */
	window.loadCurrentPosition = function() {
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
	/* Inicializa funciones de geolocalización del navegador */
	function initGeoloc() {
		/* Obtiene la posición del navegador */
		var loc = document.getElementById("current-loc");
		if (!navigator.geolocation) loc.style.display = "none";
		else addEvent(loc,"click", function() {
			if (!loadMapsAPI("loadCurrentPosition")) loadCurrentPosition();
		});
	}
	/* Muestra los resultados de geolocalización */
	function showResult(r,s) {
		var resultsDiv = document.getElementById("results");
		resultsDiv.style.display = "block";
		var resultsList = document.getElementById("results-list"),
			titleDiv = document.getElementById("results-title");
		resultsList.innerHTML = "";
		if (s == google.maps.GeocoderStatus.OK) {
			var valid=0, added=0, href;
			for (var i=0; i<r.length; i++) {
				var rplace = r[i],
					loc=rplace.geometry.location,
					addr = rplace.formatted_address,
					place = encodeURIComponent(addr);
				if (addr.match(/España$/)) {
					valid++; added=i;
					href = "/resultados/"+place+"/"+loc.lat()+"/"+loc.lng();
					var newLi = document.createElement("li");
					var newA = document.createElement("a");
					newA.href = href;
					newA.textContent = addr;
					newA.onclick = function() {loadLocation(this.href)};
					newLi.appendChild(newA);
					resultsList.appendChild(newLi);
					// resultsList.innerHTML+="<li><a href='"+href+"'>"+addr+"</a></li>";
				}
			}
			if (valid==1) loadLocation(href);
	 		else if (valid > 1) {
	 			titleDiv.textContent = "Encontrados "+valid+ " lugares:";
	 			return;	
	 		} 
		}
		titleDiv.innerHTML = "No se ha podido encontrar el lugar. Inténtalo de nuevo";
	}
	/* Codifica una dirección, obteniendo lat y lon */
	window.geoCode = function() {
		var l = document.getElementById("address").value;
		if (!l) return;
		var thePath = window.location.pathname.split("/");
		if ((thePath[1]=="resultados") && (encodeURIComponent(l)==thePath[2])) {
			// Ya estoy en la página de resultados, cambiar radio tal vez
			thePath[thePath.length-1]=searchDistance.getvalue();
			window.location=thePath.join("/");
			return;
		}
		showLoader();
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode({'address': l, 'region': 'es'}, showResult);
		return false;
	}
	function Slider(div) {
		this.value = 2,
		this.max = 20,
		this.min = 1,
		this.step = .2,
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
		this.updateSlider = function(v) {
			var width = (v-slider.min) * sliderDiv.clientWidth/(slider.max-slider.min);
			barDiv.style.width = Math.round(width)+"px";
			barDiv.textContent = "Radio: " + v.toFixed(1) + " km.";
		}
		this.updateSlider(this.value);
		addEvent(padDiv,"mousemove", function(e) {
			var width = (e.clientX-2) - this.getBoundingClientRect().left;
			var newval = slider.min + width * (slider.max-slider.min)/this.clientWidth;
			newval = Math.round(newval/slider.step)*slider.step;
			newval = Math.max(slider.min,newval);
			newval = Math.min(slider.max,newval);
			slider.candidate = newval;
			slider.updateSlider(slider.candidate);
		});
		addEvent(padDiv,"click", function(e) {
			slider.value=slider.candidate;
			slider.updateSlider(slider.value);
		});
		addEvent(padDiv,"mouseout", function(e) {
			slider.updateSlider(slider.value);
		})
	}
	addEvent(w,"load", function() {
		var menuSearch = document.getElementById("menu-search");
		addEvent(menuSearch,"click", function(e) {
			stopEvent(e);
			this.className="menu search enabled";
			addEvent(document, "click", function() {
				menuSearch.className="menu search";
			})
		})
		function searchLocation() {if (!loadMapsAPI("geoCode")) geoCode(); return false;};
		document.getElementById("search-form").onsubmit=searchLocation;
		document.getElementById("search-b").onclick=searchLocation;
		lockScroll("results-list");
		searchDistance = new Slider("search-d");
		initGeoloc();
		var thePath = window.location.pathname.split("/");
		if (thePath[1]=="resultados") {
			var place = decodeURIComponent(thePath[2]);
			document.getElementById("address").value = place;
			searchDistance.updateSlider(parseFloat(thePath[5]));
		}
	});
})(window);
