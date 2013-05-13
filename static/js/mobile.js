function distance(a,b,r) {
	var dlat = Math.abs(a[0]-b[0])*111.03461;
	if (dlat<r) {
		var dlon = Math.abs(a[1]-b[1])*85.39383;
		if (dlon<r) {
			var dist = Math.sqrt(Math.pow(dlat,2)+Math.pow(dlon,2));
			if (dist<r) return dist;
		}
	}
}

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
	var mapOptions = {
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	var mapdiv = document.getElementById("map-art");
	map = new google.maps.Map(mapdiv, mapOptions);
}
/** @constructor */
function Gasole() {
	this.info = null; 		// datos de la api
	this.date = null;		// fecha de actualización
	this.type = "1";
	this.init = function(data, date) {this.info = data;this.date=date};
	this.provinceData = function(p) {
		var t = this.type;
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
	this.nearData = function(loc, sort) {
		var l = loc.latlng(); if (!l) return;
		var r = loc.radius;
		if (typeof(sort)=="undefined") sort="p";
		result = [];
		var type = this.type;
		for (var prov in this.info) {
			var infop = this.info[prov];
			for (var town in infop) {
				var infot = infop[town];
				for (var station in infot) {
					var st = infot[station];
					var price = st.o[type];
					if (price) {
						var geo = st.g;
						if (geo) {
							var dist = distance(geo,l,r);
							if (dist) {
								result.push({a:station,r:st.r,g:geo,p:price,t:town,l:st.l,d:dist});
							}
						}
					}
				}
			}
		}
		return result.sort(function(a,b){return (a[sort]<b[sort]) ? -1 : 1;});
	}
}

var map = null;
var gasole = new Gasole();
var markerDetail = null;

/** @constructor */
function SearchLocations() {
	this.locs=[];
	this.radius=2;
	this.length = function() {return this.locs.length};
	this.add = function(p, ll) { this.locs.push({name: p, latlng: ll})};
	this.latlng = function() {return (this.length()==1) ? this.locs[0].latlng : null};
	this.name = function() {return (this.length()==1) ? this.locs[0].name : null};
	this.get = function(m) {return this.locs[m]};
	this.select = function(m) {this.locs = [this.locs[m]]};
	this.clear = function() {this.locs=[]};
};	
var theLocation=new SearchLocations();	// Referencia de búsqueda
var bounds=null;						// límites de los resultados
var markers=[];

function clearMarkers() {
	for (var i=0;i<markers.length;i++) markers[i].setMap(null);
		markers=[];
}

function showList(data) {
	if (!data) return;
	if (!map) initMap();
	var list = $$("#list");
	list.html("");
	var options = { 
		icon: {
			path: google.maps.SymbolPath.CIRCLE,
			strokeOpacity: 1.0,
			strokeWeight: 1,
			fillOpacity: .8,
			scale: 6,
			strokeColor: "#0f0"
		}, 
		map: map
	};
	bounds = new google.maps.LatLngBounds();
	clearMarkers();
	var nResults = data.length;
	if (nResults==0) {
		list.html("<li class='error'><div class='icon warning'></div><strong>Ningún resultado.<br>Prueba aumentando el radio de búsqueda.</strong></li>");
	}
	else {
		var title = "<strong>Se han encontrado "+nResults+" puntos de venta de ";
		title+=FUEL_OPTIONS[gasole.type].name+" cerca de "+theLocation.name()+"</strong>";
		var sort="<div class='right price sort on'>€/l</div>";
		sort+="<div class='right dist sort'>km.</div>";
		list.html("<li class='title'>"+title+"</li><li><strong>Ordena los resultados:</strong>"+sort+"</li>");
		for (var i=0;i<nResults;i++) {
			var item = data[i];
			var title = "<strong>"+item.l+"</strong>";
			var subtitle = "<small>"+item.a+"</small>";
			var price = "<div class='right price'>"+item.p.toFixed(3)+"</div>";
			var dist = "<div class='right dist'>"+item.d.toFixed(1)+"</div>";
			var li = document.createElement("li");
			li.id = "s-"+i;
			$$(li).html(title+price+dist+subtitle).tap(function() {
				showDetail(parseInt(this.id.split("-")[1]));
			});
			list.append(li);
			// marker
			var pos = new google.maps.LatLng(item.g[0], item.g[1]);
			options.position = pos;
			bounds.extend(pos);
			marker = new google.maps.Marker(options);
			markers.push(marker);
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
		showList(gasole.nearData(theLocation));
	}
}

function initControl() {
	var now = new Date();
	var date = gasole.date;
	var when = (now.toLocaleDateString()==date.toLocaleDateString()) ? "hoy" : ("el "+date.getDay()+" de "+MONTHS[date.getMonth()]);
	$$('#info').text("Precios actualizados "+when+" a las "+date.toLocaleTimeString().split(":").splice(0,2).join(":"));
	Lungo.dom("#map-art").on("load", function() {
		google.maps.event.trigger(map, 'resize');
		map.fitBounds(bounds);
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
		var data = gasole.provinceData($$(this).text(), $$(".sel")[0].getAttribute("data-type"));
		showList(data);
	});
	$$('#search-button').tap(searchResults);
	$$('#location').tap(function() {
		var input = $$('#search-input');
		var searchDiv = $$('#search');
		if (searchDiv.hasClass("current")) {
			$$('.locate').style('color',"#ccc");
			input.val("").removeAttr('readonly');
			theLocation.clear();
			searchDiv.toggleClass("current");
		} else {
			$$(this).addClass("spinner");
			function posLoad(pos) {
				clearInterval(to);
				$$('.locate').removeClass("spinner").style('color',"#fff");
				theLocation.clear();
				searchDiv.toggleClass("current");
				input.val("Mi posición actual").attr('readonly',true);
				theLocation.add(input.val(), [pos.coords.latitude, pos.coords.longitude]);
			}
			function posError(e) {
				clearInterval(to);
				$$('.locate').removeClass("spinner");
				Lungo.Notification.show("No se puede obtener tu posición","warning", 3);
				input.val("");
			}
			input.val("Obteniendo posición.");
			var to = setInterval(function() {
				input.val(input.val()+".");
			}, 100);
			navigator.geolocation.getCurrentPosition(posLoad, posError, {timeout: 5000});
		}
	});
	$$('.sort').tap(function() {
		showList(gasole.nearData(theLocation, ($$(this).hasClass("price")) ? "p" : "d")); 
		$$('.sort').removeClass("on");
		this.className+=" on";
	});
}

function showDetail(id) {
	console.log(id);
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
	var storedData = localStorage["gasole"];
	if (!storedData || ((parseInt(storedData.ts)-new Date().getTime())>LS_EXPIRE)) {
		Lungo.Notification.show("<div class='icon refresh spinner'></div>Actualizando Datos…");
		var req = new XMLHttpRequest();
		req.onload = function() {
			var date = new Date();
			gasole.init(JSON.parse(this.responseText), date);
			localStorage.setItem("gasole", '{"ts": '+ date.getTime() +',"data": '+this.responseText+'}');
			Lungo.Notification.hide();
			initControl();
		}
		req.open("GET", "/api/All");
		req.send();
	} else {
		var data = JSON.parse(storedData);
		gasole.init(data.data, new Date(data.ts));
		initControl();
	}
	
	click = new Sound("click");
})