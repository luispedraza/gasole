/** @constructor */
function Sound(id) {
	this.html5audio = document.getElementById(id);
	this.play = function() {
		if (this.html5audio) {
			this.html5audio.pause();
			// this.html5audio.currentTime=0;
			this.html5audio.play();
		}
	}
}
var click = null;
var loader = "<img src='data:image/gif;base64,R0lGODlhEAAQAPQAAMzMzP///83NzfLy8uTk5Pz8/Pb29tPT09zc3Pn5+ebm5unp6dHR0eDg4NfX1+/v7+3t7QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAAFUCAgjmRpnqUwFGwhKoRgqq2YFMaRGjWA8AbZiIBbjQQ8AmmFUJEQhQGJhaKOrCksgEla+KIkYvC6SJKQOISoNSYdeIk1ayA8ExTyeR3F749CACH5BAkKAAAALAAAAAAQABAAAAVoICCKR9KMaCoaxeCoqEAkRX3AwMHWxQIIjJSAZWgUEgzBwCBAEQpMwIDwY1FHgwJCtOW2UDWYIDyqNVVkUbYr6CK+o2eUMKgWrqKhj0FrEM8jQQALPFA3MAc8CQSAMA5ZBjgqDQmHIyEAIfkECQoAAAAsAAAAABAAEAAABWAgII4j85Ao2hRIKgrEUBQJLaSHMe8zgQo6Q8sxS7RIhILhBkgumCTZsXkACBC+0cwF2GoLLoFXREDcDlkAojBICRaFLDCOQtQKjmsQSubtDFU/NXcDBHwkaw1cKQ8MiyEAIfkECQoAAAAsAAAAABAAEAAABVIgII5kaZ6AIJQCMRTFQKiDQx4GrBfGa4uCnAEhQuRgPwCBtwK+kCNFgjh6QlFYgGO7baJ2CxIioSDpwqNggWCGDVVGphly3BkOpXDrKfNm/4AhACH5BAkKAAAALAAAAAAQABAAAAVgICCOZGmeqEAMRTEQwskYbV0Yx7kYSIzQhtgoBxCKBDQCIOcoLBimRiFhSABYU5gIgW01pLUBYkRItAYAqrlhYiwKjiWAcDMWY8QjsCf4DewiBzQ2N1AmKlgvgCiMjSQhACH5BAkKAAAALAAAAAAQABAAAAVfICCOZGmeqEgUxUAIpkA0AMKyxkEiSZEIsJqhYAg+boUFSTAkiBiNHks3sg1ILAfBiS10gyqCg0UaFBCkwy3RYKiIYMAC+RAxiQgYsJdAjw5DN2gILzEEZgVcKYuMJiEAOwAAAAAAAAAAAA==' /><br>";
var pump_marker = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAwCAYAAABjezibAAAFmklEQVRYhd2ZP3DaSBTGvycyk8YemEljaEwVSiPUXIfSx3NcdyGFSUPK+DLpgT7kaKEJbkzrjFPcpLFc5YoIlFJpzmkw6UjkKjPoXbFaWRYSf2R8xX0zO4NWu9of763e7j4REkjTtPRsNtMVRSkSURFAJqbplJkt13WtVCplmKb5fd2xaJ3GqqruEdEhgAoRxUFFipmnAE6YuTMajT5vFFBV1bKiKE0AetR9TdMi+9m2jaurq6hbhuu6zdFodH4rQE3T0szc9KzmK5vNYn9/H+VyGYVCYeEAjuPAMAwYhgHTNG8AM3OHiJqLXB8L6LnzhIjyAWA8fvwY+/v7C6HiNB6P0ev1YBiGD8rMF8xciXN7JKCqqrtEZMl5trW1hXq9jmq1mggsLNu20Wq18OXLFwk5ZWY9CnIOUNO0NAADQBEQ7nz9+vVSVybR8fEx3rx5sxBSieh3A+74+PgmnGUBxSJAtLjk80CtdvPJ0ymg68ChmNLVahX1eh0AQEQZIjJUVd0NdrlhwVKp9Kd8Iba2ttDtdlG4fx/odASYHOTzilEinRZ/BhDAug48eyauDw6Afh+O4+D58+e+uwFYpmmqc89SVbWsaRrL8unTJ2Zm5rMzZmAz5cUL5rdvr68PDpiZ+cePH1wul/2xS6VSQ3L5Liaivvxdr9djY9utlMkItze88Y+OgFoN29vbaLfbfjMiakpXKwCgadqBDCfZbNafF5FqNFa32dlZ/HPSaWBvT0B2On4IC0L6gABq8sZCuE0pkxGl2RTX02nU2BVN09KKZ0oduF4h7ly6LqAkoKdcLudb0YvBFUVRlIps8OTJk7sFMwwBZVlAv+9bLqgQQ0VBYAOg6zruVOfnQKslQs3FxXycBFAoFJDNZgEAzKwrAPKAcG8ul7tbwN1dUYBI60nJCEJEGQXeqnHncICwWITVwgqy+HHwTuJeQgVZotbixWq1lq/Dsjx6dGvY9QH/Y/mAjuNEt8jngXJZlKTa2xP95cZhiYIs9+SPwG5iHtAwxO9icfWdTFCGIVYO4HpXtEBBFgVi/4fxeLx8oCRxcm/vGm5FBVkUAFMAuLy8XA6ZBDBBH9M0AYhdtm9BADAMI7rHLQZbt49t27i8vAQAEJGhuK7rU71//35x70xm/ZelUomub7VECSnEYCjeIcUCxOSU5o3VOhaJ+jP5/HydN0cdx8Hp6WnwTl+GmY6s6fV6mwOMalurzW9svUPUYDAInpf7pml+9w9NpVLpH7mrfvny5fUZ2LL8B/g6X5qxEAq/wYeHsS63bRtPnz71r13XzY9Go6/3AhWHqVTqBBBW1DRNHDen09WBwgrHTF2PBHQcB63AfPQSTF+BQKC2LOudpmknACpXV1dotVrodrvYTvJixClq/gFot9vBLMOFPI8AoXOxlyyypKsfPnyIRqNxJ1mFINxgMPCvXdctBrMLc6kPL2lkBPMy3W5345CO46DdbofDSs00zaNgRSrccTKZfNvZ2fmLiH4BsPPz5098+PABDx482Bikbdt49eoVPn78KKss13V/Hw6H78JtY9Nv4SQSAJTLZVSr1cSbW8dx0Ov1cHp6GswTWgD0uBzh0gxrMF8TgF8rT2jbNgaDwY28ICDe1uFw+MeiviulgIvF4q+pVKqJgDWDsHEWHY/Hc1CerNls1rQsa86liQBDoDUAMQvsUp3MZrP+KmBSawFKqaq66x34dWbW4zL+zDwlIgMiaX4ig+//SoksKFUqlRpEpDPzBYCLyAGIiqZp/pZ0jHvLm8SLiDrMfEhEelwb13Vj762iWx07TdP87rpuLe4+M6/0sWaR5laSdTWZTOxsNpvxVp6gjOFw+Oy2z9/Iwd3bffjnSe+7XNJQdEMbAQy7mpkrSb5sRunWLpaaTCbfcrnclJn/Ho1GR8t7rKZ/AacjxLFPJTdmAAAAAElFTkSuQmCC";

