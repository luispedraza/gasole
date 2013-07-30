(function(w) {
	function mapsAPI(callback) {
		// carga dinámica de la api, para el buscador, en páginas sin mapa
		if (!window.google || !window.google.maps) {
			// Función que llama la api de google maps al cargarse, o que se ejecuta si ya está cargada
			window._geoCallback = callback;
			var script = document.createElement("script");
			script.type = "text/javascript";
			script.src = "http://maps.googleapis.com/maps/api/js?key=AIzaSyD5XZNFlQsyWtYDeKual-OcqmP_5pgwbds&sensor=false&callback=_geoCallback";
			document.body.appendChild(script);
		}
		else callback();
	}
	function SearchPlace(form,placeholder,geo,en) {
		var THAT = this;
		THAT.href = null;
		var loader = THAT.loader = document.createElement("div"),
			input = THAT.input = document.createElement("input"),
			ol = THAT.list = document.createElement("ol");
		THAT.enable = function(en) {
			if (en) THAT.input.removeAttribute("disabled");
			else THAT.input.setAttribute("disabled","");
		}
		THAT.getPlace = function() {return THAT.href;}
		THAT.geoCode = function() {
			/* Codifica una dirección, obteniendo lat y lon */
			var l = THAT.input.value;
			if (!l) return;
			THAT.showLoader(true);
			var geocoder = new google.maps.Geocoder();
			geocoder.geocode({'address': l, 'region': 'es'}, function(r,s) {
				THAT.showList(r,s);
			});
		}
		THAT.showLoader = function(show) {
			loader.style.display = show ? "block" : "none";
		}
		THAT.init = function(url) {
			THAT.href = url;
			THAT.input.value = decodeURIComponent(url.split("/")[0]);
		}
		THAT.clearList = function() {ol.innerHTML=""};
		THAT.showList = function(r,s) {
			/* Muestra los resultados de geolocalización */
			THAT.showLoader(false);
			THAT.clearList();
			if (s == google.maps.GeocoderStatus.OK) {
				function selectItem(li) {
					THAT.href = li.getAttribute("data-place");
					input.value = li.textContent;
					THAT.clearList();
				}
				var valid=0, 
					added=0,
					addr,
					newLi;
				for (var i=0; i<r.length; i++) {
					var loc = r[i].geometry.location;
					addr = r[i].formatted_address;
					if (addr.match(/España$/)) {
						valid++,
						added=i;
						var newLi = document.createElement("li");
						newLi.setAttribute("data-place", encodeURIComponent(addr)+"/"+loc.lat()+"/"+loc.lng());
						newLi.textContent = addr;
						newLi.onclick = function() {selectItem(this)};
						ol.appendChild(newLi);
					}
				}
				if (valid==1) {selectItem(newLi)};	// sólo 1 resultado válido
				if (valid>0) return;
			}
			ol.innerHTML = "<li>No se ha podido encontrar el lugar. Inténtalo de nuevo.</li>";
		}
		// Clase de buscador de LUGAR
		form = document.getElementById(form);
		if (geo && (navigator.geolocation!=undefined)) {
			THAT.loadCurrentPosition = function() {
				/* Busca la posición actual del usuario */
				function positionOK(pos) {
					var geocoder = new google.maps.Geocoder();
					var latlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
					geocoder.geocode({'latLng': latlng}, THAT.showList);
				}
				function positionError(e) {
					switch(e.code) {
						case e.PERMISSION_DENIED: console.log("No has permitido que obtengamos tu posición."); break;
						case e.POSITION_UNAVAILABLE: console.log("No es posible obtener tu posición acual."); break;
						case e.TIMEOUT: console.log("Se ha agotado el tiempo de espera."); break;
						case e.UNKNOWN_ERROR: console.log("Ha ocurrido un error desconocido."); break;
					}
				}
				navigator.geolocation.getCurrentPosition(positionOK, positionError);
			}
			var geoDiv = document.createElement("div");
			geoDiv.className = "sprt search_gps";
			geoDiv.onclick = function() {
				THAT.showLoader(true);
				mapsAPI(THAT.loadCurrentPosition);
			};
			form.appendChild(geoDiv);
		}
		// El spinner de carga
		loader.className = "loader";
		form.appendChild(loader);
		// El input de comentarios
		input.setAttribute("type", "search");
		input.setAttribute("placeholder", placeholder);
		form.appendChild(input);
		// La lista de resultados
		ol.className = "results";
		lockScroll(ol);
		form.appendChild(ol);
		// El envío del formulario
		form.onsubmit = function() {
			mapsAPI(THAT.geoCode);	// cuando se pula enter en el formulario
			return false;	
		}
		input.onblur = function() { if (THAT.href==null) mapsAPI(THAT.geoCode);};
		input.onsearch = function() {
			THAT.clearList();
			THAT.href=null;
			console.log("tetas")
		};
		THAT.enable(en);
	}
	var searchDistance = null,
		place1 = null,
		place2 = null;

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
		this.enable = function(en) {sliderDiv.style.display = en ? "block" : "none"};
	}
	addEvent(w,"load", function() {
		function searchLocation() {
			var p1 = place1.getPlace();
			if (p1) {
				window.location="/resultados/"+p1+"/"+sliderDist.getvalue().toFixed(1);
			}
		}
		function searchRoute() {
			var p1 = place1.getPlace(),
				p2 = place2.getPlace();
			if ((p1!=null) && (p2!=null)) {
				window.location="/ruta/"+p1.split("/")[0]+"/"+p2.split("/")[0];
			}
		}
		sliderDist = new Slider("search-d");
		place1 = new SearchPlace("search-form","Gran Vía 35, Madrid -o- Aeropuerto -o- Hotel Palace",true,true),
		place2 = new SearchPlace("search-form-dest","Barcelona",false,false);
		var menuSearch = document.getElementById("menu-search"),
			buttonSearch = document.getElementById("search-b");
		addEvent(menuSearch,"click", function(e) {
			stopEvent(e);
			// Se despliega el formulario
			this.className="menu search enabled";
			addEvent(document, "click", function() { menuSearch.className="menu search";})
		})
		addEvent(document.getElementById("route"), "click", function() {
			var route = (this.className.match(" on")==null);
			sliderDist.enable(!route);
			place2.enable(route);
			this.className = "sprt directions" + (route ? " on" : "");
			buttonSearch.onclick = route ? searchRoute : searchLocation;
		})

		var thePath = window.location.pathname.split("/");
		if (thePath[1]=="resultados") {
			place1.init(thePath.slice(2,5).join("/"));
			sliderDist.updateSlider(parseFloat(thePath[5]));
		}
		buttonSearch.onclick = searchLocation;
	});
})(window);
