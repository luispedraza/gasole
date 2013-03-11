function findLocation (loc) {
	var lat = loc.geometry.location.lat();
	var lon = loc.geometry.location.lng();
	window.location = "/resultados/"+encodeURI(loc.formatted_address)+"/"+lat+"/"+lon+"/"+2;
}

function geoCode() {
	var a = document.getElementById("address").value;
	var geocoder = new google.maps.Geocoder();
	geocoder.geocode({'address': a, 'region': 'es'}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			if (results.length == 1) {
				findLocation(results[0]);
				return;
			}
			else {
				var resultsDiv = document.getElementById("results");
				resultsDiv.innerHTML = "";
				var valid = 0;
				var added = 0;
				for (var i=0; i<results.length; i++) {
					var addr = results[i].formatted_address;
					if (addr.match(/España$/)) {
						added = i;
						valid++;
						var newR = document.createElement("li");
						newR.textContent = addr;
						resultsDiv.appendChild(newR);	
					}
				}
				if (valid > 1) {
					resultsDiv.style.display = "block";
					return;
				} else if (valid == 1) {
					findLocation(results[added]);
					return;
				}
			}
		}
		alert("Lo sentimos, pero los chicos de Google no han encontrado ningún lugar con esos datos :(");
	})
}