function searchLocation(a){var c="",b="",d="";"object"==typeof a?(c=a.geometry.location.lat(),b=a.geometry.location.lng(),d=encodeURI(a.formatted_address)):"string"==typeof a&&(b=a.split("##"),d=b[0],c=b[1],b=b[2]);a=document.getElementById("search-d").getAttribute("value");window.location="/resultados/"+d+"/"+c+"/"+b+"/"+a}
function showLoader(){document.getElementById("results-title").textContent="Buscando\u2026";var a=document.getElementById("results-list");a.innerHTML="";var c=new Image;c.src="/img/search-loader.gif";a.appendChild(c)}function initGeoloc(){var a=document.getElementById("current-loc");navigator.geolocation?a.addEventListener("click",loadCurrentPosition):a.style.display="none"}
function showResult(a,c){document.getElementById("results").style.display="block";var b=document.getElementById("results-list");b.innerHTML="";if(c==google.maps.GeocoderStatus.OK){for(var d=0,f=0,g=0;g<a.length;g++){var e=a[g].formatted_address;if(e.match(/Espa\u00f1a$/)){console.log(typeof a[g]);d++;var f=g,h=document.createElement("li"),l=document.createElement("a");h.appendChild(l);l.textContent=e;l.href="#";l.setAttribute("loc",[a[g].formatted_address,a[g].geometry.location.lat(),a[g].geometry.location.lng()].join("##"));
l.addEventListener("click",function(){searchLocation(this.getAttribute("loc"))});b.appendChild(h)}}if(1==d){searchLocation(a[f]);return}if(1<d){document.getElementById("results-title").textContent="Encontrados "+d+" lugares:";return}}b.innerHTML="<li>No se ha podido encontrar el lugar. Int\u00e9ntalo de nuevo</li>"}
function loadCurrentPosition(){showLoader();navigator.geolocation.getCurrentPosition(function(a){var c=new google.maps.Geocoder;a=new google.maps.LatLng(a.coords.latitude,a.coords.longitude);c.geocode({latLng:a},showResult)},function(a){switch(a.code){case a.PERMISSION_DENIED:console.log("User denied the request for Geolocation.");break;case a.POSITION_UNAVAILABLE:console.log("Location information is unavailable.");break;case a.TIMEOUT:console.log("The request to get user location timed out.");break;
case a.UNKNOWN_ERROR:console.log("An unknown error occurred.")}})}function geoCode(){showLoader();var a=document.getElementById("address").value;(new google.maps.Geocoder).geocode({address:a,region:"es"},showResult)}
function mySlider(a){function c(a){var c=a.getElementsByClassName("val")[0],b=parseFloat(a.getAttribute("newval")),e=parseFloat(a.getAttribute("max")),h=parseFloat(a.getAttribute("min"));c.style.width=(b-h)*a.clientWidth/(e-h)-5+"px";c.textContent="Radio: "+b.toFixed(1)+" km.";a.setAttribute("value",b)}a.style.position="relative";var b=document.createElement("div");b.style.position="absolute";b.style.left="0";b.style.top="0";b.textContent="Radio: "+a.getAttribute("value")+" km.";b.className="val";
a.appendChild(b);b=document.createElement("div");b.style.position="absolute";b.style.left="0";b.style.top="0";b.className="new-val";b.style.display="none";a.appendChild(b);a.setAttribute("newval",a.getAttribute("value"));c(a);a.addEventListener("mousemove",function(a){var c=this.getElementsByClassName("new-val")[0];c.style.display="block";var b=a.clientX-this.getBoundingClientRect().left;c.style.width=b-5+"px";a=parseFloat(this.getAttribute("max"));var e=parseFloat(this.getAttribute("min")),h=parseFloat(this.getAttribute("step")),
b=e+b*(a-e)/this.clientWidth,b=parseInt(b/h)*h;b<e&&(b=e);b>a&&(b=a);c.textContent="Radio: "+b.toFixed(1)+" km.";this.setAttribute("newval",b)});a.addEventListener("click",function(a){this.getElementsByClassName("new-val")[0].style.display="none";c(this)});a.addEventListener("mouseout",function(a){this.getElementsByClassName("new-val")[0].style.display="none"})}
window.addEventListener("load",function(){for(var a=document.getElementsByClassName("my-slider"),c=0;c<a.length;c++)mySlider(a[c]);if(a=document.getElementById("map")){a=a.getElementsByClassName("prov");for(c=0;c<a.length;c++)a[c].addEventListener("click",function(){})}initGeoloc()});function Sound(a){this.html5audio=document.getElementById(a);this.play=function(){this.html5audio&&(this.html5audio.pause(),this.html5audio.play())}}
var click=null,loader="<img src='data:image/gif;base64,R0lGODlhEAAQAPQAAMzMzP///83NzfLy8uTk5Pz8/Pb29tPT09zc3Pn5+ebm5unp6dHR0eDg4NfX1+/v7+3t7QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAAFUCAgjmRpnqUwFGwhKoRgqq2YFMaRGjWA8AbZiIBbjQQ8AmmFUJEQhQGJhaKOrCksgEla+KIkYvC6SJKQOISoNSYdeIk1ayA8ExTyeR3F749CACH5BAkKAAAALAAAAAAQABAAAAVoICCKR9KMaCoaxeCoqEAkRX3AwMHWxQIIjJSAZWgUEgzBwCBAEQpMwIDwY1FHgwJCtOW2UDWYIDyqNVVkUbYr6CK+o2eUMKgWrqKhj0FrEM8jQQALPFA3MAc8CQSAMA5ZBjgqDQmHIyEAIfkECQoAAAAsAAAAABAAEAAABWAgII4j85Ao2hRIKgrEUBQJLaSHMe8zgQo6Q8sxS7RIhILhBkgumCTZsXkACBC+0cwF2GoLLoFXREDcDlkAojBICRaFLDCOQtQKjmsQSubtDFU/NXcDBHwkaw1cKQ8MiyEAIfkECQoAAAAsAAAAABAAEAAABVIgII5kaZ6AIJQCMRTFQKiDQx4GrBfGa4uCnAEhQuRgPwCBtwK+kCNFgjh6QlFYgGO7baJ2CxIioSDpwqNggWCGDVVGphly3BkOpXDrKfNm/4AhACH5BAkKAAAALAAAAAAQABAAAAVgICCOZGmeqEAMRTEQwskYbV0Yx7kYSIzQhtgoBxCKBDQCIOcoLBimRiFhSABYU5gIgW01pLUBYkRItAYAqrlhYiwKjiWAcDMWY8QjsCf4DewiBzQ2N1AmKlgvgCiMjSQhACH5BAkKAAAALAAAAAAQABAAAAVfICCOZGmeqEgUxUAIpkA0AMKyxkEiSZEIsJqhYAg+boUFSTAkiBiNHks3sg1ILAfBiS10gyqCg0UaFBCkwy3RYKiIYMAC+RAxiQgYsJdAjw5DN2gILzEEZgVcKYuMJiEAOwAAAAAAAAAAAA==' /><br>",pump_marker=
"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAwCAYAAABjezibAAAFmklEQVRYhd2ZP3DaSBTGvycyk8YemEljaEwVSiPUXIfSx3NcdyGFSUPK+DLpgT7kaKEJbkzrjFPcpLFc5YoIlFJpzmkw6UjkKjPoXbFaWRYSf2R8xX0zO4NWu9of763e7j4REkjTtPRsNtMVRSkSURFAJqbplJkt13WtVCplmKb5fd2xaJ3GqqruEdEhgAoRxUFFipmnAE6YuTMajT5vFFBV1bKiKE0AetR9TdMi+9m2jaurq6hbhuu6zdFodH4rQE3T0szc9KzmK5vNYn9/H+VyGYVCYeEAjuPAMAwYhgHTNG8AM3OHiJqLXB8L6LnzhIjyAWA8fvwY+/v7C6HiNB6P0ev1YBiGD8rMF8xciXN7JKCqqrtEZMl5trW1hXq9jmq1mggsLNu20Wq18OXLFwk5ZWY9CnIOUNO0NAADQBEQ7nz9+vVSVybR8fEx3rx5sxBSieh3A+74+PgmnGUBxSJAtLjk80CtdvPJ0ymg68ChmNLVahX1eh0AQEQZIjJUVd0NdrlhwVKp9Kd8Iba2ttDtdlG4fx/odASYHOTzilEinRZ/BhDAug48eyauDw6Afh+O4+D58+e+uwFYpmmqc89SVbWsaRrL8unTJ2Zm5rMzZmAz5cUL5rdvr68PDpiZ+cePH1wul/2xS6VSQ3L5Liaivvxdr9djY9utlMkItze88Y+OgFoN29vbaLfbfjMiakpXKwCgadqBDCfZbNafF5FqNFa32dlZ/HPSaWBvT0B2On4IC0L6gABq8sZCuE0pkxGl2RTX02nU2BVN09KKZ0oduF4h7ly6LqAkoKdcLudb0YvBFUVRlIps8OTJk7sFMwwBZVlAv+9bLqgQQ0VBYAOg6zruVOfnQKslQs3FxXycBFAoFJDNZgEAzKwrAPKAcG8ul7tbwN1dUYBI60nJCEJEGQXeqnHncICwWITVwgqy+HHwTuJeQgVZotbixWq1lq/Dsjx6dGvY9QH/Y/mAjuNEt8jngXJZlKTa2xP95cZhiYIs9+SPwG5iHtAwxO9icfWdTFCGIVYO4HpXtEBBFgVi/4fxeLx8oCRxcm/vGm5FBVkUAFMAuLy8XA6ZBDBBH9M0AYhdtm9BADAMI7rHLQZbt49t27i8vAQAEJGhuK7rU71//35x70xm/ZelUomub7VECSnEYCjeIcUCxOSU5o3VOhaJ+jP5/HydN0cdx8Hp6WnwTl+GmY6s6fV6mwOMalurzW9svUPUYDAInpf7pml+9w9NpVLpH7mrfvny5fUZ2LL8B/g6X5qxEAq/wYeHsS63bRtPnz71r13XzY9Go6/3AhWHqVTqBBBW1DRNHDen09WBwgrHTF2PBHQcB63AfPQSTF+BQKC2LOudpmknACpXV1dotVrodrvYTvJixClq/gFot9vBLMOFPI8AoXOxlyyypKsfPnyIRqNxJ1mFINxgMPCvXdctBrMLc6kPL2lkBPMy3W5345CO46DdbofDSs00zaNgRSrccTKZfNvZ2fmLiH4BsPPz5098+PABDx482Bikbdt49eoVPn78KKss13V/Hw6H78JtY9Nv4SQSAJTLZVSr1cSbW8dx0Ov1cHp6GswTWgD0uBzh0gxrMF8TgF8rT2jbNgaDwY28ICDe1uFw+MeiviulgIvF4q+pVKqJgDWDsHEWHY/Hc1CerNls1rQsa86liQBDoDUAMQvsUp3MZrP+KmBSawFKqaq66x34dWbW4zL+zDwlIgMiaX4ig+//SoksKFUqlRpEpDPzBYCLyAGIiqZp/pZ0jHvLm8SLiDrMfEhEelwb13Vj762iWx07TdP87rpuLe4+M6/0sWaR5laSdTWZTOxsNpvxVp6gjOFw+Oy2z9/Iwd3bffjnSe+7XNJQdEMbAQy7mpkrSb5sRunWLpaaTCbfcrnclJn/Ho1GR8t7rKZ/AacjxLFPJTdmAAAAAElFTkSuQmCC";
function initMap(){map||(map=new google.maps.Map(document.getElementById("map-art"),{mapTypeId:google.maps.MapTypeId.ROADMAP,zoom:7}))}function clearMarkers(){for(var a=0;a<markers.length;a++)markers[a].setMap(null);markers=[]}
function showList(a,c){if(a){initMap();var b=$$("#list");b.html("");bounds=new google.maps.LatLngBounds;clearMarkers();var d=a.length;if(0==d)b.html("<li class='error'><div class='icon warning'></div><strong>Ning\u00fan resultado.<br>Prueba aumentando el radio de b\u00fasqueda.</strong></li>");else{var f;f="<strong>Se han encontrado "+d+" puntos de venta de "+(FUEL_OPTIONS[gasole.type].name+" cerca de "+theLocation.name());f+=", con un precio medio de "+gasole.stats.mu.toFixed(3)+" \u20ac/l</strong>";
var g="<div class='right price sort on'>\u20ac/l</div>";c&&(g+="<div class='right dist sort'>km.</div>");b.html("<li class='title'>"+f+"</li><li><strong>Ordena los resultados:</strong>"+g+"</li>");for(g=0;g<d;g++){var e=a[g];f="<strong>"+e.l+"</strong>";var h="<small>"+e.a+"</small>",l="<div class='right price'>"+e.p.toFixed(3)+"</div>",m=c?"<div class='right dist'>"+e.d.toFixed(1)+"</div>":"",n=document.createElement("li");n.id="s-"+g;$$(n).html(f+l+m+h).tap(function(){showDetail(parseInt(this.id.split("-")[1]))});
b.append(n);e.g&&(f=new google.maps.LatLng(e.g[0],e.g[1]),bounds.extend(f),marker=new google.maps.Marker({position:f,map:map,icon:{path:google.maps.SymbolPath.CIRCLE,strokeOpacity:1,strokeWeight:1,fillOpacity:0.8,scale:6,strokeColor:"fff",fillColor:gasole.color(e.p)}}),google.maps.event.addListener(marker,"click",function(){showDetail(markers.indexOf(this))}),markers.push(marker))}b.append("<li><strong>Fin de los resultados</strong></li>")}Lungo.Router.article("results-sec","list-art")}}
function searchResults(){var a=$$("#search-input").val();a&&a!=theLocation.name()?(theLocation.clear(),(new google.maps.Geocoder).geocode({address:a,region:"es"},function(a,b){if(b==google.maps.GeocoderStatus.OK){for(var d=0;d<a.length;d++){var f=a[d].formatted_address;f.match(/Espa\u00f1a$/)&&theLocation.add(f,[a[d].geometry.location.lat(),a[d].geometry.location.lng()])}d=theLocation.length();if(1<d){for(var f="<h1>Encontrados "+d+" lugares:</h1>",g="",e=0;e<d;e++)g+="<li class='result icon pushpin' data-loc='"+
e+"'>"+theLocation.get(e).name+"</li>";Lungo.Notification.html(f+"<ul>"+g+"</ul>","Cancelar");$$(".result").tap(function(){Lungo.Notification.hide();theLocation.select(parseInt(this.getAttribute("data-loc")));$$("#search-input").val(theLocation.name());searchResults()})}else $$("#search-input").val(theLocation.name()),searchResults()}})):showList(gasole.nearDataArray(theLocation,"p"))}
function searchRoute(){initMap();directionsRender||(directionsRender=new google.maps.DirectionsRenderer({draggable:!0}));directionsRender.setMap(map);var a={origin:$$("#originInput").val(),destination:$$("#destinyInput").val(),travelMode:google.maps.TravelMode.DRIVING,unitSystem:google.maps.UnitSystem.METRIC,avoidHighways:!1,avoidTolls:!0};(new google.maps.DirectionsService).route(a,function(a,b){console.log(a);console.log(b);if(b==google.maps.DirectionsStatus.OK){directionsRender.setDirections(a);
var d=gasole.routeData(a.routes[0].overview_path);showList(d);console.log(d)}})}
function initControl(a){var c=a.date,b=(new Date).toLocaleDateString()==c.toLocaleDateString()?"hoy":"el "+c.getDate()+" de "+MONTHS[c.getMonth()];$$("#info").text("Precios actualizados "+b+" a las "+c.toLocaleTimeString().split(":").splice(0,2).join(":"));Lungo.dom("#map-art").on("load",function(){google.maps.event.trigger(map,"resize");bounds&&map.fitBounds(bounds)});$$(".type").tap(function(){click.play();a.type=this.getAttribute("data-type");$$(".type").removeClass("sel");this.className+=" sel";
$$("#typename").text(FUEL_OPTIONS[a.type].name)});$$(".d").tap(function(){click.play();theLocation.radius=parseInt(this.getAttribute("data-d"));$$(".d").removeClass("sel");this.className+=" sel";$$("#dist").text(theLocation.radius)});$$(".p").tap(function(){var b=a.provinceDataArray($$(this).text());console.log(b);showList(b)});$$("#search-button").tap(searchResults);$$(".locate").tap(function(){var a=$$("#"+this.id+"Input"),b=$$("#"+this.id+"Div"),c=$$(this),e=null;"location"==this.id?e=theLocation:
"origin"==this.id?e=theOrigin:"destiny"==this.id&&(e=theDestiny);if(b.hasClass("current"))c.removeClass("found"),a.val("").removeAttr("readonly"),e.clear(),b.removeClass("current");else{c.addClass("spinner");a.val("Obteniendo posici\u00f3n");var h=setInterval(function(){a.val(a.val()+".")},100);navigator.geolocation.getCurrentPosition(function(l){clearInterval(h);c.removeClass("spinner").addClass("found");b.addClass("current");a.val("Mi posici\u00f3n actual").attr("readonly",!0);e.clear();e.add(a.val(),
[l.coords.latitude,l.coords.longitude])},function(b){clearInterval(h);c.removeClass("spinner");Lungo.Notification.show("No se puede obtener tu posici\u00f3n","warning",3);a.val("")},{timeout:5E3})}});$$(".sort").tap(function(){showList(a.nearDataArray(theLocation,$$(this).hasClass("price")?"p":"d"));$$(".sort").removeClass("on");this.className+=" on"});$$("#route-button").tap(searchRoute)}
function showDetail(a){map.panTo(markers[a].position);map.setZoom(15);Lungo.Router.article("results-sec","map-art");markerDetail?(markerDetail.setPosition(markers[a].position),markerDetail.setAnimation(google.maps.Animation.BOUNCE)):markerDetail=new google.maps.Marker({map:map,position:markers[a].position,animation:google.maps.Animation.BOUNCE,icon:pump_marker})}
window.addEventListener("load",function(){Lungo.init({name:"GasOl\u00e9"});Lungo.Notification.show("<div class='icon refresh spinner'></div>Actualizando Datos\u2026");gasole=new Gasole(function(){console.log("callback");Lungo.Notification.hide();initControl(this)});click=new Sound("click")});var gasole=null,map=null,directionsRender=null,markerDetail=null,theLocation=new SearchLocations,theOrigin=new SearchLocations,theDestiny=new SearchLocations,bounds=null,markers=[];var Lat2Km=111.03461,Km2Lat=0.009006,Lon2Km=85.39383,Km2Lon=0.01171,LL2Km=98.2,Km2LL=0.010183,FUEL_OPTIONS={1:{"short":"G95",name:"Gasolina 95"},3:{"short":"G98",name:"Gasolina 98"},4:{"short":"GOA",name:"Gas\u00f3leo Automoci\u00f3n"},5:{"short":"NGO",name:"Nuevo Gas\u00f3leo A"},6:{"short":"GOB",name:"Gas\u00f3leo B"},7:{"short":"GOC",name:"Gas\u00f3leo C"},8:{"short":"BIOD",name:"Biodi\u00e9sel"}},CHART_OPTIONS=[{id:"G98",color:"#339933",name:"Gasolina 98"},{id:"G95",color:"#006633",name:"Gasolina 95"},
{id:"NGO",color:"#aaa",name:"Nuevo Gas\u00f3leo A"},{id:"BIOD",color:"#f1aa41",name:"Biodi\u00e9sel"},{id:"GOA",color:"#000",name:"Gas\u00f3leo A"},{id:"GOC",color:"#FF3300",name:"Gas\u00f3leo C"},{id:"GOB",color:"#CC3333",name:"Gas\u00f3leo B"}],PROVS={"\u00c1lava":"01",Albacete:"02",Alicante:"03","Almer\u00eda":"04",Asturias:"33","\u00c1vila":"05",Badajoz:"06","Balears (Illes)":"07",Barcelona:"08",Burgos:"09","C\u00e1ceres":"10","C\u00e1diz":"11",Cantabria:"39","Castell\u00f3n / Castell\u00f3":"12",
Ceuta:"51","Ciudad Real":"13","C\u00f3rdoba":"14","Coru\u00f1a (A)":"15",Cuenca:"16",Girona:"17",Granada:"18",Guadalajara:"19","Guip\u00fazcoa":"20",Huelva:"21",Huesca:"22","Ja\u00e9n":"23","Le\u00f3n":"24",Lleida:"25",Lugo:"27",Madrid:"28","M\u00e1laga":"29",Melilla:"52",Murcia:"30",Navarra:"31",Ourense:"32",Palencia:"34","Palmas (Las)":"35",Pontevedra:"36","Rioja (La)":"26",Salamanca:"37","Santa Cruz De Tenerife":"38",Segovia:"40",Sevilla:"41",Soria:"42",Tarragona:"43",Teruel:"44",Toledo:"45","Valencia / Val\u00e8ncia":"46",
Valladolid:"47",Vizcaya:"48",Zamora:"49",Zaragoza:"50"},MONTHS="Enero Febrero Marzo Abril Mayo Junio Julio Agosto Septiembre Octubre Noviembre Diciembre".split(" "),COLORS={stroke:"#333",min:"#36AE34",max:"#f00",mu:"#3399CC"},info=null,LS_EXPIRE=36E5,APIS={gasolineras:"api",resultados:"geo",ficha:"api"};function getProvName(a){for(k in PROVS)if(PROVS[k]==a)return k}function clearHtmlTags(a){return a.replace(/(<([^>]+)>)/ig,"")}
function toTitle(a){return a.replace(" [N]","").replace(/^CARRETERA ?|^CR\.? ?/i,"CTRA. ").replace(/(CTRA. )+/i,"CTRA. ").replace(/^AVENIDA ?|^AV. ?/i,"AVDA. ").replace(/^POLIGONO INDUSTRIAL ?|POLIGONO ?|P\.I\. ?/i,"POL. IND. ").replace(/^CALLE |^CL\.? ?|C\/ ?/i,"C/ ").replace(/^RONDA |^RD /i,"RDA. ").replace(/^AUTOPISTA (AUTOPISTA ?)?/i,"AU. ").replace(/^PLAZA ?/i,"PL. ").replace(/^PASEO (PASEO ?)?/i,"P\u00ba ").replace(/^TRAVESS?[I\u00cd]A /i,"TRAV. ").replace(/^V[i\u00ed]A (V[I\u00cd]A )?/i,"V\u00cdA ").replace(/\B[^\d- ]+[ $]/g,
function(a){return a.toLowerCase()}).replace(/\b[NAE]-.+\b/,function(a){return a.toUpperCase()}).replace(/\[D\]$/,"(m.d.)").replace(/\[I\]$/,"(m.i.)").replace(/ \[N\]$/,"")}
function getLogo(a){return a&&(a=a.replace(/camspa/i,"campsa"),logo=a.match(/\b(abycer|agla|alcampo|andamur|a\.?n\.? energeticos|avia|bonarea|b\.?p\.?|buquerin|campsa|carmoned|carrefour|cepsa|empresoil|eroski|esclatoil|galp|gasolben|iberdoex|leclerc|makro|meroil|norpetrol|petrem|petrocat|petromiralles|petronor|repostar|repsol|saras|shell|simply|staroil|tamoil|valcarce)\b/i))?logo[0].replace(/\./g,"").replace(/ /g,"_").toLowerCase():null}
function decodeName(a){return decodeURI(a).replace(/_/g," ").replace(/\|/g,"/")}function prettyName(a){a.match("/")&&(a=a.split("/")[1]);a.match(/\)$/)&&(a=a.match(/\(.+\)$/g)[0].replace("(","").replace(")"," ")+a.split(" (")[0]);return a}function decodeArray(a){for(var c=0;c<a.length;c++)a[c]=decodeName(a[c]);return a}function encodeName(a){return a.replace(/\//g,"|").replace(/ /g,"_")}function checkLocalStorage(){try{return"localStorage"in window&&null!==window.localStorage}catch(a){return!1}}
function getApiData(a){var c=window.location.pathname.split("/").slice(1).join("*");if(checkLocalStorage()&&localStorage.hasOwnProperty(c))if(localData=JSON.parse(localStorage[c]),(new Date).getTime()-localData.ts>LS_EXPIRE)localStorage.removeItem(c);else{a(localData.data);return}var b=new XMLHttpRequest;b.onload=function(b){b=JSON.parse(this.responseText);checkLocalStorage()&&localStorage.setItem(c,JSON.stringify({ts:(new Date).getTime(),data:b}));a(b)};var d=window.location.pathname.split("/")[1];
b.open("GET",document.URL.replace(d,APIS[d]));b.send()}function distance(a,c,b){var d=Math.abs(a[0]-c[0])*Lat2Km;return d<b&&(a=Math.abs(a[1]-c[1])*Lon2Km,a<b&&(d=Math.sqrt(Math.pow(d,2)+Math.pow(a,2)),d<b))?d:null}function distanceOrto(a,c,b){if(c.lng()==b.lng())return Math.abs(a.lat()-c.lat());b=(b.lat()-c.lat())/(b.lng()-c.lng());c=c.lat()-b*c.lng();return Math.abs(b*a.lng()-a.lat()+c)/Math.sqrt(b*b+1)}
function properRDP(a,c){"undefined"==typeof c&&(c=1*Km2LL);var b=a[0],d=a[a.length-1];if(3>a.length)return a;for(var f=-1,g=0,e=1;e<a.length-1;e++){var h=distanceOrto(a[e],b,d);h>g&&(g=h,f=e)}return g>c?(b=a.slice(0,f+1),f=a.slice(f),b=properRDP(b,c),f=properRDP(f,c),b.slice(0,b.length-1).concat(f)):[b,d]}
function SearchLocations(){this.locs=[];this.radius=2;this.length=function(){return this.locs.length};this.add=function(a,c){this.locs.push({name:a,latlng:c})};this.latlng=function(){return 1==this.length()?this.locs[0].latlng:null};this.name=function(){return 1==this.length()?this.locs[0].name:null};this.get=function(a){return this.locs[a]};this.select=function(a){this.locs=[this.locs[a]]};this.clear=function(){this.locs=[]}}
function Stats(){this.n=0;this.max=this.min=this.mu=this.range=null;this.smin=[];this.smax=[];this.g=null;this.range=function(){null==this.range&&(this.range=this.max-this.min);return this.range};this.add=function(a,c,b){this.mu?(a>this.max?(this.max=a,this.smax=[c]):a==this.max?this.smax.push(c):a<this.min?(this.min=a,this.smin=[c]):a==this.min&&this.smin.push(c),this.mu=(this.mu*this.n+a)/++this.n):(this.max=this.min=this.mu=a,this.smin=[c],this.smax=[c],this.n=1);b&&(this.g?(b[0]<this.g[0]?this.g[0]=
b[0]:b[0]>this.g[1]&&(this.g[1]=b[0]),b[1]<this.g[2]?this.g[2]=b[1]:b[1]>this.g[3]&&(this.g[3]=b[1])):this.g=[b[0],b[0],b[1],b[1]])}}function GasoleStats(a){var c=this.stats={};this.provinces={};for(var b in a){var d=a[b],f=this.provinces[b]={},g;for(g in d){var e=d[g],h;for(h in e){datas=e[h];var l=datas.g,m;for(m in datas.o)f.hasOwnProperty(m)||(f[m]=new Stats),c.hasOwnProperty(m)||(c[m]=new Stats),f[m].add(datas.o[m],[b,g,h],l),c[m].add(datas.o[m],[b,g,h],l)}}}}
function Gasole(a){this.color=function(a){var b=this.stats.range();if(0!=b){a=(a-this.stats.min)/b;if(0.33>a)return COLORS.min;if(0.66<a)return COLORS.max}return COLORS.mu};this.init=function(a,b,d){this.info=a;this.date=b;this.stats=d?d:new GasoleStats(this.info)};this.provinceDataArray=function(a){this.stats=new Stats;var b=this.type;result=[];a=this.info[a];for(var d in a){var f=a[d],g;for(g in f){var e=f[g],h=e.o[b];h&&(result.push({a:g,r:e.r,g:e.g,p:h,t:d,l:e.l,d:null}),this.stats.add(h))}}return result};
this.nearData=function(a){var b=a.latlng();if(b){a=a.radius;var d={},f;for(f in this.info){var g=this.info[f];d[f]={};for(var e in g){var h=g[e];d[f][e]={};for(var l in h){var m=h[l],n=m.g;n&&distance(n,b,a)&&(d[f][e][l]=m)}Object.keys(d[f][e]).length||delete d[f][e]}Object.keys(d[f]).length||delete d[f]}return d}};this.nearDataArray=function(a,b){var d=a.latlng();if(d){var f=a.radius;this.stats=new Stats;var g=[],e;for(e in this.info){var h=this.info[e],l;for(l in h){var m=h[l],n;for(n in m){var r=
m[n];if(r.o.hasOwnProperty(this.type)){var p=r.g;if(p){var s=distance(p,d,f);if(s){var t=r.o[this.type];g.push({a:n,r:r.r,g:p,p:t,t:l,l:r.l,d:s});this.stats.add(t)}}}}}}return b?g.sort(function(a,c){return a[b]<c[b]?-1:1}):g}};this.routeData=function(a){var b=[],d=this.type;this.stats=new Stats;var f=Km2LL,g;for(g in this.info){var e=this.info[g],h;for(h in e){var l=e[h],m;for(m in l){var n=l[m],r=n.o[d];if(r){var p=n.g;if(p){for(var s=!1,t=new google.maps.LatLng(p[0],p[1]),q=0;q<a.length-1;q++)if(distance(p,
[a[q].lat(),a[q].lng()],f))s=!0;else if(distance(p,[a[q+1].lat(),a[q+1].lng()],f))s=!0;else if((new google.maps.LatLngBounds(a[q],a[q+1])).contains(t)){var u=distanceOrto(t,a[q],a[q+1]);u<f&&(s=!0)}s&&(b.push({a:m,r:n.r,g:p,p:r,t:h,l:n.l,d:u}),this.stats.add(r))}}}}}return b};this.callback=a;this.date=this.info=this.stats=null;this.type="1";a=localStorage.gasole;!a||(new Date).getTime()-parseInt(JSON.parse(a).ts)>LS_EXPIRE?(a=new XMLHttpRequest,a.gasole=this,a.onload=function(){var a=new Date;this.gasole.init(JSON.parse(this.responseText),
a);localStorage.setItem("gasole",'{"ts": '+a.getTime()+',"data": '+this.responseText+',"stats": '+JSON.stringify(this.gasole.stats)+"}");this.gasole.callback&&this.gasole.callback()},a.open("GET","/api/All"),a.send()):(a=JSON.parse(a),this.init(a.data,new Date(a.ts),a.stats),this.callback&&this.callback())};