function initMap() {
	if (map) return;
	map = new google.maps.Map(
		document.getElementById("map-art"),
		{mapTypeId: google.maps.MapTypeId.ROADMAP,zoom: 7});
}

function clearMarkers() {
	for (var i=0;i<markers.length;i++) markers[i].setMap(null);
		markers=[];
}

function showList(data, hasDist) {
	if (!data) return;
	initMap();
	var list = $$("#list");
	list.html("");
	bounds = new google.maps.LatLngBounds();
	clearMarkers();
	var nResults = data.length;
	if (nResults==0) {
		list.html("<li class='error'><div class='icon warning'></div><strong>Ningún resultado.<br>Prueba aumentando el radio de búsqueda.</strong></li>");
	}
	else {
		var title = "<strong>Se han encontrado "+nResults+" puntos de venta de ";
		title+=FUEL_OPTIONS[gasole.type].name+" cerca de "+theLocation.name();
		title+=", con un precio medio de "+gasole.stats.mu.toFixed(3)+" €/l</strong>";
		var sort="<div class='right price sort on'>€/l</div>";
		if (hasDist) sort+="<div class='right dist sort'>km.</div>";
		list.html("<li class='title'>"+title+"</li><li><strong>Ordena los resultados:</strong>"+sort+"</li>");
		for (var i=0;i<nResults;i++) {
			var item = data[i];
			var title = "<strong>"+item.l+"</strong>";
			var subtitle = "<small>"+item.a+"</small>";
			var price = "<div class='right price'>"+item.p.toFixed(3)+"</div>";
			var dist = (hasDist) ? ("<div class='right dist'>"+item.d.toFixed(1)+"</div>") : "";
			var li = document.createElement("li");
			li.id = "s-"+i;
			$$(li).html(title+price+dist+subtitle).tap(function() {
				showDetail(parseInt(this.id.split("-")[1]));
			});
			list.append(li);
			// marker
			if (item.g) {
				var pos = new google.maps.LatLng(item.g[0], item.g[1]);
				bounds.extend(pos);
				marker = new google.maps.Marker({
					position: pos,
					map: map,
					icon: {
						path: google.maps.SymbolPath.CIRCLE,
						strokeOpacity: 1.0,
						strokeWeight: 1,
						fillOpacity: .8,
						scale: 6,
						strokeColor: "fff",
						fillColor: gasole.color(item.p)
					}
				});
				google.maps.event.addListener(marker, 'click', function() {
					showDetail(markers.indexOf(this));
				})
				markers.push(marker);
			}
		}
		list.append("<li><strong>Fin de los resultados</strong></li>");
	} 
	Lungo.Router.article("results-sec", "list-art");
}

