var Lat2Km=111.03461,Km2Lat=0.009006,Lon2Km=85.39383,Km2Lon=0.01171,LL2Km=98.2,Km2LL=0.010183,FUEL_OPTIONS={1:{"short":"G95",name:"Gasolina 95"},3:{"short":"G98",name:"Gasolina 98"},4:{"short":"GOA",name:"Gas\u00f3leo Automoci\u00f3n"},5:{"short":"NGO",name:"Nuevo Gas\u00f3leo A"},6:{"short":"GOB",name:"Gas\u00f3leo B"},7:{"short":"GOC",name:"Gas\u00f3leo C"},8:{"short":"BIOD",name:"Biodi\u00e9sel"}},CHART_OPTIONS=[{id:"G98",color:"#339933",name:"Gasolina 98"},{id:"G95",color:"#006633",name:"Gasolina 95"},
{id:"NGO",color:"#aaa",name:"Nuevo Gas\u00f3leo A"},{id:"BIOD",color:"#f1aa41",name:"Biodi\u00e9sel"},{id:"GOA",color:"#000",name:"Gas\u00f3leo A"},{id:"GOC",color:"#FF3300",name:"Gas\u00f3leo C"},{id:"GOB",color:"#CC3333",name:"Gas\u00f3leo B"}],PROVS={"\u00c1lava":"01",Albacete:"02",Alicante:"03","Almer\u00eda":"04",Asturias:"33","\u00c1vila":"05",Badajoz:"06","Balears (Illes)":"07",Barcelona:"08",Burgos:"09","C\u00e1ceres":"10","C\u00e1diz":"11",Cantabria:"39","Castell\u00f3n / Castell\u00f3":"12",
Ceuta:"51","Ciudad Real":"13","C\u00f3rdoba":"14","Coru\u00f1a (A)":"15",Cuenca:"16",Girona:"17",Granada:"18",Guadalajara:"19","Guip\u00fazcoa":"20",Huelva:"21",Huesca:"22","Ja\u00e9n":"23","Le\u00f3n":"24",Lleida:"25",Lugo:"27",Madrid:"28","M\u00e1laga":"29",Melilla:"52",Murcia:"30",Navarra:"31",Ourense:"32",Palencia:"34","Palmas (Las)":"35",Pontevedra:"36","Rioja (La)":"26",Salamanca:"37","Santa Cruz De Tenerife":"38",Segovia:"40",Sevilla:"41",Soria:"42",Tarragona:"43",Teruel:"44",Toledo:"45","Valencia / Val\u00e8ncia":"46",
Valladolid:"47",Vizcaya:"48",Zamora:"49",Zaragoza:"50"},MONTHS="Enero Febrero Marzo Abril Mayo Junio Julio Agosto Septiembre Octubre Noviembre Diciembre".split(" "),COLORS={stroke:"#fff",min:"#36AE34",max:"#f00",mu:"#3399CC"},info=null,LS_EXPIRE=36E5,APIS={gasolineras:"api",resultados:"geo",ficha:"api"};
function lockScroll(a){"string"==typeof a&&(a=document.getElementById(a));a.addEventListener("mouseover",function(){document.body.style.overflow="hidden"});a.addEventListener("mouseout",function(){document.body.style.overflow="auto"})}
function initProvLinks(a){a=document.getElementById(a);for(var c in PROVS){var b=document.createElement("li"),d=document.createElement("a");d.title="Todas las gasolineras de "+c;d.textContent=c;d.href="/gasolineras/"+encodeName(c);b.appendChild(d);a.appendChild(b)}}function getProvName(a){for(k in PROVS)if(PROVS[k]==a)return k}function clearHtmlTags(a){return a.replace(/(<([^>]+)>)/ig,"")}
function toTitle(a){return a.replace(" [N]","").replace(/^CARRETERA ?|^CR\.? ?/i,"CTRA. ").replace(/(CTRA. )+/i,"CTRA. ").replace(/^AVENIDA ?|^AV. ?/i,"AVDA. ").replace(/^POLIGONO INDUSTRIAL ?|POLIGONO ?|P\.I\. ?/i,"POL. IND. ").replace(/^CALLE |^CL\.? ?|C\/ ?/i,"C/ ").replace(/^RONDA |^RD /i,"RDA. ").replace(/^AUTOPISTA (AUTOPISTA ?)?/i,"AU. ").replace(/^PLAZA ?/i,"PL. ").replace(/^PASEO (PASEO ?)?/i,"P\u00ba ").replace(/^TRAVESS?[I\u00cd]A /i,"TRAV. ").replace(/^V[i\u00ed]A (V[I\u00cd]A )?/i,"V\u00cdA ").replace(/\B[^\d- ]+[ $]/g,
function(a){return a.toLowerCase()}).replace(/\b[NAE]-.+\b/,function(a){return a.toUpperCase()}).replace(/\[D\]$/,"(m.d.)").replace(/\[I\]$/,"(m.i.)").replace(/ \[N\]$/,"")}
function getLogo(a){return a&&(a=a.replace(/camspa/i,"campsa"),logo=a.match(/\b(abycer|agla|alcampo|andamur|a\.?n\.? energeticos|avia|bonarea|b\.?p\.?|buquerin|campsa|carmoned|carrefour|cepsa|empresoil|eroski|esclatoil|galp|gasolben|iberdoex|leclerc|makro|meroil|norpetrol|petrem|petrocat|petromiralles|petronor|ramell|repostar|repsol|saras|shell|simply|staroil|tamoil|valcarce)\b/i))?logo[0].replace(/\./g,"").replace(/ /g,"_").toLowerCase():null}
function decodeName(a){return decodeURI(a).replace(/_/g," ").replace(/\|/g,"/")}function prettyName(a){a.match("/")&&(a=a.split("/")[1]);a.match(/\)$/)&&(a=a.match(/\(.+\)$/g)[0].replace("(","").replace(")"," ")+a.split(" (")[0]);return a}function decodeArray(a){for(var c=0;c<a.length;c++)a[c]=decodeName(a[c]);return a}function encodeName(a){return a.replace(/\//g,"|").replace(/ /g,"_")}function checkLocalStorage(){try{return"localStorage"in window&&null!==window.localStorage}catch(a){return!1}}
function getKey(){return window.location.pathname.split("/").slice(1).join("*")}
function getApiData(a){var c=getKey();if(checkLocalStorage()&&localStorage.hasOwnProperty(c))if(localData=JSON.parse(localStorage[c]),(new Date).getTime()-localData.ts>LS_EXPIRE)localStorage.removeItem(c);else{a(localData.data);return}var b=new XMLHttpRequest;b.onload=function(b){b=JSON.parse(this.responseText);checkLocalStorage()&&localStorage.setItem(c,JSON.stringify({ts:(new Date).getTime(),data:b}));a(b)};var d=window.location.pathname.split("/")[1];b.open("GET",document.URL.replace(d,APIS[d]));
b.send()}function distance(a,c,b){var d=Math.abs(a[0]-c[0])*Lat2Km;return d<b&&(a=Math.abs(a[1]-c[1])*Lon2Km,a<b&&(d=Math.sqrt(Math.pow(d,2)+Math.pow(a,2)),d<b))?d:null}function distanceOrto(a,c,b){if(c.lng()==b.lng())return Math.abs(a.lat()-c.lat());b=(b.lat()-c.lat())/(b.lng()-c.lng());c=c.lat()-b*c.lng();return Math.abs(b*a.lng()-a.lat()+c)/Math.sqrt(b*b+1)}
function properRDP(a,c){"undefined"==typeof c&&(c=1*Km2LL);var b=a[0],d=a[a.length-1];if(3>a.length)return a;for(var e=-1,f=0,g=1;g<a.length-1;g++){var h=distanceOrto(a[g],b,d);h>f&&(f=h,e=g)}return f>c?(b=a.slice(0,e+1),e=a.slice(e),b=properRDP(b,c),e=properRDP(e,c),b.slice(0,b.length-1).concat(e)):[b,d]}
function SearchLocations(){this.locs=[];this.radius=2;this.length=function(){return this.locs.length};this.add=function(a,c){this.locs.push({name:a,latlng:c})};this.latlng=function(){return 1==this.length()?this.locs[0].latlng:null};this.name=function(){return 1==this.length()?this.locs[0].name:null};this.get=function(a){return this.locs[a]};this.select=function(a){this.locs=[this.locs[a]]};this.clear=function(){this.locs=[]}}
function Stats(){this.n=0;this.max=this.min=this.mu=this.range=null;this.smin=[];this.smax=[];this.g=null;this.range=function(){null==this.range&&(this.range=this.max-this.min);return this.range};this.add=function(a,c,b){this.mu?(a>this.max?(this.max=a,this.smax=[c]):a==this.max?this.smax.push(c):a<this.min?(this.min=a,this.smin=[c]):a==this.min&&this.smin.push(c),this.mu=(this.mu*this.n+a)/++this.n):(this.max=this.min=this.mu=a,this.smin=[c],this.smax=[c],this.n=1);b&&(this.g?(b[0]<this.g[0]?this.g[0]=
b[0]:b[0]>this.g[1]&&(this.g[1]=b[0]),b[1]<this.g[2]?this.g[2]=b[1]:b[1]>this.g[3]&&(this.g[3]=b[1])):this.g=[b[0],b[0],b[1],b[1]])}}function GasoleStats(a){var c=this.stats={};this.provinces={};for(var b in a){var d=a[b],e=this.provinces[b]={},f;for(f in d){var g=d[f],h;for(h in g){datas=g[h];var m=datas.g,l;for(l in datas.o)e.hasOwnProperty(l)||(e[l]=new Stats),c.hasOwnProperty(l)||(c[l]=new Stats),e[l].add(datas.o[l],[b,f,h],m),c[l].add(datas.o[l],[b,f,h],m)}}}}
function Gasole(a){this.color=function(a){var b=this.stats.range();if(0!=b){a=(a-this.stats.min)/b;if(0.33>a)return COLORS.min;if(0.66<a)return COLORS.max}return COLORS.mu};this.init=function(a,b,d){this.info=a;this.date=b;this.stats=d?d:new GasoleStats(this.info)};this.provinceDataArray=function(a){this.stats=new Stats;var b=this.type;result=[];a=this.info[a];for(var d in a){var e=a[d],f;for(f in e){var g=e[f],h=g.o[b];h&&(result.push({a:f,r:g.r,g:g.g,p:h,t:d,l:g.l,d:null}),this.stats.add(h))}}return result};
this.nearData=function(a){var b=a.latlng();if(b){a=a.radius;var d={},e;for(e in this.info){var f=this.info[e];d[e]={};for(var g in f){var h=f[g];d[e][g]={};for(var m in h){var l=h[m],n=l.g;n&&distance(n,b,a)&&(d[e][g][m]=l)}Object.keys(d[e][g]).length||delete d[e][g]}Object.keys(d[e]).length||delete d[e]}return d}};this.nearDataArray=function(a,b,d){console.log(a);var e=a.latlng();if(e){a=a.radius;this.stats=new Stats;var f=[],g;for(g in this.info){var h=this.info[g],m;for(m in h){var l=h[m],n;for(n in l){var u=
l[n];if(u.o.hasOwnProperty(b)){var q=u.g;if(q){var v=distance(q,e,a);if(v){var w=u.o[b];f.push({a:n,prov:g,g:q,p:w,t:m,l:u.l,d:v});this.stats.add(w)}}}}}}return d?f.sort(function(a,b){return a[d]<b[d]?-1:1}):f}};this.routeData=function(a){var b=[],d=this.type;this.stats=new Stats;var e=Km2LL,f;for(f in this.info){var g=this.info[f],h;for(h in g){var m=g[h],l;for(l in m){var n=m[l],u=n.o[d];if(u){var q=n.g;if(q){for(var v=!1,w=new google.maps.LatLng(q[0],q[1]),r=0;r<a.length-1;r++)if(distance(q,[a[r].lat(),
a[r].lng()],e))v=!0;else if(distance(q,[a[r+1].lat(),a[r+1].lng()],e))v=!0;else if((new google.maps.LatLngBounds(a[r],a[r+1])).contains(w)){var x=distanceOrto(w,a[r],a[r+1]);x<e&&(v=!0)}v&&(b.push({a:l,r:n.r,g:q,p:u,t:h,l:n.l,d:x}),this.stats.add(u))}}}}}return b};this.callback=a;this.date=this.info=this.stats=null;this.type="1";a=localStorage.gasole;!a||(new Date).getTime()-parseInt(JSON.parse(a).ts)>LS_EXPIRE?(a=new XMLHttpRequest,a.gasole=this,a.onload=function(){var a=new Date;this.gasole.init(JSON.parse(this.responseText),
a);localStorage.setItem("gasole",'{"ts": '+a.getTime()+',"data": '+this.responseText+',"stats": '+JSON.stringify(this.gasole.stats)+"}");this.gasole.callback&&this.gasole.callback()},a.open("GET","/api/All"),a.send()):(a=JSON.parse(a),this.init(a.data,new Date(a.ts),a.stats),this.callback&&this.callback())}
function fillPriceDigits(a,c){a.innerHTML="";for(var b=c.toFixed(3),d=0;d<b.length;d++){var e=document.createElement("div");e.className="back";"."==b[d]?e.className+=" point":e.textContent=8;var f=document.createElement("div");f.className="digit";f.textContent=b[d];e.appendChild(f);a.appendChild(e)}};var data,map;function initialize(){var a={zoom:8,center:new google.maps.LatLng(40.4,-3.6833),mapTypeId:google.maps.MapTypeId.ROADMAP};map=new google.maps.Map(document.getElementById("map"),a)}function drawData(a){var c=[];for(p in a)for(t in a[p])for(s in a[p][t])if(a[p][t][s].g){var b=new google.maps.LatLng(a[p][t][s].g[0],a[p][t][s].g[1]);c.push(b)}new google.maps.visualization.HeatmapLayer({data:c,dissipating:!0,radius:20,gradient:["transparent","#00f","#0f0","#f00"],map:map})}
window.addEventListener("load",function(){initialize();new Gasole(function(){console.log(this);drawData(this.info)})});function searchLocation(a){var c="",b="",d="";"object"==typeof a?(c=a.geometry.location.lat(),b=a.geometry.location.lng(),d=encodeURI(a.formatted_address)):"string"==typeof a&&(b=a.split("##"),d=b[0],c=b[1],b=b[2]);a=document.getElementById("search-d").getAttribute("value");window.location="/resultados/"+d+"/"+c+"/"+b+"/"+a}
function showLoader(){document.getElementById("results-title").textContent="Buscando\u2026";var a=document.getElementById("results-list");a.innerHTML="";var c=new Image;c.src="/img/search-loader.gif";a.appendChild(c)}function initGeoloc(){var a=document.getElementById("current-loc");navigator.geolocation?a.addEventListener("click",loadCurrentPosition):a.style.display="none"}
function showResult(a,c){document.getElementById("results").style.display="block";var b=document.getElementById("results-list");b.innerHTML="";if(c==google.maps.GeocoderStatus.OK){for(var d=0,e=0,f=0;f<a.length;f++){var g=a[f].formatted_address;if(g.match(/Espa\u00f1a$/)){console.log(typeof a[f]);d++;var e=f,h=document.createElement("li"),m=document.createElement("a");h.appendChild(m);m.textContent=g;m.href="#";m.setAttribute("loc",[a[f].formatted_address,a[f].geometry.location.lat(),a[f].geometry.location.lng()].join("##"));
m.addEventListener("click",function(){searchLocation(this.getAttribute("loc"))});b.appendChild(h)}}if(1==d){searchLocation(a[e]);return}if(1<d){document.getElementById("results-title").textContent="Encontrados "+d+" lugares:";return}}b.innerHTML="<li>No se ha podido encontrar el lugar. Int\u00e9ntalo de nuevo</li>"}
function loadCurrentPosition(){showLoader();navigator.geolocation.getCurrentPosition(function(a){var c=new google.maps.Geocoder;a=new google.maps.LatLng(a.coords.latitude,a.coords.longitude);c.geocode({latLng:a},showResult)},function(a){switch(a.code){case a.PERMISSION_DENIED:console.log("User denied the request for Geolocation.");break;case a.POSITION_UNAVAILABLE:console.log("Location information is unavailable.");break;case a.TIMEOUT:console.log("The request to get user location timed out.");break;
case a.UNKNOWN_ERROR:console.log("An unknown error occurred.")}})}function geoCode(){showLoader();var a=document.getElementById("address").value;(new google.maps.Geocoder).geocode({address:a,region:"es"},showResult)}
function mySlider(a){function c(a){var b=a.getElementsByClassName("val")[0],c=parseFloat(a.getAttribute("newval")),g=parseFloat(a.getAttribute("max")),h=parseFloat(a.getAttribute("min"));b.style.width=(c-h)*a.clientWidth/(g-h)-5+"px";b.textContent="Radio: "+c.toFixed(1)+" km.";a.setAttribute("value",c)}a.style.position="relative";var b=document.createElement("div");b.style.position="absolute";b.style.left="0";b.style.top="0";b.textContent="Radio: "+a.getAttribute("value")+" km.";b.className="val";
a.appendChild(b);b=document.createElement("div");b.style.position="absolute";b.style.left="0";b.style.top="0";b.className="new-val";b.style.display="none";a.appendChild(b);a.setAttribute("newval",a.getAttribute("value"));c(a);a.addEventListener("mousemove",function(a){var b=this.getElementsByClassName("new-val")[0];b.style.display="block";var c=a.clientX-this.getBoundingClientRect().left;b.style.width=c-5+"px";a=parseFloat(this.getAttribute("max"));var g=parseFloat(this.getAttribute("min")),h=parseFloat(this.getAttribute("step")),
c=g+c*(a-g)/this.clientWidth,c=parseInt(c/h)*h;c<g&&(c=g);c>a&&(c=a);b.textContent="Radio: "+c.toFixed(1)+" km.";this.setAttribute("newval",c)});a.addEventListener("click",function(a){this.getElementsByClassName("new-val")[0].style.display="none";c(this)});a.addEventListener("mouseout",function(a){this.getElementsByClassName("new-val")[0].style.display="none"})}
window.addEventListener("load",function(){for(var a=document.getElementsByClassName("my-slider"),c=0;c<a.length;c++)mySlider(a[c]);if(a=document.getElementById("map")){a=a.getElementsByClassName("prov");for(c=0;c<a.length;c++)a[c].addEventListener("click",function(){})}initGeoloc()});
