var Lat2Km=111.03461,Km2Lat=0.009006,Lon2Km=85.39383,Km2Lon=0.01171,LL2Km=98.2,Km2LL=0.010183,FUEL_OPTIONS={1:{"short":"G95",name:"Gasolina 95"},3:{"short":"G98",name:"Gasolina 98"},4:{"short":"GOA",name:"Gas\u00f3leo Automoci\u00f3n"},5:{"short":"NGO",name:"Nuevo Gas\u00f3leo A"},6:{"short":"GOB",name:"Gas\u00f3leo B"},7:{"short":"GOC",name:"Gas\u00f3leo C"},8:{"short":"BIOD",name:"Biodi\u00e9sel"}},CHART_OPTIONS=[{id:"G98",color:"#339933",name:"Gasolina 98"},{id:"G95",color:"#006633",name:"Gasolina 95"},
{id:"NGO",color:"#aaa",name:"Nuevo Gas\u00f3leo A"},{id:"BIOD",color:"#f1aa41",name:"Biodi\u00e9sel"},{id:"GOA",color:"#000",name:"Gas\u00f3leo Automoci\u00f3n"},{id:"GOC",color:"#FF3300",name:"Gas\u00f3leo C"},{id:"GOB",color:"#CC3333",name:"Gas\u00f3leo B"}],PROVS={"\u00c1lava":"01",Albacete:"02",Alicante:"03","Almer\u00eda":"04",Asturias:"33","\u00c1vila":"05",Badajoz:"06","Balears (Illes)":"07",Barcelona:"08",Burgos:"09","C\u00e1ceres":"10","C\u00e1diz":"11",Cantabria:"39","Castell\u00f3n / Castell\u00f3":"12",
Ceuta:"51","Ciudad Real":"13","C\u00f3rdoba":"14","Coru\u00f1a (A)":"15",Cuenca:"16",Girona:"17",Granada:"18",Guadalajara:"19","Guip\u00fazcoa":"20",Huelva:"21",Huesca:"22","Ja\u00e9n":"23","Le\u00f3n":"24",Lleida:"25",Lugo:"27",Madrid:"28","M\u00e1laga":"29",Melilla:"52",Murcia:"30",Navarra:"31",Ourense:"32",Palencia:"34","Palmas (Las)":"35",Pontevedra:"36","Rioja (La)":"26",Salamanca:"37","Santa Cruz De Tenerife":"38",Segovia:"40",Sevilla:"41",Soria:"42",Tarragona:"43",Teruel:"44",Toledo:"45","Valencia / Val\u00e8ncia":"46",
Valladolid:"47",Vizcaya:"48",Zamora:"49",Zaragoza:"50"},MONTHS="Enero Febrero Marzo Abril Mayo Junio Julio Agosto Septiembre Octubre Noviembre Diciembre".split(" "),COLORS={stroke:"#fff",min:"#36AE34",max:"#f00",mu:"#3399CC"},LS_EXPIRE=36E5;function addEvent(a,e,b){a.addEventListener?a.addEventListener(e,b,!1):a.attachEvent&&a.attachEvent("on"+e,b)}
function lockScroll(a){"string"==typeof a&&(a=document.getElementById(a));addEvent(a,"mouseover",function(){document.body.style.overflow="hidden"});addEvent(a,"mouseout",function(){document.body.style.overflow="auto"})}
function initProvLinks(a,e){var b=document.getElementById(a),d;for(d in PROVS){var c=document.createElement("li");c.id="plist-"+PROVS[d];if(e)c.textContent=d,c.onclick=e;else{var f=document.createElement("a");f.title="Todas las gasolineras de "+d;f.textContent=d;f.href="/gasolineras/"+encodeName(d);c.appendChild(f)}b.appendChild(c)}lockScroll(b)}function getProvName(a){for(k in PROVS)if(PROVS[k]==a)return k}function clearHtmlTags(a){return a.replace(/(<([^>]+)>)/ig,"")}
function toTitle(a){return a.replace(" [N]","").replace(/^CARRETERA ?|^CR\.? ?/i,"CTRA. ").replace(/(CTRA. )+/i,"CTRA. ").replace(/^AVENIDA ?|^AV. ?/i,"AVDA. ").replace(/^POLIGONO INDUSTRIAL ?|POLIGONO ?|P\.I\. ?/i,"POL. IND. ").replace(/^CALLE |^CL\.? ?|C\/ ?/i,"C/ ").replace(/^RONDA |^RD /i,"RDA. ").replace(/^AUTOPISTA (AUTOPISTA ?)?/i,"AU. ").replace(/^PLAZA ?/i,"PL. ").replace(/^PASEO (PASEO ?)?/i,"P\u00ba ").replace(/^TRAVESS?[I\u00cd]A /i,"TRAV. ").replace(/^V[i\u00ed]A (V[I\u00cd]A )?/i,"V\u00cdA ").replace(/\B[^\d- ]+[ $]/g,
function(a){return a.toLowerCase()}).replace(/\b[NAE]-.+\b/,function(a){return a.toUpperCase()}).replace(/\[D\]$/,"(m.d.)").replace(/\[I\]$/,"(m.i.)").replace(/ \[N\]$/,"")}
function getLogo(a){return a&&(a=a.replace(/camspa/i,"campsa"),logo=a.match(/\b(abycer|agla|alcampo|andamur|a\.?n\.? energeticos|avia|bonarea|b\.?p\.?|buquerin|campsa|carmoned|carrefour|cepsa|empresoil|eroski|esclatoil|galp|gasolben|iberdoex|leclerc|makro|meroil|norpetrol|petrem|petrocat|petromiralles|petronor|ramell|repostar|repsol|saras|shell|simply|staroil|tamoil|valcarce)\b/i))?logo[0].replace(/\./g,"").replace(/ /g,"_").toLowerCase():null}
function decodeName(a){return decodeURI(a).replace(/_/g," ").replace(/\|/g,"/")}function decodeArray(a){for(var e=0;e<a.length;e++)a[e]=decodeName(a[e]);return a}function encodeName(a){return a.replace(/\//g,"|").replace(/ /g,"_")}function prettyName(a){a.match("/")&&(a=a.split("/")[1]);a.match(/\)$/)&&(a=a.match(/\(.+\)$/g)[0].replace("(","").replace(")"," ")+a.split(" (")[0]);return a}function checkLocalStorage(){try{return"localStorage"in window&&null!==window.localStorage}catch(a){return!1}}
function getKey(){return window.location.pathname.split("/").slice(1).join("*")}
function getApiData(a,e,b){"undefined"==typeof b&&(b=!1);var d=a+"*"+getKey(),c=(new Date).getTime();if(checkLocalStorage()&&localStorage.hasOwnProperty(d))if(localData=JSON.parse(localStorage[d]),c-localData.ts>LS_EXPIRE||b)localStorage.removeItem(d);else{e(localData.data);return}b=new XMLHttpRequest;b.onload=function(a){a=JSON.parse(this.responseText);checkLocalStorage()&&localStorage.setItem(d,JSON.stringify({ts:c,data:a}));e(a)};var f="api/";"history"==a?f+="h":"comments"==a&&(f+="c");a=window.location.pathname.split("/")[1];
b.open("GET",document.URL.replace(a,f));b.send()}function distance(a,e,b){var d=Math.abs(a[0]-e[0])*Lat2Km;return d<b&&(a=Math.abs(a[1]-e[1])*Lon2Km,a<b&&(d=Math.sqrt(Math.pow(d,2)+Math.pow(a,2)),d<b))?d:null}function distanceOrto(a,e,b){if(e.lng()==b.lng())return Math.abs(a.lat()-e.lat());b=(b.lat()-e.lat())/(b.lng()-e.lng());e=e.lat()-b*e.lng();return Math.abs(b*a.lng()-a.lat()+e)/Math.sqrt(b*b+1)}
function properRDP(a,e){"undefined"==typeof e&&(e=1*Km2LL);var b=a[0],d=a[a.length-1];if(3>a.length)return a;for(var c=-1,f=0,g=1;g<a.length-1;g++){var h=distanceOrto(a[g],b,d);h>f&&(f=h,c=g)}return f>e?(b=a.slice(0,c+1),c=a.slice(c),b=properRDP(b,e),c=properRDP(c,e),b.slice(0,b.length-1).concat(c)):[b,d]}
function SearchLocations(){this.locs=[];this.radius=2;this.length=function(){return this.locs.length};this.add=function(a,e){this.locs.push({name:a,latlng:e})};this.latlng=function(){return 1==this.length()?this.locs[0].latlng:null};this.name=function(){return 1==this.length()?this.locs[0].name:null};this.get=function(a){return this.locs[a]};this.select=function(a){this.locs=[this.locs[a]]};this.clear=function(){this.locs=[]}}
function Stats(){this.n=0;this.max=this.min=this.mu=this.range=null;this.smin=[];this.smax=[];this.g=null;this.range=function(){null==this.range&&(this.range=this.max-this.min);return this.range};this.add=function(a,e,b){this.mu?(a>this.max?(this.max=a,this.smax=[e]):a==this.max?this.smax.push(e):a<this.min?(this.min=a,this.smin=[e]):a==this.min&&this.smin.push(e),this.mu=(this.mu*this.n+a)/++this.n):(this.max=this.min=this.mu=a,this.smin=[e],this.smax=[e],this.n=1);b&&(this.g?(b[0]<this.g[0]?this.g[0]=
b[0]:b[0]>this.g[1]&&(this.g[1]=b[0]),b[1]<this.g[2]?this.g[2]=b[1]:b[1]>this.g[3]&&(this.g[3]=b[1])):this.g=[b[0],b[0],b[1],b[1]])}}
function GasoleStats(a,e){function b(a,b,e,d){b[d]||(b[d]=new Stats);e[d]||(e[d]=new Stats);b[d].add(a.o[d],[c,h,n],a.g);e[d].add(a.o[d],[c,h,n],a.g)}var d=this.stats={};this.provinces={};for(var c in a){var f=a[c],g=this.provinces[c]={},h;for(h in f){var r=f[h],n;for(n in r)if(datas=r[n],e)for(var m=e.length-1;0<=m;m--){var p=e[m];datas.o[p]&&b(datas,g,d,p)}else for(p in datas.o)b(datas,g,d,p)}}}
function Gasole(a){this.color=function(a){var b=this.stats.range();if(0!=b){a=(a-this.stats.min)/b;if(0.33>a)return COLORS.min;if(0.66<a)return COLORS.max}return COLORS.mu};this.init=function(a,b,d){this.info=a;this.date=b;this.stats=d?d:new GasoleStats(this.info)};this.provinceDataArray=function(a){this.stats=new Stats;var b=this.type;result=[];a=this.info[a];for(var d in a){var c=a[d],f;for(f in c){var g=c[f],h=g.o[b];h&&(result.push({a:f,r:g.r,g:g.g,p:h,t:d,l:g.l,d:null}),this.stats.add(h))}}return result};
this.nearData=function(a){var b=a.latlng();if(b){a=a.radius;var d={},c;for(c in this.info){var f=this.info[c];d[c]={};for(var g in f){var h=f[g];d[c][g]={};for(var r in h){var n=h[r],m=n.g;m&&distance(m,b,a)&&(d[c][g][r]=n)}Object.keys(d[c][g]).length||delete d[c][g]}Object.keys(d[c]).length||delete d[c]}return d}};this.nearDataArray=function(a,b,d){var c=a.latlng();if(c){a=a.radius;this.stats=new Stats;var f=[],g;for(g in this.info){var h=this.info[g],r;for(r in h){var n=h[r],m;for(m in n){var p=
n[m];if(p.o.hasOwnProperty(b)){var t=p.g;if(t){var s=distance(t,c,a);if(s){var q=p.o[b];f.push({a:m,prov:g,g:t,p:q,t:r,l:p.l,d:s});this.stats.add(q)}}}}}}return d?f.sort(function(a,b){return a[d]<b[d]?-1:1}):f}};this.routeData=function(a){var b=[],d=this.type;this.stats=new Stats;var c=Km2LL,f;for(f in this.info){var g=this.info[f],h;for(h in g){var r=g[h],n;for(n in r){var m=r[n],p=m.o[d];if(p){var t=m.g;if(t){for(var s=!1,q=new google.maps.LatLng(t[0],t[1]),l=0;l<a.length-1;l++)if(distance(t,[a[l].lat(),
a[l].lng()],c))s=!0;else if(distance(t,[a[l+1].lat(),a[l+1].lng()],c))s=!0;else if((new google.maps.LatLngBounds(a[l],a[l+1])).contains(q)){var u=distanceOrto(q,a[l],a[l+1]);u<c&&(s=!0)}s&&(b.push({a:n,r:m.r,g:t,p:p,t:h,l:m.l,d:u}),this.stats.add(p))}}}}}return b};this.callback=a;this.date=this.info=this.stats=null;this.type="1";a=localStorage.gasole;!a||(new Date).getTime()-parseInt(JSON.parse(a).ts)>LS_EXPIRE?(a=new XMLHttpRequest,a.gasole=this,a.onload=function(){var a=null,b=JSON.parse(this.responseText);
b._meta?(a=new Date(b._meta.ts),b=b._data):a=new Date;this.gasole.init(b,a);a={ts:a.getTime(),data:b,stats:this.gasole.stats};localStorage.setItem("gasole",JSON.stringify(a));this.gasole.callback&&this.gasole.callback()},a.open("GET","/api/gasole"),a.send()):(a=JSON.parse(a),this.init(a.data,new Date(a.ts),a.stats),this.callback&&this.callback())}
function fillPriceDigits(a,e){a.innerHTML="";for(var b=e.toFixed(3),d=0;d<b.length;d++){var c=document.createElement("div");c.className="back";"."==b[d]?c.className+=" point":c.textContent=8;var f=document.createElement("div");f.className="digit";f.textContent=b[d];c.appendChild(f);a.appendChild(c)}}function gasoleProcess(a,e){for(var b in a){var d=a[b],c;for(c in d){var f=d[c],g;for(g in f)e(f[g],b,c,g)}}}
function stopEvent(a){a.cancelBubble=!0;a.returnValue=!1;a.stopPropagation&&a.stopPropagation();a.preventDefault&&a.preventDefault();return!1}function sortName(a,e){function b(a){a=a.toLowerCase();a=a.replace(RegExp(/\s/g),"");a=a.replace(RegExp(/[\u00e0\u00e1]/g),"a");a=a.replace(RegExp(/[\u00e8\u00e9]/g),"e");a=a.replace(RegExp(/[\u00ec\u00ed]/g),"i");a=a.replace(RegExp(/[\u00f2\u00f3]/g),"o");return a=a.replace(RegExp(/[\u00f9\u00fa]/g),"u")}return b(a)<b(e)?-1:1}
function formatUpdate(a){var e;e="Precios actualizados el "+(a.getDate()+" de "+MONTHS[a.getMonth()]);return e+=" a las "+("0"+a.getHours()).slice(-2)+":"+("0"+a.getMinutes()).slice(-2)}Array.prototype.filter||(Array.prototype.filter=function(a,e){if(null==this)throw new TypeError;var b=Object(this),d=b.length>>>0;if("function"!=typeof a)throw new TypeError;for(var c=[],f=0;f<d;f++)if(f in b){var g=b[f];a.call(e,g,f,b)&&c.push(g)}return c});var TIME;function tic(){TIME=(new Date).getTime()}
function toc(a){console.log((a?a+" :":"Transcurridos: ")+((new Date).getTime()-TIME)+" ms")}
function breadCrumb(a,e){var b=document.getElementById(a);if(b){b.innerHTML="<a href='/' class='bc'>Gasolineras</a><span class='sprt breadcrumb'>&nbsp;</span>";var d=window.location.pathname.split("/"),c=document.createElement("a");c.className="bc";if("resultados"==d[1])c.textContent="Cerca de "+decodeName(d[2]),c.href="#",b.appendChild(c);else{var f=decodeName(d[2]);c.textContent=f;c.title="Ver todas las gasolineras en la provincia de "+f;var g="/gasolineras/"+d[2];c.href=g;b.appendChild(c);d[3]&&
(b.innerHTML+="<span class='sprt breadcrumb'>&nbsp;</span>",c=document.createElement("a"),c.className="bc",f=decodeName(d[3]),c.textContent=f,c.title="Ver todas las gasolineras en la localidad de "+f,c.href=g+"/"+d[3],b.appendChild(c));d[4]&&(b.innerHTML+="<span class='sprt breadcrumb'>&nbsp;</span>",c=document.createElement("a"),c.className="bc",c.textContent="Gasolinera "+(e?e:"")+" en "+toTitle(decodeName(d[4])),c.href=window.location.pathname,b.appendChild(c))}}};(function(a){function e(){document.getElementById("results-title").textContent="Buscando\u2026";var a=document.getElementById("results-list");a.innerHTML="";var b=new Image;b.src="/img/search-loader.gif";a.appendChild(b)}function b(){function a(){e();navigator.geolocation.getCurrentPosition(function(a){var b=new google.maps.Geocoder;a=new google.maps.LatLng(a.coords.latitude,a.coords.longitude);b.geocode({latLng:a},d)},function(a){switch(a.code){case a.PERMISSION_DENIED:console.log("User denied the request for Geolocation.");
break;case a.POSITION_UNAVAILABLE:console.log("Location information is unavailable.");break;case a.TIMEOUT:console.log("The request to get user location timed out.");break;case a.UNKNOWN_ERROR:console.log("An unknown error occurred.")}})}var b=document.getElementById("current-loc");navigator.geolocation?addEvent(b,"click",a):b.style.display="none"}function d(a,b){document.getElementById("results").style.display="block";var c=document.getElementById("results-list"),d=document.getElementById("results-title");
c.innerHTML="";if(b==google.maps.GeocoderStatus.OK){for(var e=0,f,s=0;s<a.length;s++){var q=a[s],l=q.geometry.location,q=q.formatted_address,u=encodeURIComponent(q);q.match(/Espa\u00f1a$/)&&(e++,f="/resultados/"+u+"/"+l.lat()+"/"+l.lng(),l=document.createElement("li"),u=document.createElement("a"),u.href=f,u.textContent=q,u.onclick=function(){window.location=this.href+"/"+g.getvalue()},l.appendChild(u),c.appendChild(l))}if(1==e)window.location=f+"/"+g.getvalue();else if(1<e){d.textContent="Encontrados "+
e+" lugares:";return}}d.innerHTML="No se ha podido encontrar el lugar. Int\u00e9ntalo de nuevo"}function c(){var a=document.getElementById("address").value;if(a){var b=window.location.pathname.split("/");if("resultados"==b[1]&&encodeURIComponent(a)==b[2])b[b.length-1]=g.getvalue(),window.location=b.join("/");else return e(),(new google.maps.Geocoder).geocode({address:a,region:"es"},d),!1}}function f(a){function b(a){barDiv.style.width=Math.round((a-c.min)*sliderDiv.clientWidth/(c.max-c.min))+"px";
barDiv.textContent="Radio: "+a.toFixed(1)+" km."}this.value=2.6;this.max=20;this.min=1;this.step=0.5;this.candidate=this.value;var c=this;sliderDiv=document.getElementById(a);barDiv=document.createElement("div");padDiv=document.createElement("div");sliderDiv.style.position="relative";barDiv.style.position="absolute";barDiv.style.left="0";barDiv.style.top="0";barDiv.className="bar";sliderDiv.appendChild(barDiv);padDiv.style.position="absolute";padDiv.style.top=padDiv.style.left=padDiv.style.right=
padDiv.style.bottom=0;sliderDiv.appendChild(padDiv);this.getvalue=function(){return Math.round(this.value/this.step)*this.step};b(this.value);addEvent(padDiv,"mousemove",function(a){a=a.clientX-2-this.getBoundingClientRect().left;a=c.min+a*(c.max-c.min)/this.clientWidth;a=Math.round(a/c.step)*c.step;a=Math.max(c.min,a);a=Math.min(c.max,a);c.candidate=a;b(c.candidate)});addEvent(padDiv,"click",function(a){c.value=c.candidate;b(c.value)});addEvent(padDiv,"mouseout",function(a){b(c.value)})}var g=null;
addEvent(a,"load",function(){var a=document.getElementById("menu-search");addEvent(a,"click",function(b){stopEvent(b);this.className="menu search enabled";addEvent(document,"click",function(){a.className="menu search"})});document.getElementById("search-form").onsubmit=c;document.getElementById("search-b").onclick=c;lockScroll("results-list");g=new f("search-d");b()})})(window);(function(a){addEvent(a,"load",function(){initProvLinks("province");new Gasole(function(){var a=this.stats.stats,d,c,e;for(e in a)d=FUEL_OPTIONS[e]["short"],c=a[e],fillPriceDigits(document.getElementById("p_"+d).children[0],c.mu),fillPriceDigits(document.getElementById("min_"+d).children[0],c.min),fillPriceDigits(document.getElementById("max_"+d).children[0],c.max);document.getElementById("updated").innerHTML="<sup>*</sup> "+formatUpdate(this.date)});for(var a in PROVS)prov=document.getElementById("P"+
PROVS[a]),addEvent(prov,"click",function(){var a=getProvName(this.id.slice(1));window.location="/gasolineras/"+encodeName(a)}),addEvent(prov,"mouseover",function(){var a=getProvName(this.id.slice(1));document.getElementById("prov-current").textContent=a}),addEvent(prov,"mouseout",function(){document.getElementById("prov-current").textContent="lista de provincias"})})})(window);
