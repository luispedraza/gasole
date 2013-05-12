function distance(a,b,r) {
	var dlat = Math.abs(a[0]-b[0])*111.03461;
	if (dlat<r) {
		var dlon = Math.abs(a[1]-b[1])*85.39383;
		if (dlon<r) return Math.sqrt(Math.pow(dlat,2)+Math.pow(dlon,2));
	}
	return null;
}

/** @constructor */
function Sound(id) {
	this.html5audio = document.getElementById(id);
	this.play = function() {
		if (this.html5audio) {
			this.html5audio.pause();
			this.html5audio.currentTime=0;
			this.html5audio.play();
		}
	}
}
var click = null;
var loader = "<img src='data:image/gif;base64,R0lGODlhEAAQAPQAAMzMzP///83NzfLy8uTk5Pz8/Pb29tPT09zc3Pn5+ebm5unp6dHR0eDg4NfX1+/v7+3t7QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAAFUCAgjmRpnqUwFGwhKoRgqq2YFMaRGjWA8AbZiIBbjQQ8AmmFUJEQhQGJhaKOrCksgEla+KIkYvC6SJKQOISoNSYdeIk1ayA8ExTyeR3F749CACH5BAkKAAAALAAAAAAQABAAAAVoICCKR9KMaCoaxeCoqEAkRX3AwMHWxQIIjJSAZWgUEgzBwCBAEQpMwIDwY1FHgwJCtOW2UDWYIDyqNVVkUbYr6CK+o2eUMKgWrqKhj0FrEM8jQQALPFA3MAc8CQSAMA5ZBjgqDQmHIyEAIfkECQoAAAAsAAAAABAAEAAABWAgII4j85Ao2hRIKgrEUBQJLaSHMe8zgQo6Q8sxS7RIhILhBkgumCTZsXkACBC+0cwF2GoLLoFXREDcDlkAojBICRaFLDCOQtQKjmsQSubtDFU/NXcDBHwkaw1cKQ8MiyEAIfkECQoAAAAsAAAAABAAEAAABVIgII5kaZ6AIJQCMRTFQKiDQx4GrBfGa4uCnAEhQuRgPwCBtwK+kCNFgjh6QlFYgGO7baJ2CxIioSDpwqNggWCGDVVGphly3BkOpXDrKfNm/4AhACH5BAkKAAAALAAAAAAQABAAAAVgICCOZGmeqEAMRTEQwskYbV0Yx7kYSIzQhtgoBxCKBDQCIOcoLBimRiFhSABYU5gIgW01pLUBYkRItAYAqrlhYiwKjiWAcDMWY8QjsCf4DewiBzQ2N1AmKlgvgCiMjSQhACH5BAkKAAAALAAAAAAQABAAAAVfICCOZGmeqEgUxUAIpkA0AMKyxkEiSZEIsJqhYAg+boUFSTAkiBiNHks3sg1ILAfBiS10gyqCg0UaFBCkwy3RYKiIYMAC+RAxiQgYsJdAjw5DN2gILzEEZgVcKYuMJiEAOwAAAAAAAAAAAA==' /><br>";

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
	this.type = "1";
	this.init = function(data) {this.info = data;};
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
	this.nearData = function(l, sort) {
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
							var dist = distance(geo,l,searchRadius);
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
var searchRadius = 2;
var map = null;
gasole = new Gasole();
/** @constructor */
function SearchLocations() {
	this.locs=[];
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
		list.html("<li class='icon warning'> Ningún resultado. Prueba aumentando el radio de búsqueda.</li>");
	}
	else {
		var title = "<strong>Se han encontrado "+nResults+" resultados</strong>";
		title+="<div class='right price sort on'>€/l</div>";
		title+="<div class='right dist sort'>km.</div>";
		list.html("<li>"+title+"</li>");
		for (var i=0;i<nResults;i++) {
			var item = data[i];
			var title = "<strong>"+item.l+"</strong>";
			var subtitle = "<small>"+item.a+"</small>";
			var price = "<div class='right price'>"+item.p.toFixed(3)+"</div>";
			var dist = "<div class='right dist'>"+item.d.toFixed(1)+"</div>";
			list.append("<li>"+title+price+dist+subtitle+"</li>");
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
		console.log("buscar nueva posición");
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
		var geo = theLocation.latlng();
		if (geo) showList(gasole.nearData(geo));
	}
}

function initControl() {
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
		searchRadius = parseInt(this.getAttribute("data-d"));
		$$('.d').removeClass('sel');
		this.className+=" sel";
		$$('#dist').text(searchRadius);
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
			function posLoad(pos) {
				clearInterval(to);
				theLocation.clear();
				$$('.locate').style('color',"#fff");
				searchDiv.toggleClass("current");
				input.val("Mi posición actual").attr('readonly',true);
				theLocation.add(input.val(), [pos.coords.latitude, pos.coords.longitude]);
			}
			function posError(e) {
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
		showList(gasole.nearData(theLocation.latlng(), ($$(this).hasClass("price")) ? "p" : "d")); 
		$$('.sort').removeClass("on");
		$$(this).addClass("on");
	});
}

window.addEventListener("load", function() {
	Lungo.Notification.show();
	var pos = null;
	Lungo.init({name: "GasOlé"});
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
	initControl();
	Lungo.Notification.hide();
})