function searchResults() {
	var name = $$('#search-input').val();
	if (name && (name!=theLocation.name())) {
		theLocation.clear();
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode({'address': name,'region': 'es'},
			function(r,s) {
				if (s==google.maps.GeocoderStatus.OK) {
					for (var i=0; i<r.length; i++) {
						var addr = r[i].formatted_address;
						if (addr.match(/España$/)) theLocation.add(addr, [r[i].geometry.location.lat(), r[i].geometry.location.lng()]);
					}
					var valid=theLocation.length();
					if (valid>1) {
						var title = "<h1>Encontrados "+valid+" lugares:</h1>";
						var list = "";
						for (var l=0; l<valid;l++) {
							list+="<li class='result icon pushpin' data-loc='"+l+"'>"+theLocation.get(l).name+"</li>";
						}
						Lungo.Notification.html(title+"<ul>"+list+"</ul>", "Cancelar");
						$$(".result").tap(function() {
							Lungo.Notification.hide();
							theLocation.select(parseInt(this.getAttribute("data-loc")));
							$$('#search-input').val(theLocation.name());
							searchResults();
						});
						
					} else {
						$$('#search-input').val(theLocation.name());
						searchResults();
					}
				}
			});
	} else {
		showList(gasole.nearDataArray(theLocation, "p"));
	}
}

function searchRoute() {
	initMap();
	if (!directionsRender) directionsRender = new google.maps.DirectionsRenderer({draggable:true});
	directionsRender.setMap(map);
	var request = {origin: $$('#originInput').val(),
		destination: $$('#destinyInput').val(),
		travelMode: google.maps.TravelMode.DRIVING,
		unitSystem: google.maps.UnitSystem.METRIC,
		avoidHighways: false,
		avoidTolls: true};
	var service = new google.maps.DirectionsService();
	service.route(request, function(r,s) {
		console.log(r);
		console.log(s);
		if (s==google.maps.DirectionsStatus.OK) {
			directionsRender.setDirections(r);
			// var simple = properRDP(r.routes[0].overview_path);
			// console.log(simple);
			// new google.maps.Polyline({map: map,path: simple});
			// var result = gasole.routeData(simple);
			var result = gasole.routeData(r.routes[0].overview_path);
			showList(result);
			console.log(result);
			// Lungo.Router.article("results-sec", "map-art");
		}
	});
}

