function searchLocation(a){var b="",c="",d="";"object"==typeof a?(b=a.geometry.location.lat(),c=a.geometry.location.lng(),d=encodeURI(a.formatted_address)):"string"==typeof a&&(c=a.split("##"),d=c[0],b=c[1],c=c[2]);a=document.getElementById("search-d").getAttribute("value");window.location="/resultados/"+d+"/"+b+"/"+c+"/"+a}
function showLoader(){document.getElementById("results-title").textContent="Buscando\u2026";var a=document.getElementById("results-list");a.innerHTML="";var b=new Image;b.src="/img/search-loader.gif";a.appendChild(b)}function initGeoloc(){var a=document.getElementById("current-loc");navigator.geolocation?a.addEventListener("click",loadCurrentPosition):a.style.display="none"}
function showResult(a,b){document.getElementById("results").style.display="block";var c=document.getElementById("results-list");c.innerHTML="";if(b==google.maps.GeocoderStatus.OK){for(var d=0,h=0,f=0;f<a.length;f++){var e=a[f].formatted_address;if(e.match(/Espa\u00f1a$/)){console.log(typeof a[f]);d++;var h=f,g=document.createElement("li"),l=document.createElement("a");g.appendChild(l);l.textContent=e;l.href="#";l.setAttribute("loc",[a[f].formatted_address,a[f].geometry.location.lat(),a[f].geometry.location.lng()].join("##"));
l.addEventListener("click",function(){searchLocation(this.getAttribute("loc"))});c.appendChild(g)}}if(1==d){searchLocation(a[h]);return}if(1<d){document.getElementById("results-title").textContent="Encontrados "+d+" lugares:";return}}c.innerHTML="<li>No se ha podido encontrar el lugar. Int\u00e9ntalo de nuevo</li>"}
function loadCurrentPosition(){showLoader();navigator.geolocation.getCurrentPosition(function(a){var b=new google.maps.Geocoder;a=new google.maps.LatLng(a.coords.latitude,a.coords.longitude);b.geocode({latLng:a},showResult)},function(a){switch(a.code){case a.PERMISSION_DENIED:console.log("User denied the request for Geolocation.");break;case a.POSITION_UNAVAILABLE:console.log("Location information is unavailable.");break;case a.TIMEOUT:console.log("The request to get user location timed out.");break;
case a.UNKNOWN_ERROR:console.log("An unknown error occurred.")}})}function geoCode(){showLoader();var a=document.getElementById("address").value;(new google.maps.Geocoder).geocode({address:a,region:"es"},showResult)}
function mySlider(a){function b(a){var c=a.getElementsByClassName("val")[0],b=parseFloat(a.getAttribute("newval")),e=parseFloat(a.getAttribute("max")),g=parseFloat(a.getAttribute("min"));c.style.width=(b-g)*a.clientWidth/(e-g)-5+"px";c.textContent="Radio: "+b.toFixed(1)+" km.";a.setAttribute("value",b)}a.style.position="relative";var c=document.createElement("div");c.style.position="absolute";c.style.left="0";c.style.top="0";c.textContent="Radio: "+a.getAttribute("value")+" km.";c.className="val";
a.appendChild(c);c=document.createElement("div");c.style.position="absolute";c.style.left="0";c.style.top="0";c.className="new-val";c.style.display="none";a.appendChild(c);a.setAttribute("newval",a.getAttribute("value"));b(a);a.addEventListener("mousemove",function(a){var c=this.getElementsByClassName("new-val")[0];c.style.display="block";var b=a.clientX-this.getBoundingClientRect().left;c.style.width=b-5+"px";a=parseFloat(this.getAttribute("max"));var e=parseFloat(this.getAttribute("min")),g=parseFloat(this.getAttribute("step")),
b=e+b*(a-e)/this.clientWidth,b=parseInt(b/g)*g;b<e&&(b=e);b>a&&(b=a);c.textContent="Radio: "+b.toFixed(1)+" km.";this.setAttribute("newval",b)});a.addEventListener("click",function(a){this.getElementsByClassName("new-val")[0].style.display="none";b(this)});a.addEventListener("mouseout",function(a){this.getElementsByClassName("new-val")[0].style.display="none"})}
window.addEventListener("load",function(){for(var a=document.getElementsByClassName("my-slider"),b=0;b<a.length;b++)mySlider(a[b]);if(a=document.getElementById("map")){a=a.getElementsByClassName("prov");for(b=0;b<a.length;b++)a[b].addEventListener("click",function(){})}initGeoloc()});function dist(a,b){var c=2/85.39383;if(Math.abs(a[0]-b[0])<2/111.03461&&Math.abs(a[1]-b[1])<c)return console.log(Math.abs(a[0]-b[0]),Math.abs(a[1]-b[1])),!0}
function Gasole(){this.info=this.loc=null;this.init=function(a){this.info=a;console.log(this.info)};this.provinceData=function(a,b){var c=[],d=this.info[a],h;for(h in d){var f=d[h],e;for(e in f){var g=f[e],l=g.o[b];l&&c.push([e,g.l,g.g,l])}}console.log(c);return c};this.nearData=function(a){var b=[],c;for(c in this.info){var d=this.info[c],h;for(h in d){var f=d[h],e;for(e in f){var g=f[e],l=g.g,m=g.o[a];m&&(l&&dist(l,this.loc))&&(console.log(m,l,dist(l,this.loc)),b.push([e,g.l,g.g,m]))}}}return b}}
gasole=new Gasole;function showList(a){var b=$$("#list");b.html("");for(var c=0;c<a.length;c++){var d=a[c];b.append("<li>"+("<strong>"+d[0]+"</strong>")+("<small>"+d[1]+"</small>")+("<div class='right'>"+d[3]+"</div>")+"</li>")}Lungo.Router.article("main","list-art")}
window.addEventListener("load",function(){Lungo.init({name:"GasOl\u00e9"});var a=localStorage.gasole;a?gasole.init(JSON.parse(a)):(a=new XMLHttpRequest,a.onload=function(){gasole.init(JSON.parse(this.responseText));localStorage.setItem("gasole",this.responseText)},a.open("GET","/api/All"),a.send());$$(".p").tap(function(){var a=gasole.provinceData($$(this).text(),"1");showList(a)});$$("#search-button").tap(function(){var a=gasole.nearData("1");showList(a)});$$("#location").tap(function(){function a(b,
d){console.log(b);if(d==google.maps.GeocoderStatus.OK){var h=b[0];$$("#search-input").val(h.formatted_address);gasole.loc=[h.geometry.location.lat(),h.geometry.location.lng()]}}navigator.geolocation.getCurrentPosition(function(c){var d=new google.maps.Geocoder;c=new google.maps.LatLng(c.coords.latitude,c.coords.longitude);d.geocode({latLng:c},a)},function(a){switch(a.code){case a.PERMISSION_DENIED:console.log("User denied the request for Geolocation.");break;case a.POSITION_UNAVAILABLE:console.log("Location information is unavailable.");
break;case a.TIMEOUT:console.log("The request to get user location timed out.");break;case a.UNKNOWN_ERROR:console.log("An unknown error occurred.")}})})});var FUEL_OPTIONS={1:{"short":"G95",name:"Gasolina 95"},3:{"short":"G98",name:"Gasolina 98"},4:{"short":"GOA",name:"Gas\u00f3leo Automoci\u00f3n"},5:{"short":"NGO",name:"Nuevo Gas\u00f3leo A"},6:{"short":"GOB",name:"Gas\u00f3leo B"},7:{"short":"GOC",name:"Gas\u00f3leo C"},8:{"short":"BIOD",name:"Biodi\u00e9sel"}},CHART_OPTIONS=[{id:"G98",color:"#339933",name:"Gasolina 98"},{id:"G95",color:"#006633",name:"Gasolina 95"},{id:"NGO",color:"#aaa",name:"Nuevo Gas\u00f3leo A"},{id:"BIOD",color:"#f1aa41",name:"Biodi\u00e9sel"},
{id:"GOA",color:"#000",name:"Gas\u00f3leo A"},{id:"GOC",color:"#FF3300",name:"Gas\u00f3leo C"},{id:"GOB",color:"#CC3333",name:"Gas\u00f3leo B"}],PROVS={"\u00c1lava":"01",Albacete:"02",Alicante:"03","Almer\u00eda":"04",Asturias:"33","\u00c1vila":"05",Badajoz:"06","Balears (Illes)":"07",Barcelona:"08",Burgos:"09","C\u00e1ceres":"10","C\u00e1diz":"11",Cantabria:"39","Castell\u00f3n / Castell\u00f3":"12",Ceuta:"51","Ciudad Real":"13","C\u00f3rdoba":"14","Coru\u00f1a (A)":"15",Cuenca:"16",Girona:"17",
Granada:"18",Guadalajara:"19","Guip\u00fazcoa":"20",Huelva:"21",Huesca:"22","Ja\u00e9n":"23","Le\u00f3n":"24",Lleida:"25",Lugo:"27",Madrid:"28","M\u00e1laga":"29",Melilla:"52",Murcia:"30",Navarra:"31",Ourense:"32",Palencia:"34","Palmas (Las)":"35",Pontevedra:"36","Rioja (La)":"26",Salamanca:"37","Santa Cruz De Tenerife":"38",Segovia:"40",Sevilla:"41",Soria:"42",Tarragona:"43",Teruel:"44",Toledo:"45","Valencia / Val\u00e8ncia":"46",Valladolid:"47",Vizcaya:"48",Zamora:"49",Zaragoza:"50"},info=null,
LS_EXPIRE=36E5,APIS={gasolineras:"api",resultados:"geo",ficha:"api"};function getProvName(a){for(k in PROVS)if(PROVS[k]==a)return k}function clearHtmlTags(a){return a.replace(/(<([^>]+)>)/ig,"")}
function toTitle(a){return a.replace(" [N]","").replace(/^CARRETERA ?|^CR\.? ?/i,"CTRA. ").replace(/(CTRA. )+/i,"CTRA. ").replace(/^AVENIDA ?|^AV. ?/i,"AVDA. ").replace(/^POLIGONO INDUSTRIAL ?|POLIGONO ?|P\.I\. ?/i,"POL. IND. ").replace(/^CALLE |^CL\.? ?|C\/ ?/i,"C/ ").replace(/^RONDA |^RD /i,"RDA. ").replace(/^AUTOPISTA (AUTOPISTA ?)?/i,"AU. ").replace(/^PLAZA ?/i,"PL. ").replace(/^PASEO (PASEO ?)?/i,"P\u00ba ").replace(/^TRAVESS?[I\u00cd]A /i,"TRAV. ").replace(/^V[i\u00ed]A (V[I\u00cd]A )?/i,"V\u00cdA ").replace(/\B[^\d- ]+[ $]/g,
function(a){return a.toLowerCase()}).replace(/\b[NAE]-.+\b/,function(a){return a.toUpperCase()}).replace(/\[D\]$/,"(m.d.)").replace(/\[I\]$/,"(m.i.)").replace(/ \[N\]$/,"")}
function getLogo(a){return a&&(a=a.replace(/camspa/i,"campsa"),logo=a.match(/\b(abycer|agla|alcampo|andamur|a\.?n\.? energeticos|avia|bonarea|b\.?p\.?|buquerin|campsa|carmoned|carrefour|cepsa|empresoil|eroski|esclatoil|galp|gasolben|iberdoex|leclerc|makro|meroil|norpetrol|petrem|petrocat|petromiralles|petronor|repostar|repsol|saras|shell|simply|staroil|tamoil|valcarce)\b/i))?logo[0].replace(/\./g,"").replace(/ /g,"_").toLowerCase():null}
function decodeName(a){return decodeURI(a).replace(/_/g," ").replace(/\|/g,"/")}function prettyName(a){a.match("/")&&(a=a.split("/")[1]);a.match(/\)$/)&&(a=a.match(/\(.+\)$/g)[0].replace("(","").replace(")"," ")+a.split(" (")[0]);return a}function decodeArray(a){for(var b=0;b<a.length;b++)a[b]=decodeName(a[b]);return a}function encodeName(a){return a.replace(/\//g,"|").replace(/ /g,"_")}function checkLocalStorage(){try{return"localStorage"in window&&null!==window.localStorage}catch(a){return!1}}
function getApiData(a,b,c){var d=new XMLHttpRequest;d.onload=function(a){info=JSON.parse(a.target.responseText);b&&(localStorage.setItem(b,JSON.stringify(info)),localStorage.timestamp||localStorage.setItem("timestamp",(new Date).getTime()));c(info)};d.open("GET",a);d.send()}function getKey(){return window.location.pathname.split("/").slice(1).join("***")}
function getData(a){var b=null,c=null,d=window.location.pathname.split("/"),h=d[1];if(checkLocalStorage()){(b=localStorage.timestamp)&&(new Date).getTime()-parseInt(b)>LS_EXPIRE&&localStorage.clear();var b=getKey(),f=localStorage[b];if(f)c=JSON.parse(f);else if("gasolineras"==h&&d[3]&&(f=localStorage[d.slice(1,3).join("***")])){var e=decodeName(d[2]),d=decodeName(d[3]),c={_data:{}};c._data[e]={};c._data[e][d]=JSON.parse(f)._data[e][d]}}c?a(c):getApiData(document.URL.replace(h,APIS[h]),b,a)};
