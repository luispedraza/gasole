function searchLocation(a){var b="",c="",d="";"object"==typeof a?(b=a.geometry.location.lat(),c=a.geometry.location.lng(),d=encodeURI(a.formatted_address)):"string"==typeof a&&(c=a.split("##"),d=c[0],b=c[1],c=c[2]);a=document.getElementById("search-d").getAttribute("value");window.location="/resultados/"+d+"/"+b+"/"+c+"/"+a}
function showLoader(){document.getElementById("results-title").textContent="Buscando\u2026";var a=document.getElementById("results-list");a.innerHTML="";var b=new Image;b.src="/img/search-loader.gif";a.appendChild(b)}function initGeoloc(){var a=document.getElementById("current-loc");navigator.geolocation?a.addEventListener("click",loadCurrentPosition):a.style.display="none"}
function showResult(a,b){document.getElementById("results").style.display="block";var c=document.getElementById("results-list");c.innerHTML="";if(b==google.maps.GeocoderStatus.OK){for(var d=0,f=0,e=0;e<a.length;e++){var g=a[e].formatted_address;if(g.match(/Espa\u00f1a$/)){console.log(typeof a[e]);d++;var f=e,h=document.createElement("li"),l=document.createElement("a");h.appendChild(l);l.textContent=g;l.href="#";l.setAttribute("loc",[a[e].formatted_address,a[e].geometry.location.lat(),a[e].geometry.location.lng()].join("##"));
l.addEventListener("click",function(){searchLocation(this.getAttribute("loc"))});c.appendChild(h)}}if(1==d){searchLocation(a[f]);return}if(1<d){document.getElementById("results-title").textContent="Encontrados "+d+" lugares:";return}}c.innerHTML="<li>No se ha podido encontrar el lugar. Int\u00e9ntalo de nuevo</li>"}
function loadCurrentPosition(){showLoader();navigator.geolocation.getCurrentPosition(function(a){var b=new google.maps.Geocoder;a=new google.maps.LatLng(a.coords.latitude,a.coords.longitude);b.geocode({latLng:a},showResult)},function(a){switch(a.code){case a.PERMISSION_DENIED:console.log("User denied the request for Geolocation.");break;case a.POSITION_UNAVAILABLE:console.log("Location information is unavailable.");break;case a.TIMEOUT:console.log("The request to get user location timed out.");break;
case a.UNKNOWN_ERROR:console.log("An unknown error occurred.")}})}function geoCode(){showLoader();var a=document.getElementById("address").value;(new google.maps.Geocoder).geocode({address:a,region:"es"},showResult)}
function mySlider(a){function b(a){var b=a.getElementsByClassName("val")[0],e=parseFloat(a.getAttribute("newval")),c=parseFloat(a.getAttribute("max")),h=parseFloat(a.getAttribute("min"));b.style.width=(e-h)*a.clientWidth/(c-h)-5+"px";b.textContent="Radio: "+e.toFixed(1)+" km.";a.setAttribute("value",e)}a.style.position="relative";var c=document.createElement("div");c.style.position="absolute";c.style.left="0";c.style.top="0";c.textContent="Radio: "+a.getAttribute("value")+" km.";c.className="val";
a.appendChild(c);c=document.createElement("div");c.style.position="absolute";c.style.left="0";c.style.top="0";c.className="new-val";c.style.display="none";a.appendChild(c);a.setAttribute("newval",a.getAttribute("value"));b(a);a.addEventListener("mousemove",function(a){var b=this.getElementsByClassName("new-val")[0];b.style.display="block";var c=a.clientX-this.getBoundingClientRect().left;b.style.width=c-5+"px";a=parseFloat(this.getAttribute("max"));var g=parseFloat(this.getAttribute("min")),h=parseFloat(this.getAttribute("step")),
c=g+c*(a-g)/this.clientWidth,c=parseInt(c/h)*h;c<g&&(c=g);c>a&&(c=a);b.textContent="Radio: "+c.toFixed(1)+" km.";this.setAttribute("newval",c)});a.addEventListener("click",function(a){this.getElementsByClassName("new-val")[0].style.display="none";b(this)});a.addEventListener("mouseout",function(a){this.getElementsByClassName("new-val")[0].style.display="none"})}
window.addEventListener("load",function(){for(var a=document.getElementsByClassName("my-slider"),b=0;b<a.length;b++)mySlider(a[b]);if(a=document.getElementById("map")){a=a.getElementsByClassName("prov");for(b=0;b<a.length;b++)a[b].addEventListener("click",function(){})}initGeoloc()});function distance(a,b,c){var d=111.03461*Math.abs(a[0]-b[0]);return d<c&&(a=85.39383*Math.abs(a[1]-b[1]),a<c)?Math.sqrt(Math.pow(d,2)+Math.pow(a,2)):null}function Sound(a){this.html5audio=document.getElementById(a);this.play=function(){this.html5audio&&this.html5audio.play()}}var click=null,loader="<img src='data:image/gif;base64,R0lGODlhEAAQAPQAAMzMzP///83NzfLy8uTk5Pz8/Pb29tPT09zc3Pn5+ebm5unp6dHR0eDg4NfX1+/v7+3t7QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAAFUCAgjmRpnqUwFGwhKoRgqq2YFMaRGjWA8AbZiIBbjQQ8AmmFUJEQhQGJhaKOrCksgEla+KIkYvC6SJKQOISoNSYdeIk1ayA8ExTyeR3F749CACH5BAkKAAAALAAAAAAQABAAAAVoICCKR9KMaCoaxeCoqEAkRX3AwMHWxQIIjJSAZWgUEgzBwCBAEQpMwIDwY1FHgwJCtOW2UDWYIDyqNVVkUbYr6CK+o2eUMKgWrqKhj0FrEM8jQQALPFA3MAc8CQSAMA5ZBjgqDQmHIyEAIfkECQoAAAAsAAAAABAAEAAABWAgII4j85Ao2hRIKgrEUBQJLaSHMe8zgQo6Q8sxS7RIhILhBkgumCTZsXkACBC+0cwF2GoLLoFXREDcDlkAojBICRaFLDCOQtQKjmsQSubtDFU/NXcDBHwkaw1cKQ8MiyEAIfkECQoAAAAsAAAAABAAEAAABVIgII5kaZ6AIJQCMRTFQKiDQx4GrBfGa4uCnAEhQuRgPwCBtwK+kCNFgjh6QlFYgGO7baJ2CxIioSDpwqNggWCGDVVGphly3BkOpXDrKfNm/4AhACH5BAkKAAAALAAAAAAQABAAAAVgICCOZGmeqEAMRTEQwskYbV0Yx7kYSIzQhtgoBxCKBDQCIOcoLBimRiFhSABYU5gIgW01pLUBYkRItAYAqrlhYiwKjiWAcDMWY8QjsCf4DewiBzQ2N1AmKlgvgCiMjSQhACH5BAkKAAAALAAAAAAQABAAAAVfICCOZGmeqEgUxUAIpkA0AMKyxkEiSZEIsJqhYAg+boUFSTAkiBiNHks3sg1ILAfBiS10gyqCg0UaFBCkwy3RYKiIYMAC+RAxiQgYsJdAjw5DN2gILzEEZgVcKYuMJiEAOwAAAAAAAAAAAA==' /><br>";
function initMap(){var a={mapTypeId:google.maps.MapTypeId.ROADMAP},b=document.getElementById("map-art");map=new google.maps.Map(b,a)}
function Gasole(){this.info=null;this.type="1";this.init=function(a){this.info=a;console.log(this.info)};this.provinceData=function(a){var b=this.type;this.result={};a=this.info[a];for(var c in a){var d=a[c],f;for(f in d){var e=d[f];e.o[b]&&(this.result[f]=e)}}return this.result};this.nearData=function(a,b){"undefined"==typeof b&&(b="p");result=[];var c=this.type,d;for(d in this.info){var f=this.info[d],e;for(e in f){var g=f[e],h;for(h in g){var l=g[h],m=l.o[c];if(m){var n=l.g;if(n){var p=distance(n,
a,searchRadius);p&&result.push({a:h,r:l.r,g:n,p:m,t:e,l:l.l,d:p})}}}}}return result.sort(function(a,c){return a[b]<c[b]?-1:1})}}var searchRadius=2,map=null;gasole=new Gasole;var myLocation=null;function SearchLocations(a){this.name=a;this.locations=[];this.add=function(a,c){this.locations.push({name:a,latlng:c})}}var searchLocations=null,bounds=null;markers=[];function clearMarkers(){for(var a=0;a<markers.length;a++)markers[a].setMap(null);markers=[]}
function showList(a){console.log(a);var b=$$("#list");b.html("");var c={icon:{path:google.maps.SymbolPath.CIRCLE,strokeOpacity:1,strokeWeight:1,fillOpacity:0.8,scale:6,strokeColor:"#0f0"},map:map};bounds=new google.maps.LatLngBounds;clearMarkers();var d=a.length;if(0==d)b.html("<li class='icon warning'> Ning\u00fan resultado. Prueba aumentando el radio de b\u00fasqueda.</li>");else{var f;f="<strong>Se han encontrado "+d+" resultados</strong><div class='right price sort on'>\u20ac/l</div>";f+="<div class='right dist sort'>km.</div>";
b.html("<li>"+f+"</li>");for(var e=0;e<d;e++){var g=a[e];f="<strong>"+g.l+"</strong>";var h="<small>"+g.a+"</small>",l="<div class='right price'>"+g.p.toFixed(3)+"</div>",m="<div class='right dist'>"+g.d.toFixed(1)+"</div>";b.append("<li>"+f+l+m+h+"</li>");f=new google.maps.LatLng(g.g[0],g.g[1]);c.position=f;bounds.extend(f);marker=new google.maps.Marker(c);markers.push(marker)}b.append("<li><strong>Fin de los resultados</strong></li>")}Lungo.Router.article("results-sec","list-art")}
function initControl(){Lungo.dom("#map-art").on("load",function(){google.maps.event.trigger(map,"resize");map.fitBounds(bounds)});$$(".type").tap(function(){click.play();gasole.type=this.getAttribute("data-type");$$(".type").removeClass("sel");this.className+=" sel";$$("#typename").text(FUEL_OPTIONS[gasole.type].name)});$$(".d").tap(function(){click.play();searchRadius=parseInt(this.getAttribute("data-d"));$$(".d").removeClass("sel");this.className+=" sel";$$("#dist").text(searchRadius)});$$(".p").tap(function(){var a=
gasole.provinceData($$(this).text(),$$(".sel")[0].getAttribute("data-type"));showList(a)});$$("#search-button").tap(function(){if(myLocation)showList(gasole.nearData(myLocation.latlng));else{var a=$$("#search-input")[0].value;if(!searchLocations||searchLocations.name!=a)searchLocations=new SearchLocations,(new google.maps.Geocoder).geocode({address:a,region:"es"},function(a,c){if(c==google.maps.GeocoderStatus.OK){for(var d=0,f=document.createElement("ul"),e=0;e<a.length;e++){var g=a[e].formatted_address;
if(g.match(/Espa\u00f1a$/)){searchLocations.add(g,[a[e].geometry.location.lat(),a[e].geometry.location.lng()]);var h=document.createElement("li");h.className="result icon pushpin";h.textContent=g;h.setAttribute("data-loc",d);f.appendChild(h);d++}}1==d?showList(gasole.nearData(searchLocations.locations[0].latlng)):1<d&&(e=document.createElement("div"),e.innerHTML="<h1>Encontrados "+d+" lugares:</h1>",e.appendChild(f),Lungo.Notification.html(e.innerHTML,"Cerrar"),$$(".result").tap(function(){Lungo.Notification.hide();
showList(gasole.nearData(searchLocations.locations[parseInt(this.getAttribute("data-loc"))].latlng))}))}})}});$$("#location").tap(function(){var a=$$("#search-input")[0];myLocation?($$(".locate")[0].style.color="#ccc",a.value="",a.readOnly=!1,$$("#search")[0].className="",myLocation=null):(Lungo.Notification.show(loader+"Buscando el lugar\u2026"),navigator.geolocation.getCurrentPosition(function(b){Lungo.Notification.hide();console.log("hola");Lungo.Notification.hide();console.log(b);$$(".locate")[0].style.color=
"#fff";a.value="Mi posici\u00f3n actual";a.readOnly=!0;$$("#search")[0].className="current";myLocation={latlng:[b.coords.latitude,b.coords.longitude],accuracy:b.coords.accuracy,name:"mi posici\u00f3n actual"}},function(a){Lungo.Notification.show("No se puede obtener tu posici\u00f3n","warning",3)},{timeout:1E4}))})}
window.addEventListener("load",function(){Lungo.Notification.show();Lungo.init({name:"GasOl\u00e9"});click=new Sound("click");var a=localStorage.gasole;a?gasole.init(JSON.parse(a)):(a=new XMLHttpRequest,a.onload=function(){gasole.init(JSON.parse(this.responseText));localStorage.setItem("gasole",this.responseText)},a.open("GET","/api/All"),a.send());initMap();initControl();Lungo.Notification.hide()});var FUEL_OPTIONS={1:{"short":"G95",name:"Gasolina 95"},3:{"short":"G98",name:"Gasolina 98"},4:{"short":"GOA",name:"Gas\u00f3leo Automoci\u00f3n"},5:{"short":"NGO",name:"Nuevo Gas\u00f3leo A"},6:{"short":"GOB",name:"Gas\u00f3leo B"},7:{"short":"GOC",name:"Gas\u00f3leo C"},8:{"short":"BIOD",name:"Biodi\u00e9sel"}},CHART_OPTIONS=[{id:"G98",color:"#339933",name:"Gasolina 98"},{id:"G95",color:"#006633",name:"Gasolina 95"},{id:"NGO",color:"#aaa",name:"Nuevo Gas\u00f3leo A"},{id:"BIOD",color:"#f1aa41",name:"Biodi\u00e9sel"},
{id:"GOA",color:"#000",name:"Gas\u00f3leo A"},{id:"GOC",color:"#FF3300",name:"Gas\u00f3leo C"},{id:"GOB",color:"#CC3333",name:"Gas\u00f3leo B"}],PROVS={"\u00c1lava":"01",Albacete:"02",Alicante:"03","Almer\u00eda":"04",Asturias:"33","\u00c1vila":"05",Badajoz:"06","Balears (Illes)":"07",Barcelona:"08",Burgos:"09","C\u00e1ceres":"10","C\u00e1diz":"11",Cantabria:"39","Castell\u00f3n / Castell\u00f3":"12",Ceuta:"51","Ciudad Real":"13","C\u00f3rdoba":"14","Coru\u00f1a (A)":"15",Cuenca:"16",Girona:"17",
Granada:"18",Guadalajara:"19","Guip\u00fazcoa":"20",Huelva:"21",Huesca:"22","Ja\u00e9n":"23","Le\u00f3n":"24",Lleida:"25",Lugo:"27",Madrid:"28","M\u00e1laga":"29",Melilla:"52",Murcia:"30",Navarra:"31",Ourense:"32",Palencia:"34","Palmas (Las)":"35",Pontevedra:"36","Rioja (La)":"26",Salamanca:"37","Santa Cruz De Tenerife":"38",Segovia:"40",Sevilla:"41",Soria:"42",Tarragona:"43",Teruel:"44",Toledo:"45","Valencia / Val\u00e8ncia":"46",Valladolid:"47",Vizcaya:"48",Zamora:"49",Zaragoza:"50"},info=null,
LS_EXPIRE=36E5,APIS={gasolineras:"api",resultados:"geo",ficha:"api"};function getProvName(a){for(k in PROVS)if(PROVS[k]==a)return k}function clearHtmlTags(a){return a.replace(/(<([^>]+)>)/ig,"")}
function toTitle(a){return a.replace(" [N]","").replace(/^CARRETERA ?|^CR\.? ?/i,"CTRA. ").replace(/(CTRA. )+/i,"CTRA. ").replace(/^AVENIDA ?|^AV. ?/i,"AVDA. ").replace(/^POLIGONO INDUSTRIAL ?|POLIGONO ?|P\.I\. ?/i,"POL. IND. ").replace(/^CALLE |^CL\.? ?|C\/ ?/i,"C/ ").replace(/^RONDA |^RD /i,"RDA. ").replace(/^AUTOPISTA (AUTOPISTA ?)?/i,"AU. ").replace(/^PLAZA ?/i,"PL. ").replace(/^PASEO (PASEO ?)?/i,"P\u00ba ").replace(/^TRAVESS?[I\u00cd]A /i,"TRAV. ").replace(/^V[i\u00ed]A (V[I\u00cd]A )?/i,"V\u00cdA ").replace(/\B[^\d- ]+[ $]/g,
function(a){return a.toLowerCase()}).replace(/\b[NAE]-.+\b/,function(a){return a.toUpperCase()}).replace(/\[D\]$/,"(m.d.)").replace(/\[I\]$/,"(m.i.)").replace(/ \[N\]$/,"")}
function getLogo(a){return a&&(a=a.replace(/camspa/i,"campsa"),logo=a.match(/\b(abycer|agla|alcampo|andamur|a\.?n\.? energeticos|avia|bonarea|b\.?p\.?|buquerin|campsa|carmoned|carrefour|cepsa|empresoil|eroski|esclatoil|galp|gasolben|iberdoex|leclerc|makro|meroil|norpetrol|petrem|petrocat|petromiralles|petronor|repostar|repsol|saras|shell|simply|staroil|tamoil|valcarce)\b/i))?logo[0].replace(/\./g,"").replace(/ /g,"_").toLowerCase():null}
function decodeName(a){return decodeURI(a).replace(/_/g," ").replace(/\|/g,"/")}function prettyName(a){a.match("/")&&(a=a.split("/")[1]);a.match(/\)$/)&&(a=a.match(/\(.+\)$/g)[0].replace("(","").replace(")"," ")+a.split(" (")[0]);return a}function decodeArray(a){for(var b=0;b<a.length;b++)a[b]=decodeName(a[b]);return a}function encodeName(a){return a.replace(/\//g,"|").replace(/ /g,"_")}function checkLocalStorage(){try{return"localStorage"in window&&null!==window.localStorage}catch(a){return!1}}
function getApiData(a,b,c){var d=new XMLHttpRequest;d.onload=function(a){info=JSON.parse(a.target.responseText);b&&(localStorage.setItem(b,JSON.stringify(info)),localStorage.timestamp||localStorage.setItem("timestamp",(new Date).getTime()));c(info)};d.open("GET",a);d.send()}function getKey(){return window.location.pathname.split("/").slice(1).join("***")}
function getData(a){var b=null,c=null,d=window.location.pathname.split("/"),f=d[1];if(checkLocalStorage()){(b=localStorage.timestamp)&&(new Date).getTime()-parseInt(b)>LS_EXPIRE&&localStorage.clear();var b=getKey(),e=localStorage[b];if(e)c=JSON.parse(e);else if("gasolineras"==f&&d[3]&&(e=localStorage[d.slice(1,3).join("***")])){var g=decodeName(d[2]),d=decodeName(d[3]),c={_data:{}};c._data[g]={};c._data[g][d]=JSON.parse(e)._data[g][d]}}c?a(c):getApiData(document.URL.replace(f,APIS[f]),b,a)};
