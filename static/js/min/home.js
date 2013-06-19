function searchLocation(a){var c="",b="",d="";"object"==typeof a?(c=a.geometry.location.lat(),b=a.geometry.location.lng(),d=encodeURI(a.formatted_address)):"string"==typeof a&&(b=a.split("##"),d=b[0],c=b[1],b=b[2]);a=document.getElementById("search-d").getAttribute("value");window.location="/resultados/"+d+"/"+c+"/"+b+"/"+a}
function showLoader(){document.getElementById("results-title").textContent="Buscando\u2026";var a=document.getElementById("results-list");a.innerHTML="";var c=new Image;c.src="/img/search-loader.gif";a.appendChild(c)}function initGeoloc(){var a=document.getElementById("current-loc");navigator.geolocation?a.addEventListener("click",loadCurrentPosition):a.style.display="none"}
function showResult(a,c){document.getElementById("results").style.display="block";var b=document.getElementById("results-list");b.innerHTML="";if(c==google.maps.GeocoderStatus.OK){for(var d=0,f=0,g=0;g<a.length;g++){var e=a[g].formatted_address;if(e.match(/Espa\u00f1a$/)){console.log(typeof a[g]);d++;var f=g,h=document.createElement("li"),l=document.createElement("a");h.appendChild(l);l.textContent=e;l.href="#";l.setAttribute("loc",[a[g].formatted_address,a[g].geometry.location.lat(),a[g].geometry.location.lng()].join("##"));
l.addEventListener("click",function(){searchLocation(this.getAttribute("loc"))});b.appendChild(h)}}if(1==d){searchLocation(a[f]);return}if(1<d){document.getElementById("results-title").textContent="Encontrados "+d+" lugares:";return}}b.innerHTML="<li>No se ha podido encontrar el lugar. Int\u00e9ntalo de nuevo</li>"}
function loadCurrentPosition(){showLoader();navigator.geolocation.getCurrentPosition(function(a){var c=new google.maps.Geocoder;a=new google.maps.LatLng(a.coords.latitude,a.coords.longitude);c.geocode({latLng:a},showResult)},function(a){switch(a.code){case a.PERMISSION_DENIED:console.log("User denied the request for Geolocation.");break;case a.POSITION_UNAVAILABLE:console.log("Location information is unavailable.");break;case a.TIMEOUT:console.log("The request to get user location timed out.");break;
case a.UNKNOWN_ERROR:console.log("An unknown error occurred.")}})}function geoCode(){showLoader();var a=document.getElementById("address").value;(new google.maps.Geocoder).geocode({address:a,region:"es"},showResult)}
function mySlider(a){function c(a){var c=a.getElementsByClassName("val")[0],b=parseFloat(a.getAttribute("newval")),e=parseFloat(a.getAttribute("max")),h=parseFloat(a.getAttribute("min"));c.style.width=(b-h)*a.clientWidth/(e-h)-5+"px";c.textContent="Radio: "+b.toFixed(1)+" km.";a.setAttribute("value",b)}a.style.position="relative";var b=document.createElement("div");b.style.position="absolute";b.style.left="0";b.style.top="0";b.textContent="Radio: "+a.getAttribute("value")+" km.";b.className="val";
a.appendChild(b);b=document.createElement("div");b.style.position="absolute";b.style.left="0";b.style.top="0";b.className="new-val";b.style.display="none";a.appendChild(b);a.setAttribute("newval",a.getAttribute("value"));c(a);a.addEventListener("mousemove",function(a){var c=this.getElementsByClassName("new-val")[0];c.style.display="block";var b=a.clientX-this.getBoundingClientRect().left;c.style.width=b-5+"px";a=parseFloat(this.getAttribute("max"));var e=parseFloat(this.getAttribute("min")),h=parseFloat(this.getAttribute("step")),
b=e+b*(a-e)/this.clientWidth,b=parseInt(b/h)*h;b<e&&(b=e);b>a&&(b=a);c.textContent="Radio: "+b.toFixed(1)+" km.";this.setAttribute("newval",b)});a.addEventListener("click",function(a){this.getElementsByClassName("new-val")[0].style.display="none";c(this)});a.addEventListener("mouseout",function(a){this.getElementsByClassName("new-val")[0].style.display="none"})}
window.addEventListener("load",function(){for(var a=document.getElementsByClassName("my-slider"),c=0;c<a.length;c++)mySlider(a[c]);if(a=document.getElementById("map")){a=a.getElementsByClassName("prov");for(c=0;c<a.length;c++)a[c].addEventListener("click",function(){})}initGeoloc()});var PROVS={"\u00c1lava":"01",Albacete:"02",Alicante:"03","Almer\u00eda":"04",Asturias:"33","\u00c1vila":"05",Badajoz:"06","Balears (Illes)":"07",Barcelona:"08",Burgos:"09","C\u00e1ceres":"10","C\u00e1diz":"11",Cantabria:"39","Castell\u00f3n / Castell\u00f3":"12",Ceuta:"51","Ciudad Real":"13","C\u00f3rdoba":"14","Coru\u00f1a (A)":"15",Cuenca:"16",Girona:"17",Granada:"18",Guadalajara:"19","Guip\u00fazcoa":"20",Huelva:"21",Huesca:"22","Ja\u00e9n":"23","Le\u00f3n":"24",Lleida:"25",Lugo:"27",Madrid:"28",
"M\u00e1laga":"29",Melilla:"52",Murcia:"30",Navarra:"31",Ourense:"32",Palencia:"34","Palmas (Las)":"35",Pontevedra:"36","Rioja (La)":"26",Salamanca:"37","Santa Cruz De Tenerife":"38",Segovia:"40",Sevilla:"41",Soria:"42",Tarragona:"43",Teruel:"44",Toledo:"45","Valencia / Val\u00e8ncia":"46",Valladolid:"47",Vizcaya:"48",Zamora:"49",Zaragoza:"50"};
window.addEventListener("load",function(){for(var a in PROVS)prov=document.getElementById("P"+PROVS[a]),prov.addEventListener("click",function(){var a=getProvName(this.id.slice(1));window.location=window.location.origin+"/gasolineras/"+encodeName(a)}),prov.addEventListener("mouseover",function(){var a=getProvName(this.id.slice(1)),b=document.getElementById("prov-current");b.className="prov-current on";b.textContent=a}),prov.addEventListener("mouseout",function(){var a=getProvName(this.id.slice(1)),
b=document.getElementById("prov-current");b.className="prov-current";b.textContent=a});a=new XMLHttpRequest;a.onload=function(){info=JSON.parse(this.responseText);console.log(info)};a.open("GET","/api/All");a.send()});var Lat2Km=111.03461,Km2Lat=0.009006,Lon2Km=85.39383,Km2Lon=0.01171,LL2Km=98.2,Km2LL=0.010183,FUEL_OPTIONS={1:{"short":"G95",name:"Gasolina 95"},3:{"short":"G98",name:"Gasolina 98"},4:{"short":"GOA",name:"Gas\u00f3leo Automoci\u00f3n"},5:{"short":"NGO",name:"Nuevo Gas\u00f3leo A"},6:{"short":"GOB",name:"Gas\u00f3leo B"},7:{"short":"GOC",name:"Gas\u00f3leo C"},8:{"short":"BIOD",name:"Biodi\u00e9sel"}},CHART_OPTIONS=[{id:"G98",color:"#339933",name:"Gasolina 98"},{id:"G95",color:"#006633",name:"Gasolina 95"},
{id:"NGO",color:"#aaa",name:"Nuevo Gas\u00f3leo A"},{id:"BIOD",color:"#f1aa41",name:"Biodi\u00e9sel"},{id:"GOA",color:"#000",name:"Gas\u00f3leo A"},{id:"GOC",color:"#FF3300",name:"Gas\u00f3leo C"},{id:"GOB",color:"#CC3333",name:"Gas\u00f3leo B"}],PROVS={"\u00c1lava":"01",Albacete:"02",Alicante:"03","Almer\u00eda":"04",Asturias:"33","\u00c1vila":"05",Badajoz:"06","Balears (Illes)":"07",Barcelona:"08",Burgos:"09","C\u00e1ceres":"10","C\u00e1diz":"11",Cantabria:"39","Castell\u00f3n / Castell\u00f3":"12",
Ceuta:"51","Ciudad Real":"13","C\u00f3rdoba":"14","Coru\u00f1a (A)":"15",Cuenca:"16",Girona:"17",Granada:"18",Guadalajara:"19","Guip\u00fazcoa":"20",Huelva:"21",Huesca:"22","Ja\u00e9n":"23","Le\u00f3n":"24",Lleida:"25",Lugo:"27",Madrid:"28","M\u00e1laga":"29",Melilla:"52",Murcia:"30",Navarra:"31",Ourense:"32",Palencia:"34","Palmas (Las)":"35",Pontevedra:"36","Rioja (La)":"26",Salamanca:"37","Santa Cruz De Tenerife":"38",Segovia:"40",Sevilla:"41",Soria:"42",Tarragona:"43",Teruel:"44",Toledo:"45","Valencia / Val\u00e8ncia":"46",
Valladolid:"47",Vizcaya:"48",Zamora:"49",Zaragoza:"50"},MONTHS="Enero Febrero Marzo Abril Mayo Junio Julio Agosto Septiembre Octubre Noviembre Diciembre".split(" "),COLORS={min:"#36AE34",minStroke:"#fff",max:"#f00",maxStroke:"#fff",mu:"#3399CC",muStroke:"#fff"},info=null,LS_EXPIRE=36E5,APIS={gasolineras:"api",resultados:"geo",ficha:"api"};function getProvName(a){for(k in PROVS)if(PROVS[k]==a)return k}function clearHtmlTags(a){return a.replace(/(<([^>]+)>)/ig,"")}
function toTitle(a){return a.replace(" [N]","").replace(/^CARRETERA ?|^CR\.? ?/i,"CTRA. ").replace(/(CTRA. )+/i,"CTRA. ").replace(/^AVENIDA ?|^AV. ?/i,"AVDA. ").replace(/^POLIGONO INDUSTRIAL ?|POLIGONO ?|P\.I\. ?/i,"POL. IND. ").replace(/^CALLE |^CL\.? ?|C\/ ?/i,"C/ ").replace(/^RONDA |^RD /i,"RDA. ").replace(/^AUTOPISTA (AUTOPISTA ?)?/i,"AU. ").replace(/^PLAZA ?/i,"PL. ").replace(/^PASEO (PASEO ?)?/i,"P\u00ba ").replace(/^TRAVESS?[I\u00cd]A /i,"TRAV. ").replace(/^V[i\u00ed]A (V[I\u00cd]A )?/i,"V\u00cdA ").replace(/\B[^\d- ]+[ $]/g,
function(a){return a.toLowerCase()}).replace(/\b[NAE]-.+\b/,function(a){return a.toUpperCase()}).replace(/\[D\]$/,"(m.d.)").replace(/\[I\]$/,"(m.i.)").replace(/ \[N\]$/,"")}
function getLogo(a){return a&&(a=a.replace(/camspa/i,"campsa"),logo=a.match(/\b(abycer|agla|alcampo|andamur|a\.?n\.? energeticos|avia|bonarea|b\.?p\.?|buquerin|campsa|carmoned|carrefour|cepsa|empresoil|eroski|esclatoil|galp|gasolben|iberdoex|leclerc|makro|meroil|norpetrol|petrem|petrocat|petromiralles|petronor|repostar|repsol|saras|shell|simply|staroil|tamoil|valcarce)\b/i))?logo[0].replace(/\./g,"").replace(/ /g,"_").toLowerCase():null}
function decodeName(a){return decodeURI(a).replace(/_/g," ").replace(/\|/g,"/")}function prettyName(a){a.match("/")&&(a=a.split("/")[1]);a.match(/\)$/)&&(a=a.match(/\(.+\)$/g)[0].replace("(","").replace(")"," ")+a.split(" (")[0]);return a}function decodeArray(a){for(var c=0;c<a.length;c++)a[c]=decodeName(a[c]);return a}function encodeName(a){return a.replace(/\//g,"|").replace(/ /g,"_")}function checkLocalStorage(){try{return"localStorage"in window&&null!==window.localStorage}catch(a){return!1}}
function getApiData(a){var c=window.location.pathname.split("/").slice(1).join("*");if(checkLocalStorage()&&localStorage.hasOwnProperty(c))if(localData=JSON.parse(localStorage[c]),(new Date).getTime()-localData.ts>LS_EXPIRE)localStorage.removeItem(c);else{a(localData.data);return}var b=new XMLHttpRequest;b.onload=function(b){b=JSON.parse(this.responseText);checkLocalStorage()&&localStorage.setItem(c,JSON.stringify({ts:(new Date).getTime(),data:b}));a(b)};var d=window.location.pathname.split("/")[1];
b.open("GET",document.URL.replace(d,APIS[d]));b.send()}function distance(a,c,b){var d=Math.abs(a[0]-c[0])*Lat2Km;return d<b&&(a=Math.abs(a[1]-c[1])*Lon2Km,a<b&&(d=Math.sqrt(Math.pow(d,2)+Math.pow(a,2)),d<b))?d:null}function distanceOrto(a,c,b){if(c.lng()==b.lng())return Math.abs(a.lat()-c.lat());b=(b.lat()-c.lat())/(b.lng()-c.lng());c=c.lat()-b*c.lng();return Math.abs(b*a.lng()-a.lat()+c)/Math.sqrt(b*b+1)}
function properRDP(a,c){"undefined"==typeof c&&(c=1*Km2LL);var b=a[0],d=a[a.length-1];if(3>a.length)return a;for(var f=-1,g=0,e=1;e<a.length-1;e++){var h=distanceOrto(a[e],b,d);h>g&&(g=h,f=e)}return g>c?(b=a.slice(0,f+1),f=a.slice(f),b=properRDP(b,c),f=properRDP(f,c),b.slice(0,b.length-1).concat(f)):[b,d]}
function SearchLocations(){this.locs=[];this.radius=2;this.length=function(){return this.locs.length};this.add=function(a,c){this.locs.push({name:a,latlng:c})};this.latlng=function(){return 1==this.length()?this.locs[0].latlng:null};this.name=function(){return 1==this.length()?this.locs[0].name:null};this.get=function(a){return this.locs[a]};this.select=function(a){this.locs=[this.locs[a]]};this.clear=function(){this.locs=[]}}
function Stats(){this.n=0;this.max=this.min=this.mu=this.range=null;this.add=function(a){this.max?(a>this.max?this.max=a:a<this.min&&(this.min=a),this.mu=(this.mu*this.n+a)/(this.n+1),this.range=this.max-this.min):this.max=this.min=this.mu=a;this.n++}}
function Gasole(a){this.color=function(a){if(0!=this.stats.range){a=(a-this.stats.min)/this.stats.range;if(0.33>a)return COLORS.min;if(0.66<a)return COLORS.max}return COLORS.mu};this.init=function(a,b){this.info=a;this.date=b};this.provinceDataArray=function(a){this.stats=new Stats;var b=this.type;result=[];a=this.info[a];for(var d in a){var f=a[d],g;for(g in f){var e=f[g],h=e.o[b];h&&(result.push({a:g,r:e.r,g:e.g,p:h,t:d,l:e.l,d:null}),this.stats.add(h))}}return result};this.nearData=function(a){var b=
a.latlng();if(b){a=a.radius;var d={},f;for(f in this.info){var g=this.info[f];d[f]={};for(var e in g){var h=g[e];d[f][e]={};for(var l in h){var q=h[l],m=q.g;m&&distance(m,b,a)&&(d[f][e][l]=q)}Object.keys(d[f][e]).length||delete d[f][e]}Object.keys(d[f]).length||delete d[f]}return d}};this.nearDataArray=function(a,b){var d=a.latlng();if(d){var f=a.radius;this.stats=new Stats;var g=[],e;for(e in this.info){var h=this.info[e],l;for(l in h){var q=h[l],m;for(m in q){var r=q[m];if(r.o.hasOwnProperty(this.type)){var n=
r.g;if(n){var s=distance(n,d,f);if(s){var t=r.o[this.type];g.push({a:m,r:r.r,g:n,p:t,t:l,l:r.l,d:s});this.stats.add(t)}}}}}}return b?g.sort(function(a,c){return a[b]<c[b]?-1:1}):g}};this.routeData=function(a){var b=[],d=this.type;this.stats=new Stats;var f=Km2LL,g;for(g in this.info){var e=this.info[g],h;for(h in e){var l=e[h],q;for(q in l){var m=l[q],r=m.o[d];if(r){var n=m.g;if(n){for(var s=!1,t=new google.maps.LatLng(n[0],n[1]),p=0;p<a.length-1;p++)if(distance(n,[a[p].lat(),a[p].lng()],f))s=!0;
else if(distance(n,[a[p+1].lat(),a[p+1].lng()],f))s=!0;else if((new google.maps.LatLngBounds(a[p],a[p+1])).contains(t)){var u=distanceOrto(t,a[p],a[p+1]);u<f&&(s=!0)}s&&(b.push({a:q,r:m.r,g:n,p:r,t:h,l:m.l,d:u}),this.stats.add(r))}}}}}return b};this.callback=a;this.date=this.info=this.stats=null;this.type="1";a=localStorage.gasole;!a||(new Date).getTime()-parseInt(JSON.parse(a).ts)>LS_EXPIRE?(a=new XMLHttpRequest,a.gasole=this,a.onload=function(){var a=new Date;this.gasole.init(JSON.parse(this.responseText),
a);localStorage.setItem("gasole",'{"ts": '+a.getTime()+',"data": '+this.responseText+"}");this.gasole.callback&&this.gasole.callback()},a.open("GET","/api/All"),a.send()):(a=JSON.parse(a),this.init(a.data,new Date(a.ts)),this.callback&&this.callback())};
