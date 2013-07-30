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
	var searchDistance = null,
		place1 = null,
		place2 = null;
	/* Va a por los resultados de búsqueda */
	function loadResult() {
		if (!is_route) {
			if (place1) {
				window.location="/resultados/"+place1+"/"+searchDistance.getvalue().toFixed(2);
			} else {
				window.geoCodeAndGo = function() {geoCode(true);}
				if (!loadMapsAPI("geoCodeAndGo")) geoCodeAndGo();
			}
		}
		else if (is_route) {
			if (place1 && place2) {
				window.location="/ruta/"+place1.split("/")[0]+"/"+place2.split("/")[0];
			}
		}	
	}
	function showLoader() {
		/* Muestra el spinner de carga */
		document.getElementById("current-loc"+((input_search=="origin")?"":"-dest")).className="loader";
	}
	function hideLoader() {
		/* Oculta el spinner de carga */
		if (input_search=="origin") document.getElementById("current-loc").className="sprt search_gps";
		else document.getElementById("current-loc-dest").className="";
	}
	function initGeoloc() {
		window.loadCurrentPosition = function() {
			/* Busca la posición actual del usuario */
			function showPosition(pos) {
				var geocoder = new google.maps.Geocoder();
				var latlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
				geocoder.geocode({'latLng': latlng}, showList);
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
			navigator.geolocation.getCurrentPosition(showPosition, showError);
		}
		/* Inicializa funciones de geolocalización del navegador */
		var loc = document.getElementById("current-loc");
		if (!navigator.geolocation) loc.style.display = "none";
		else addEvent(loc,"click", function() {
			showLoader();
			if (!loadMapsAPI("loadCurrentPosition")) loadCurrentPosition();
		});
	}
	function showList(r,s,go) {
		/* Muestra los resultados de geolocalización */
		hideLoader();
		var input = document.getElementById("address"+((input_search=="origin") ? "" : "-dest"));
		var resultsList = document.getElementById("results-list"+((input_search=="origin") ? "" : "-dest"));
		resultsList.innerHTML = "";
		if (s == google.maps.GeocoderStatus.OK) {
			var valid=0, 
				added=0, 
				href,
				addr;
			for (var i=0; i<r.length; i++) {
				var loc = r[i].geometry.location;
				addr = r[i].formatted_address;
				if (addr.match(/España$/)) {
					valid++; 
					added=i,
					href = encodeURIComponent(addr)+"/"+loc.lat()+"/"+loc.lng();
					var newLi = document.createElement("li");
					newLi.setAttribute("data-place", href);
					newLi.textContent = addr;
					newLi.onclick = function() {
						var href = this.getAttribute("data-place");
						if (input_search=="origin") place1=href;
						else place2=href;
						input.value = this.textContent;
						hideResult();
					};
					resultsList.appendChild(newLi);
				}
			}
			if (valid==1) {
				console.log("solo 1", input_search);
				if (input_search=="origin") place1=href;
				else place2=href;
				input.value = addr;
				hideResult();
				if (go) window.location="/resultados/"+href+"/"+searchDistance.getvalue().toFixed(2);
			}
			return;
		}
		resultsList.innerHTML = "<li>No se ha podido encontrar el lugar. Inténtalo de nuevo.</li>";
	}
	function hideResult() {
		document.getElementById("results-list"+((input_search=="origin") ? "" : "-dest"))
			.innerHTML="";
	}
	window.geoCode = function(go) {
		/* Codifica una dirección, obteniendo lat y lon */
		var addr = (input_search=="origin") ? "address" : "address-dest";
		var l = document.getElementById(addr).value;
		if (!l) return;
		var thePath = window.location.pathname.split("/");
		if ((input_search=="origin") && (thePath[1]=="resultados") && (encodeURIComponent(l)==thePath[2])) {
			// Ya estoy en la página de resultados, cambiar radio tal vez
			thePath[thePath.length-1]=searchDistance.getvalue();
			window.location=thePath.join("/");
			return;
		}
		showLoader();
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode({'address': l, 'region': 'es'}, function(r,s) {
			showList(r,s,go);
		});
	}
	function SearchInput(idInput, idList) {
		this.input = document.getElementById(idInput);
		this.list = dicument.getElementById(idList);
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
		// Selección de ruta
		function enableRouter(enable) {
			var _slider = document.getElementById("search-d"),
				_destinput = document.getElementById("address-dest"),
				_button = document.getElementById("route");
			if (enable) {
				is_route = true;
				_button.className += " on";
				_slider.style.display = "none";
				_destinput.removeAttribute("disabled");
			} else {
				is_route = false;
				_button.className = "sprt directions";
				_slider.style.display = "block";
				_destinput.setAttribute("disabled", "disabled");
			}
		}
		addEvent(document.getElementById("route"), "click", function() {
			var cname=this.className;
			enableRouter(cname.match(" on")==null);
		})
		function searchLocation() {
			if (!loadMapsAPI("geoCode")) geoCode();
			return false;
		}
		document.getElementById("address").onfocus=function() {
			hideResult(); input_search="origin";
		};
		document.getElementById("address-dest").onfocus=function() {
			hideResult(); input_search="destiny";
		};
		document.getElementById("search-form").onsubmit=searchLocation;
		document.getElementById("search-form-dest").onsubmit=searchLocation;
		document.getElementById("search-b").onclick=loadResult;
		lockScroll("results-list");		
		lockScroll("results-list-dest");
		searchDistance = new Slider("search-d");
		initGeoloc();
		var thePath = window.location.pathname.split("/");
		if (thePath[1]=="resultados") {
			document.getElementById("address").value = decodeURIComponent(thePath[2]);
			searchDistance.updateSlider(parseFloat(thePath[5]));
			place1=thePath.slice(2,5).join("/");
		}
	});
})(window);
