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
	window.location = "/resultados/"+address+"/"+lat+"/"+lon+"/"+d;
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
	var loc = document.getElementById("current-loc");
	if (!navigator.geolocation) {
		loc.style.display = "none";
	} else {
		loc.addEventListener("click", loadCurrentPosition);
	}
}
/* Muestra los resultados de geolocalización */
function showResult(r,s) {
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
				newA.addEventListener("click", function() {
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
/* Codifica una dirección, obteniendo lat y lon */
function geoCode() {
	showLoader();
	var l = document.getElementById("address").value;
	var geocoder = new google.maps.Geocoder();
	geocoder.geocode({'address': l, 'region': 'es'}, showResult);
}

function mySlider(div) {
	function updateSlider(s) {
		var valdiv = s.getElementsByClassName("val")[0];
		var newval = parseFloat(s.getAttribute("newval"));
		var max = parseFloat(s.getAttribute("max"));
		var min = parseFloat(s.getAttribute("min"));
		var width = (newval-min) * s.clientWidth / (max-min);
		valdiv.style.width = (width-5)+"px";
		valdiv.textContent = "Radio: " + newval.toFixed(1) + " km.";
		s.setAttribute("value", newval);
	}
	div.style.position = "relative";
	var valdiv = document.createElement("div");
	valdiv.style.position = "absolute";
	valdiv.style.left = "0";
	valdiv.style.top = "0";
	valdiv.textContent = "Radio: " + div.getAttribute("value") + " km.";
	valdiv.className = "val";
	div.appendChild(valdiv);
	var bar = document.createElement("div");
	bar.style.position = "absolute";
	bar.style.left = "0";
	bar.style.top = "0";
	bar.className = "new-val";
	bar.style.display = "none";
	div.appendChild(bar);
	div.setAttribute("newval", div.getAttribute("value"));
	updateSlider(div);
	div.addEventListener("mousemove", function(e) {
		var bar = this.getElementsByClassName("new-val")[0];
		bar.style.display = "block";
		var width = e.clientX - this.getBoundingClientRect().left;
		bar.style.width = (width-5)+"px";
		var max = parseFloat(this.getAttribute("max"));
		var min = parseFloat(this.getAttribute("min"));
		var step = parseFloat(this.getAttribute("step"));
		var newval = min + width * (max-min) / this.clientWidth;
		newval = parseInt(newval/step)*step;
		if (newval<min) newval = min;
		if (newval>max) newval = max;
		bar.textContent = "Radio: " + newval.toFixed(1) + " km.";
		this.setAttribute("newval", newval);
	});
	div.addEventListener("click", function(e) {
		this.getElementsByClassName("new-val")[0].style.display = "none";
		updateSlider(this);
	});
	div.addEventListener("mouseout", function(e) {
		this.getElementsByClassName("new-val")[0].style.display = "none";
	})
}

window.addEventListener("load", function() {
	var sliders = document.getElementsByClassName("my-slider");
	for (var i=0; i<sliders.length; i++) {
		mySlider(sliders[i]);
	}
	var map = document.getElementById("map");
	if (map) {
		var provinces = map.getElementsByClassName("prov");
		for (var p=0; p<provinces.length; p++) {
			provinces[p].addEventListener("click", function() {

			})
		}
	}
	initGeoloc();
});