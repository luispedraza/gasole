var fs=require("fs"),qs=require("querystring");function TumblrClient(a){this.credentials=a||{}}var request;module.exports={Client:TumblrClient,createClient:function(a){return new TumblrClient(a)},request:function(a){request=a}};
var baseURL="http://api.tumblr.com/v2",calls={postCreation:function(a,b,c){return function(d,e,f){requireValidation(e,b);e.type=a;c||delete e.data;this._post(blogPath(d,"/post"),e,f)}},getWithOptions:function(a){return function(b,c){isFunction(b)&&(c=b,b={});this._get(a,b,c)}},blogList:function(a){return function(b,c,d){isFunction(c)&&(d=c,c={});this._get(blogPath(b,a),c,d)}}};
TumblrClient.prototype={tagged:function(a,b,c){isFunction(b)&&(c=b,b={});b=b||{};b.tag=a;this._get("/tagged",b,c,!0)},blogInfo:function(a,b){this._get(blogPath(a,"/info"),{},b,!0)},avatar:function(a,b,c){isFunction(b)&&(c=b,b=null);this._get(blogPath(a,b?"/avatar/"+b:"/avatar"),{},c,!0)},blogLikes:function(a,b,c){isFunction(b)&&(c=b,b={});this._get(blogPath(a,"/likes"),b,c,!0)},followers:function(a,b,c){isFunction(b)&&(c=b,b={});this._get(blogPath(a,"/followers"),b,c)},posts:function(a,b,c){isFunction(b)&&
(c=b,b={});b=b||{};this._get(blogPath(a,b.type?"/posts/"+b.type:"/posts"),b,c,!0)},queue:calls.blogList("/posts/queue"),drafts:calls.blogList("/posts/draft"),submissions:calls.blogList("/posts/submission"),edit:function(a,b,c){this._post(blogPath(a,"/post/edit"),b,c)},reblog:function(a,b,c){this._post(blogPath(a,"/post/reblog"),b,c)},deletePost:function(a,b,c){this._post(blogPath(a,"/post/delete"),{id:b},c)},photo:calls.postCreation("photo",["data","source"],!0),audio:calls.postCreation("audio",["data",
"external_url"],!0),video:calls.postCreation("video",["data","embed"],!0),quote:calls.postCreation("quote",["quote"],!1),text:calls.postCreation("text",["body"],!1),link:calls.postCreation("link",["url"],!1),chat:calls.postCreation("chat",["conversation"],!1),userInfo:function(a){this._get("/user/info",{},a)},likes:function(a,b){isFunction(a)&&(b=a,a={});this._get("/user/likes",a,b)},follow:function(a,b){this._post("/user/follow",{url:a},b)},unfollow:function(a,b){this._post("/user/unfollow",{url:a},
b)},like:function(a,b,c){this._post("/user/like",{id:a,reblog_key:b},c)},unlike:function(a,b,c){this._post("/user/unlike",{id:a,reblog_key:b},c)},dashboard:calls.getWithOptions("/user/dashboard"),following:calls.getWithOptions("/user/following"),_get:function(a,b,c,d){b=b||{};d&&(b.api_key=this.credentials.consumer_key);request.get({url:baseURL+a+"?"+qs.stringify(b),json:!0,oauth:this.credentials,followRedirect:!1},requestCallback(c))},_post:function(a,b,c){var d=b.data;delete b.data;a=request.post(baseURL+
a,function(a,b,d){d=JSON.parse(d);requestCallback(c)(a,b,d)});a.form(b);a.oauth(this.credentials);delete a.headers["content-type"];delete a.body;var e=a.form(),f;for(f in b)e.append(f,b[f]);d&&e.append("data",fs.createReadStream(d));b=e.getHeaders();for(f in b)a.headers[f]=b[f]}};
var requireValidation=function(a,b){for(var c=0,d=0;d<b.length;d++)a[b[d]]&&(c+=1);if(1===b.length){if(0===c)throw Error('Missing required field: "'+b[0]+'"');}else if(1<b.length){if(0===c)throw Error("Missing one of: "+b.join(","));if(1<c)throw Error("Can only use one of: "+b.join(","));}};function blogPath(a,b){return"/blog/"+(-1!==a.indexOf(".")?a:a+".tumblr.com")+b}
function requestCallback(a){if(a)return function(b,c,d){return b?a(b):400<=c.statusCode?(b=d.meta?d.meta.msg:d.error,a(Error("API error: "+c.statusCode+" "+b))):a(null,d.response)}}function isFunction(a){return"[object Function]"==Object.prototype.toString.call(a)};window.addEventListener("load",function(){require("tumblr.js").createClient({consumer_key:"51asUdK1vAdmKgeuXph5T1X4oUpvw6pTSwtw8tx9Ttxg01Z7KU",consumer_secret:"GMtKlfFFMPJKIQiuewlvgWIvgMuSpuwB4buCMhAIL5zQNAnnMo",token:"<oauth token>",token_secret:"<oauth token secret>"})});function searchLocation(a){var b="",c="",d="";"object"==typeof a?(b=a.geometry.location.lat(),c=a.geometry.location.lng(),d=encodeURI(a.formatted_address)):"string"==typeof a&&(c=a.split("##"),d=c[0],b=c[1],c=c[2]);a=document.getElementById("search-d").getAttribute("value");window.location="/resultados/"+d+"/"+b+"/"+c+"/"+a}
function showLoader(){document.getElementById("results-title").textContent="Buscando\u2026";var a=document.getElementById("results-list");a.innerHTML="";var b=new Image;b.src="/img/search-loader.gif";a.appendChild(b)}function initGeoloc(){var a=document.getElementById("current-loc");navigator.geolocation?a.addEventListener("click",loadCurrentPosition):a.style.display="none"}
function showResult(a,b){document.getElementById("results").style.display="block";var c=document.getElementById("results-list");c.innerHTML="";if(b==google.maps.GeocoderStatus.OK){for(var d=0,e=0,f=0;f<a.length;f++){var g=a[f].formatted_address;if(g.match(/Espa\u00f1a$/)){console.log(typeof a[f]);d++;var e=f,h=document.createElement("li"),m=document.createElement("a");h.appendChild(m);m.textContent=g;m.href="#";m.setAttribute("loc",[a[f].formatted_address,a[f].geometry.location.lat(),a[f].geometry.location.lng()].join("##"));
m.addEventListener("click",function(){searchLocation(this.getAttribute("loc"))});c.appendChild(h)}}if(1==d){searchLocation(a[e]);return}if(1<d){document.getElementById("results-title").textContent="Encontrados "+d+" lugares:";return}}c.innerHTML="<li>No se ha podido encontrar el lugar. Int\u00e9ntalo de nuevo</li>"}
function loadCurrentPosition(){showLoader();navigator.geolocation.getCurrentPosition(function(a){var b=new google.maps.Geocoder;a=new google.maps.LatLng(a.coords.latitude,a.coords.longitude);b.geocode({latLng:a},showResult)},function(a){switch(a.code){case a.PERMISSION_DENIED:console.log("User denied the request for Geolocation.");break;case a.POSITION_UNAVAILABLE:console.log("Location information is unavailable.");break;case a.TIMEOUT:console.log("The request to get user location timed out.");break;
case a.UNKNOWN_ERROR:console.log("An unknown error occurred.")}})}function geoCode(){showLoader();var a=document.getElementById("address").value;(new google.maps.Geocoder).geocode({address:a,region:"es"},showResult)}
function mySlider(a){function b(a){var b=a.getElementsByClassName("val")[0],c=parseFloat(a.getAttribute("newval")),g=parseFloat(a.getAttribute("max")),h=parseFloat(a.getAttribute("min"));b.style.width=(c-h)*a.clientWidth/(g-h)-5+"px";b.textContent="Radio: "+c.toFixed(1)+" km.";a.setAttribute("value",c)}a.style.position="relative";var c=document.createElement("div");c.style.position="absolute";c.style.left="0";c.style.top="0";c.textContent="Radio: "+a.getAttribute("value")+" km.";c.className="val";
a.appendChild(c);c=document.createElement("div");c.style.position="absolute";c.style.left="0";c.style.top="0";c.className="new-val";c.style.display="none";a.appendChild(c);a.setAttribute("newval",a.getAttribute("value"));b(a);a.addEventListener("mousemove",function(a){var b=this.getElementsByClassName("new-val")[0];b.style.display="block";var c=a.clientX-this.getBoundingClientRect().left;b.style.width=c-5+"px";a=parseFloat(this.getAttribute("max"));var g=parseFloat(this.getAttribute("min")),h=parseFloat(this.getAttribute("step")),
c=g+c*(a-g)/this.clientWidth,c=parseInt(c/h)*h;c<g&&(c=g);c>a&&(c=a);b.textContent="Radio: "+c.toFixed(1)+" km.";this.setAttribute("newval",c)});a.addEventListener("click",function(a){this.getElementsByClassName("new-val")[0].style.display="none";b(this)});a.addEventListener("mouseout",function(a){this.getElementsByClassName("new-val")[0].style.display="none"})}
window.addEventListener("load",function(){for(var a=document.getElementsByClassName("my-slider"),b=0;b<a.length;b++)mySlider(a[b]);if(a=document.getElementById("map")){a=a.getElementsByClassName("prov");for(b=0;b<a.length;b++)a[b].addEventListener("click",function(){})}initGeoloc()});var Lat2Km=111.03461,Km2Lat=0.009006,Lon2Km=85.39383,Km2Lon=0.01171,LL2Km=98.2,Km2LL=0.010183,FUEL_OPTIONS={1:{"short":"G95",name:"Gasolina 95"},3:{"short":"G98",name:"Gasolina 98"},4:{"short":"GOA",name:"Gas\u00f3leo Automoci\u00f3n"},5:{"short":"NGO",name:"Nuevo Gas\u00f3leo A"},6:{"short":"GOB",name:"Gas\u00f3leo B"},7:{"short":"GOC",name:"Gas\u00f3leo C"},8:{"short":"BIOD",name:"Biodi\u00e9sel"}},CHART_OPTIONS=[{id:"G98",color:"#339933",name:"Gasolina 98"},{id:"G95",color:"#006633",name:"Gasolina 95"},
{id:"NGO",color:"#aaa",name:"Nuevo Gas\u00f3leo A"},{id:"BIOD",color:"#f1aa41",name:"Biodi\u00e9sel"},{id:"GOA",color:"#000",name:"Gas\u00f3leo A"},{id:"GOC",color:"#FF3300",name:"Gas\u00f3leo C"},{id:"GOB",color:"#CC3333",name:"Gas\u00f3leo B"}],PROVS={"\u00c1lava":"01",Albacete:"02",Alicante:"03","Almer\u00eda":"04",Asturias:"33","\u00c1vila":"05",Badajoz:"06","Balears (Illes)":"07",Barcelona:"08",Burgos:"09","C\u00e1ceres":"10","C\u00e1diz":"11",Cantabria:"39","Castell\u00f3n / Castell\u00f3":"12",
Ceuta:"51","Ciudad Real":"13","C\u00f3rdoba":"14","Coru\u00f1a (A)":"15",Cuenca:"16",Girona:"17",Granada:"18",Guadalajara:"19","Guip\u00fazcoa":"20",Huelva:"21",Huesca:"22","Ja\u00e9n":"23","Le\u00f3n":"24",Lleida:"25",Lugo:"27",Madrid:"28","M\u00e1laga":"29",Melilla:"52",Murcia:"30",Navarra:"31",Ourense:"32",Palencia:"34","Palmas (Las)":"35",Pontevedra:"36","Rioja (La)":"26",Salamanca:"37","Santa Cruz De Tenerife":"38",Segovia:"40",Sevilla:"41",Soria:"42",Tarragona:"43",Teruel:"44",Toledo:"45","Valencia / Val\u00e8ncia":"46",
Valladolid:"47",Vizcaya:"48",Zamora:"49",Zaragoza:"50"},MONTHS="Enero Febrero Marzo Abril Mayo Junio Julio Agosto Septiembre Octubre Noviembre Diciembre".split(" "),COLORS={stroke:"#fff",min:"#36AE34",max:"#f00",mu:"#3399CC"},info=null,LS_EXPIRE=36E5,APIS={gasolineras:"api",resultados:"geo",ficha:"api"};
function lockScroll(a){"string"==typeof a&&(a=document.getElementById(a));a.addEventListener("mouseover",function(){document.body.style.overflow="hidden"});a.addEventListener("mouseout",function(){document.body.style.overflow="auto"})}
function initProvLinks(a){a=document.getElementById(a);for(var b in PROVS){var c=document.createElement("li"),d=document.createElement("a");d.title="Todas las gasolineras de "+b;d.textContent=b;d.href="/gasolineras/"+encodeName(b);c.appendChild(d);a.appendChild(c)}}function getProvName(a){for(k in PROVS)if(PROVS[k]==a)return k}function clearHtmlTags(a){return a.replace(/(<([^>]+)>)/ig,"")}
function toTitle(a){return a.replace(" [N]","").replace(/^CARRETERA ?|^CR\.? ?/i,"CTRA. ").replace(/(CTRA. )+/i,"CTRA. ").replace(/^AVENIDA ?|^AV. ?/i,"AVDA. ").replace(/^POLIGONO INDUSTRIAL ?|POLIGONO ?|P\.I\. ?/i,"POL. IND. ").replace(/^CALLE |^CL\.? ?|C\/ ?/i,"C/ ").replace(/^RONDA |^RD /i,"RDA. ").replace(/^AUTOPISTA (AUTOPISTA ?)?/i,"AU. ").replace(/^PLAZA ?/i,"PL. ").replace(/^PASEO (PASEO ?)?/i,"P\u00ba ").replace(/^TRAVESS?[I\u00cd]A /i,"TRAV. ").replace(/^V[i\u00ed]A (V[I\u00cd]A )?/i,"V\u00cdA ").replace(/\B[^\d- ]+[ $]/g,
function(a){return a.toLowerCase()}).replace(/\b[NAE]-.+\b/,function(a){return a.toUpperCase()}).replace(/\[D\]$/,"(m.d.)").replace(/\[I\]$/,"(m.i.)").replace(/ \[N\]$/,"")}
function getLogo(a){return a&&(a=a.replace(/camspa/i,"campsa"),logo=a.match(/\b(abycer|agla|alcampo|andamur|a\.?n\.? energeticos|avia|bonarea|b\.?p\.?|buquerin|campsa|carmoned|carrefour|cepsa|empresoil|eroski|esclatoil|galp|gasolben|iberdoex|leclerc|makro|meroil|norpetrol|petrem|petrocat|petromiralles|petronor|repostar|repsol|saras|shell|simply|staroil|tamoil|valcarce)\b/i))?logo[0].replace(/\./g,"").replace(/ /g,"_").toLowerCase():null}
function decodeName(a){return decodeURI(a).replace(/_/g," ").replace(/\|/g,"/")}function prettyName(a){a.match("/")&&(a=a.split("/")[1]);a.match(/\)$/)&&(a=a.match(/\(.+\)$/g)[0].replace("(","").replace(")"," ")+a.split(" (")[0]);return a}function decodeArray(a){for(var b=0;b<a.length;b++)a[b]=decodeName(a[b]);return a}function encodeName(a){return a.replace(/\//g,"|").replace(/ /g,"_")}function checkLocalStorage(){try{return"localStorage"in window&&null!==window.localStorage}catch(a){return!1}}
function getKey(){return window.location.pathname.split("/").slice(1).join("*")}
function getApiData(a){var b=getKey();if(checkLocalStorage()&&localStorage.hasOwnProperty(b))if(localData=JSON.parse(localStorage[b]),(new Date).getTime()-localData.ts>LS_EXPIRE)localStorage.removeItem(b);else{a(localData.data);return}var c=new XMLHttpRequest;c.onload=function(c){c=JSON.parse(this.responseText);checkLocalStorage()&&localStorage.setItem(b,JSON.stringify({ts:(new Date).getTime(),data:c}));a(c)};var d=window.location.pathname.split("/")[1];c.open("GET",document.URL.replace(d,APIS[d]));
c.send()}function distance(a,b,c){var d=Math.abs(a[0]-b[0])*Lat2Km;return d<c&&(a=Math.abs(a[1]-b[1])*Lon2Km,a<c&&(d=Math.sqrt(Math.pow(d,2)+Math.pow(a,2)),d<c))?d:null}function distanceOrto(a,b,c){if(b.lng()==c.lng())return Math.abs(a.lat()-b.lat());c=(c.lat()-b.lat())/(c.lng()-b.lng());b=b.lat()-c*b.lng();return Math.abs(c*a.lng()-a.lat()+b)/Math.sqrt(c*c+1)}
function properRDP(a,b){"undefined"==typeof b&&(b=1*Km2LL);var c=a[0],d=a[a.length-1];if(3>a.length)return a;for(var e=-1,f=0,g=1;g<a.length-1;g++){var h=distanceOrto(a[g],c,d);h>f&&(f=h,e=g)}return f>b?(c=a.slice(0,e+1),e=a.slice(e),c=properRDP(c,b),e=properRDP(e,b),c.slice(0,c.length-1).concat(e)):[c,d]}
function SearchLocations(){this.locs=[];this.radius=2;this.length=function(){return this.locs.length};this.add=function(a,b){this.locs.push({name:a,latlng:b})};this.latlng=function(){return 1==this.length()?this.locs[0].latlng:null};this.name=function(){return 1==this.length()?this.locs[0].name:null};this.get=function(a){return this.locs[a]};this.select=function(a){this.locs=[this.locs[a]]};this.clear=function(){this.locs=[]}}
function Stats(){this.n=0;this.max=this.min=this.mu=this.range=null;this.smin=[];this.smax=[];this.g=null;this.range=function(){null==this.range&&(this.range=this.max-this.min);return this.range};this.add=function(a,b,c){this.mu?(a>this.max?(this.max=a,this.smax=[b]):a==this.max?this.smax.push(b):a<this.min?(this.min=a,this.smin=[b]):a==this.min&&this.smin.push(b),this.mu=(this.mu*this.n+a)/++this.n):(this.max=this.min=this.mu=a,this.smin=[b],this.smax=[b],this.n=1);c&&(this.g?(c[0]<this.g[0]?this.g[0]=
c[0]:c[0]>this.g[1]&&(this.g[1]=c[0]),c[1]<this.g[2]?this.g[2]=c[1]:c[1]>this.g[3]&&(this.g[3]=c[1])):this.g=[c[0],c[0],c[1],c[1]])}}function GasoleStats(a){var b=this.stats={};this.provinces={};for(var c in a){var d=a[c],e=this.provinces[c]={},f;for(f in d){var g=d[f],h;for(h in g){datas=g[h];var m=datas.g,l;for(l in datas.o)e.hasOwnProperty(l)||(e[l]=new Stats),b.hasOwnProperty(l)||(b[l]=new Stats),e[l].add(datas.o[l],[c,f,h],m),b[l].add(datas.o[l],[c,f,h],m)}}}}
function Gasole(a){this.color=function(a){var c=this.stats.range();if(0!=c){a=(a-this.stats.min)/c;if(0.33>a)return COLORS.min;if(0.66<a)return COLORS.max}return COLORS.mu};this.init=function(a,c,d){this.info=a;this.date=c;this.stats=d?d:new GasoleStats(this.info)};this.provinceDataArray=function(a){this.stats=new Stats;var c=this.type;result=[];a=this.info[a];for(var d in a){var e=a[d],f;for(f in e){var g=e[f],h=g.o[c];h&&(result.push({a:f,r:g.r,g:g.g,p:h,t:d,l:g.l,d:null}),this.stats.add(h))}}return result};
this.nearData=function(a){var c=a.latlng();if(c){a=a.radius;var d={},e;for(e in this.info){var f=this.info[e];d[e]={};for(var g in f){var h=f[g];d[e][g]={};for(var m in h){var l=h[m],n=l.g;n&&distance(n,c,a)&&(d[e][g][m]=l)}Object.keys(d[e][g]).length||delete d[e][g]}Object.keys(d[e]).length||delete d[e]}return d}};this.nearDataArray=function(a,c,d){console.log(a);var e=a.latlng();if(e){a=a.radius;this.stats=new Stats;var f=[],g;for(g in this.info){var h=this.info[g],m;for(m in h){var l=h[m],n;for(n in l){var r=
l[n];if(r.o.hasOwnProperty(c)){var p=r.g;if(p){var s=distance(p,e,a);if(s){var t=r.o[c];f.push({a:n,r:r.r,g:p,p:t,t:m,l:r.l,d:s});this.stats.add(t)}}}}}}return d?f.sort(function(a,b){return a[d]<b[d]?-1:1}):f}};this.routeData=function(a){var c=[],d=this.type;this.stats=new Stats;var e=Km2LL,f;for(f in this.info){var g=this.info[f],h;for(h in g){var m=g[h],l;for(l in m){var n=m[l],r=n.o[d];if(r){var p=n.g;if(p){for(var s=!1,t=new google.maps.LatLng(p[0],p[1]),q=0;q<a.length-1;q++)if(distance(p,[a[q].lat(),
a[q].lng()],e))s=!0;else if(distance(p,[a[q+1].lat(),a[q+1].lng()],e))s=!0;else if((new google.maps.LatLngBounds(a[q],a[q+1])).contains(t)){var u=distanceOrto(t,a[q],a[q+1]);u<e&&(s=!0)}s&&(c.push({a:l,r:n.r,g:p,p:r,t:h,l:n.l,d:u}),this.stats.add(r))}}}}}return c};this.callback=a;this.date=this.info=this.stats=null;this.type="1";a=localStorage.gasole;!a||(new Date).getTime()-parseInt(JSON.parse(a).ts)>LS_EXPIRE?(a=new XMLHttpRequest,a.gasole=this,a.onload=function(){var a=new Date;this.gasole.init(JSON.parse(this.responseText),
a);localStorage.setItem("gasole",'{"ts": '+a.getTime()+',"data": '+this.responseText+',"stats": '+JSON.stringify(this.gasole.stats)+"}");this.gasole.callback&&this.gasole.callback()},a.open("GET","/api/All"),a.send()):(a=JSON.parse(a),this.init(a.data,new Date(a.ts),a.stats),this.callback&&this.callback())}
function fillPriceDigits(a,b){a.innerHTML="";for(var c=b.toFixed(3),d=0;d<c.length;d++){var e=document.createElement("div");e.className="back";"."==c[d]?e.className+=" point":e.textContent=8;var f=document.createElement("div");f.className="digit";f.textContent=c[d];e.appendChild(f);a.appendChild(e)}};