function initControl(gasole) {
	var date = gasole.date;
	var when = (new Date().toLocaleDateString()==date.toLocaleDateString()) ? "hoy" : ("el "+date.getDate()+" de "+MONTHS[date.getMonth()]);
	$$('#info').text("Precios actualizados "+when+" a las "+date.toLocaleTimeString().split(":").splice(0,2).join(":"));
	Lungo.dom("#map-art").on("load", function() {
		google.maps.event.trigger(map, 'resize');
		if (bounds) map.fitBounds(bounds);
	})
	$$('.type').tap(function() {
		click.play();
		gasole.type = this.getAttribute("data-type");
		$$('.type').removeClass('sel');
		this.className+=" sel";
		$$('#typename').text(FUEL_OPTIONS[gasole.type].name);
	});
	$$('.d').tap(function() {
		click.play();
		theLocation.radius = parseInt(this.getAttribute("data-d"));
		$$('.d').removeClass('sel');
		this.className+=" sel";
		$$('#dist').text(theLocation.radius);
	});
	$$('.p').tap(function() {
		var data = gasole.provinceDataArray($$(this).text());
		console.log(data);
		showList(data);
	});
	$$('#search-button').tap(searchResults);
	$$('.locate').tap(function() {
		var input = $$("#"+this.id+"Input");
		var searchDiv = $$("#"+this.id+"Div");
		var icon = $$(this);
		var theLoc = null;
		if (this.id=="location") theLoc=theLocation;
		else if (this.id=="origin") theLoc=theOrigin;
		else if (this.id=="destiny") theLoc=theDestiny;
		if (searchDiv.hasClass("current")) {
			icon.removeClass('found');
			input.val("").removeAttr('readonly');
			theLoc.clear();
			searchDiv.removeClass("current");
		} else {
			icon.addClass("spinner");
			function posLoad(pos) {
				clearInterval(to);
				icon.removeClass('spinner').addClass('found');
				searchDiv.addClass('current');
				input.val("Mi posición actual").attr('readonly',true);
				theLoc.clear();
				theLoc.add(input.val(), [pos.coords.latitude, pos.coords.longitude]);
			}
			function posError(e) {
				clearInterval(to);
				icon.removeClass('spinner');
				Lungo.Notification.show("No se puede obtener tu posición","warning", 3);
				input.val("");
			}
			input.val("Obteniendo posición");
			var to = setInterval(function() {input.val(input.val()+".");}, 100);
			navigator.geolocation.getCurrentPosition(posLoad, posError, {timeout: 5000});
		}
	});
	$$('.sort').tap(function() {
		showList(gasole.nearDataArray(theLocation, ($$(this).hasClass("price")) ? "p" : "d")); 
		$$('.sort').removeClass("on");
		this.className+=" on";
	});
	$$('#route-button').tap(searchRoute);
}

function showDetail(id) {
	map.panTo(markers[id].position);
	map.setZoom(15);
	Lungo.Router.article("results-sec","map-art");
	if (!markerDetail) {
		markerDetail = new google.maps.Marker({
			map: map,
			position: markers[id].position,
			animation: google.maps.Animation.BOUNCE,
			icon: pump_marker
		});
	} else {
		markerDetail.setPosition(markers[id].position);
		markerDetail.setAnimation(google.maps.Animation.BOUNCE);
	}
}

window.addEventListener("load", function() {
	Lungo.init({name: "GasOlé"});
	Lungo.Notification.show("<div class='icon refresh spinner'></div>Actualizando Datos…");
	gasole = new Gasole(function() {
		console.log("callback");
		Lungo.Notification.hide();
		initControl(this);
	})
	click = new Sound("click");
})
var gasole = null;
var map = null;
var directionsRender = null;
var markerDetail = null;
var theLocation=new SearchLocations();	// Referencia de búsqueda
var theOrigin=new SearchLocations(); 	// Origen de un recorrido
var theDestiny=new SearchLocations(); 	// Destino de un recorrido
var bounds=null;						// límites de los resultados
var markers=[];