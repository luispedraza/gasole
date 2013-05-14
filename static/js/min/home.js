function searchLocation(a){var c="",b="",d="";"object"==typeof a?(c=a.geometry.location.lat(),b=a.geometry.location.lng(),d=encodeURI(a.formatted_address)):"string"==typeof a&&(b=a.split("##"),d=b[0],c=b[1],b=b[2]);a=document.getElementById("search-d").getAttribute("value");window.location="/resultados/"+d+"/"+c+"/"+b+"/"+a}
function showLoader(){document.getElementById("results-title").textContent="Buscando\u2026";var a=document.getElementById("results-list");a.innerHTML="";var c=new Image;c.src="/img/search-loader.gif";a.appendChild(c)}function initGeoloc(){var a=document.getElementById("current-loc");navigator.geolocation?a.addEventListener("click",loadCurrentPosition):a.style.display="none"}
function showResult(a,c){document.getElementById("results").style.display="block";var b=document.getElementById("results-list");b.innerHTML="";if(c==google.maps.GeocoderStatus.OK){for(var d=0,h=0,e=0;e<a.length;e++){var f=a[e].formatted_address;if(f.match(/Espa\u00f1a$/)){console.log(typeof a[e]);d++;var h=e,g=document.createElement("li"),l=document.createElement("a");g.appendChild(l);l.textContent=f;l.href="#";l.setAttribute("loc",[a[e].formatted_address,a[e].geometry.location.lat(),a[e].geometry.location.lng()].join("##"));
l.addEventListener("click",function(){searchLocation(this.getAttribute("loc"))});b.appendChild(g)}}if(1==d){searchLocation(a[h]);return}if(1<d){document.getElementById("results-title").textContent="Encontrados "+d+" lugares:";return}}b.innerHTML="<li>No se ha podido encontrar el lugar. Int\u00e9ntalo de nuevo</li>"}
function loadCurrentPosition(){showLoader();navigator.geolocation.getCurrentPosition(function(a){var c=new google.maps.Geocoder;a=new google.maps.LatLng(a.coords.latitude,a.coords.longitude);c.geocode({latLng:a},showResult)},function(a){switch(a.code){case a.PERMISSION_DENIED:console.log("User denied the request for Geolocation.");break;case a.POSITION_UNAVAILABLE:console.log("Location information is unavailable.");break;case a.TIMEOUT:console.log("The request to get user location timed out.");break;
case a.UNKNOWN_ERROR:console.log("An unknown error occurred.")}})}function geoCode(){showLoader();var a=document.getElementById("address").value;(new google.maps.Geocoder).geocode({address:a,region:"es"},showResult)}
function mySlider(a){function c(a){var c=a.getElementsByClassName("val")[0],b=parseFloat(a.getAttribute("newval")),f=parseFloat(a.getAttribute("max")),g=parseFloat(a.getAttribute("min"));c.style.width=(b-g)*a.clientWidth/(f-g)-5+"px";c.textContent="Radio: "+b.toFixed(1)+" km.";a.setAttribute("value",b)}a.style.position="relative";var b=document.createElement("div");b.style.position="absolute";b.style.left="0";b.style.top="0";b.textContent="Radio: "+a.getAttribute("value")+" km.";b.className="val";
a.appendChild(b);b=document.createElement("div");b.style.position="absolute";b.style.left="0";b.style.top="0";b.className="new-val";b.style.display="none";a.appendChild(b);a.setAttribute("newval",a.getAttribute("value"));c(a);a.addEventListener("mousemove",function(a){var c=this.getElementsByClassName("new-val")[0];c.style.display="block";var b=a.clientX-this.getBoundingClientRect().left;c.style.width=b-5+"px";a=parseFloat(this.getAttribute("max"));var f=parseFloat(this.getAttribute("min")),g=parseFloat(this.getAttribute("step")),
b=f+b*(a-f)/this.clientWidth,b=parseInt(b/g)*g;b<f&&(b=f);b>a&&(b=a);c.textContent="Radio: "+b.toFixed(1)+" km.";this.setAttribute("newval",b)});a.addEventListener("click",function(a){this.getElementsByClassName("new-val")[0].style.display="none";c(this)});a.addEventListener("mouseout",function(a){this.getElementsByClassName("new-val")[0].style.display="none"})}
window.addEventListener("load",function(){for(var a=document.getElementsByClassName("my-slider"),c=0;c<a.length;c++)mySlider(a[c]);if(a=document.getElementById("map")){a=a.getElementsByClassName("prov");for(c=0;c<a.length;c++)a[c].addEventListener("click",function(){})}initGeoloc()});var PROVS={"\u00c1lava":"01",Albacete:"02",Alicante:"03","Almer\u00eda":"04",Asturias:"33","\u00c1vila":"05",Badajoz:"06","Balears (Illes)":"07",Barcelona:"08",Burgos:"09","C\u00e1ceres":"10","C\u00e1diz":"11",Cantabria:"39","Castell\u00f3n / Castell\u00f3":"12",Ceuta:"51","Ciudad Real":"13","C\u00f3rdoba":"14","Coru\u00f1a (A)":"15",Cuenca:"16",Girona:"17",Granada:"18",Guadalajara:"19","Guip\u00fazcoa":"20",Huelva:"21",Huesca:"22","Ja\u00e9n":"23","Le\u00f3n":"24",Lleida:"25",Lugo:"27",Madrid:"28",
"M\u00e1laga":"29",Melilla:"52",Murcia:"30",Navarra:"31",Ourense:"32",Palencia:"34","Palmas (Las)":"35",Pontevedra:"36","Rioja (La)":"26",Salamanca:"37","Santa Cruz De Tenerife":"38",Segovia:"40",Sevilla:"41",Soria:"42",Tarragona:"43",Teruel:"44",Toledo:"45","Valencia / Val\u00e8ncia":"46",Valladolid:"47",Vizcaya:"48",Zamora:"49",Zaragoza:"50"};
window.addEventListener("load",function(){for(var a in PROVS)prov=document.getElementById("P"+PROVS[a]),prov.addEventListener("click",function(){var a=getProvName(this.id.slice(1));window.location=window.location.origin+"/gasolineras/"+encodeName(a)}),prov.addEventListener("mouseover",function(){var a=getProvName(this.id.slice(1)),b=document.getElementById("prov-current");b.className="prov-current on";b.textContent=a}),prov.addEventListener("mouseout",function(){var a=getProvName(this.id.slice(1)),
b=document.getElementById("prov-current");b.className="prov-current";b.textContent=a});a=new XMLHttpRequest;a.onload=function(){info=JSON.parse(this.responseText);console.log(info)};a.open("GET","/api/All");a.send()});var FUEL_OPTIONS={1:{"short":"G95",name:"Gasolina 95"},3:{"short":"G98",name:"Gasolina 98"},4:{"short":"GOA",name:"Gas\u00f3leo Automoci\u00f3n"},5:{"short":"NGO",name:"Nuevo Gas\u00f3leo A"},6:{"short":"GOB",name:"Gas\u00f3leo B"},7:{"short":"GOC",name:"Gas\u00f3leo C"},8:{"short":"BIOD",name:"Biodi\u00e9sel"}},CHART_OPTIONS=[{id:"G98",color:"#339933",name:"Gasolina 98"},{id:"G95",color:"#006633",name:"Gasolina 95"},{id:"NGO",color:"#aaa",name:"Nuevo Gas\u00f3leo A"},{id:"BIOD",color:"#f1aa41",name:"Biodi\u00e9sel"},
{id:"GOA",color:"#000",name:"Gas\u00f3leo A"},{id:"GOC",color:"#FF3300",name:"Gas\u00f3leo C"},{id:"GOB",color:"#CC3333",name:"Gas\u00f3leo B"}],PROVS={"\u00c1lava":"01",Albacete:"02",Alicante:"03","Almer\u00eda":"04",Asturias:"33","\u00c1vila":"05",Badajoz:"06","Balears (Illes)":"07",Barcelona:"08",Burgos:"09","C\u00e1ceres":"10","C\u00e1diz":"11",Cantabria:"39","Castell\u00f3n / Castell\u00f3":"12",Ceuta:"51","Ciudad Real":"13","C\u00f3rdoba":"14","Coru\u00f1a (A)":"15",Cuenca:"16",Girona:"17",
Granada:"18",Guadalajara:"19","Guip\u00fazcoa":"20",Huelva:"21",Huesca:"22","Ja\u00e9n":"23","Le\u00f3n":"24",Lleida:"25",Lugo:"27",Madrid:"28","M\u00e1laga":"29",Melilla:"52",Murcia:"30",Navarra:"31",Ourense:"32",Palencia:"34","Palmas (Las)":"35",Pontevedra:"36","Rioja (La)":"26",Salamanca:"37","Santa Cruz De Tenerife":"38",Segovia:"40",Sevilla:"41",Soria:"42",Tarragona:"43",Teruel:"44",Toledo:"45","Valencia / Val\u00e8ncia":"46",Valladolid:"47",Vizcaya:"48",Zamora:"49",Zaragoza:"50"},MONTHS="Enero Febrero Marzo Abril Mayo Junio Julio Agosto Septiembre Octubre Noviembre Diciembre".split(" "),
COLORS={min:"#36AE34",minStroke:"#fff",max:"#f00",maxStroke:"#fff",mu:"#3399CC",muStroke:"#fff"},info=null,LS_EXPIRE=36E5,APIS={gasolineras:"api",resultados:"geo",ficha:"api"};function getProvName(a){for(k in PROVS)if(PROVS[k]==a)return k}function clearHtmlTags(a){return a.replace(/(<([^>]+)>)/ig,"")}
function toTitle(a){return a.replace(" [N]","").replace(/^CARRETERA ?|^CR\.? ?/i,"CTRA. ").replace(/(CTRA. )+/i,"CTRA. ").replace(/^AVENIDA ?|^AV. ?/i,"AVDA. ").replace(/^POLIGONO INDUSTRIAL ?|POLIGONO ?|P\.I\. ?/i,"POL. IND. ").replace(/^CALLE |^CL\.? ?|C\/ ?/i,"C/ ").replace(/^RONDA |^RD /i,"RDA. ").replace(/^AUTOPISTA (AUTOPISTA ?)?/i,"AU. ").replace(/^PLAZA ?/i,"PL. ").replace(/^PASEO (PASEO ?)?/i,"P\u00ba ").replace(/^TRAVESS?[I\u00cd]A /i,"TRAV. ").replace(/^V[i\u00ed]A (V[I\u00cd]A )?/i,"V\u00cdA ").replace(/\B[^\d- ]+[ $]/g,
function(a){return a.toLowerCase()}).replace(/\b[NAE]-.+\b/,function(a){return a.toUpperCase()}).replace(/\[D\]$/,"(m.d.)").replace(/\[I\]$/,"(m.i.)").replace(/ \[N\]$/,"")}
function getLogo(a){return a&&(a=a.replace(/camspa/i,"campsa"),logo=a.match(/\b(abycer|agla|alcampo|andamur|a\.?n\.? energeticos|avia|bonarea|b\.?p\.?|buquerin|campsa|carmoned|carrefour|cepsa|empresoil|eroski|esclatoil|galp|gasolben|iberdoex|leclerc|makro|meroil|norpetrol|petrem|petrocat|petromiralles|petronor|repostar|repsol|saras|shell|simply|staroil|tamoil|valcarce)\b/i))?logo[0].replace(/\./g,"").replace(/ /g,"_").toLowerCase():null}
function decodeName(a){return decodeURI(a).replace(/_/g," ").replace(/\|/g,"/")}function prettyName(a){a.match("/")&&(a=a.split("/")[1]);a.match(/\)$/)&&(a=a.match(/\(.+\)$/g)[0].replace("(","").replace(")"," ")+a.split(" (")[0]);return a}function decodeArray(a){for(var c=0;c<a.length;c++)a[c]=decodeName(a[c]);return a}function encodeName(a){return a.replace(/\//g,"|").replace(/ /g,"_")}function checkLocalStorage(){try{return"localStorage"in window&&null!==window.localStorage}catch(a){return!1}}
function getApiData(a,c,b){var d=new XMLHttpRequest;d.onload=function(a){info=JSON.parse(a.target.responseText);c&&(localStorage.setItem(c,JSON.stringify(info)),localStorage.timestamp||localStorage.setItem("timestamp",(new Date).getTime()));b(info)};d.open("GET",a);d.send()}function getKey(){return window.location.pathname.split("/").slice(1).join("***")}
function getData(a){var c=null,b=null,d=window.location.pathname.split("/"),h=d[1];if(checkLocalStorage()){(c=localStorage.timestamp)&&(new Date).getTime()-parseInt(c)>LS_EXPIRE&&localStorage.clear();var c=getKey(),e=localStorage[c];if(e)b=JSON.parse(e);else if("gasolineras"==h&&d[3]&&(e=localStorage[d.slice(1,3).join("***")])){var f=decodeName(d[2]),d=decodeName(d[3]),b={_data:{}};b._data[f]={};b._data[f][d]=JSON.parse(e)._data[f][d]}}b?a(b):getApiData(document.URL.replace(h,APIS[h]),c,a)};
