(function(){var d=null;function e(a){return function(b){this[a]=b;};}function h(a){return function(){return this[a];};}var j;function k(a,b,c){this.extend(k,google.maps.OverlayView);this.c=a;this.a=[];this.f=[];this.ca=[53,56,66,78,90];this.j=[];this.A=!1;c=c||{};this.g=c.gridSize||60;this.l=c.minimumClusterSize||2;this.J=c.maxZoom||d;this.j=c.styles||[];this.X=c.imagePath||this.Q;this.W=c.imageExtension||this.P;this.O=!0;if(c.zoomOnClick!=void 0)this.O=c.zoomOnClick;this.r=!1;if(c.averageCenter!=void 0)this.r=c.averageCenter;l(this);this.setMap(a);this.K=this.c.getZoom();var f=this;google.maps.event.addListener(this.c,"zoom_changed",function(){var a=f.c.getZoom();if(f.K!=a)f.K=a,f.m();});google.maps.event.addListener(this.c,"idle",function(){f.i();});b&&b.length&&this.C(b,!1);}j=k.prototype;j.Q="http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/images/m";j.P="png";j.extend=function(a,b){return function(a){for(var b in a.prototype)this.prototype[b]=a.prototype[b];return this;}.apply(a,[b]);};j.onAdd=function(){if(!this.A)this.A=!0,n(this);};j.draw=function(){};function l(a){if(!a.j.length)for(var b=0,c;c=a.ca[b];b++)a.j.push({url:a.X+(b+1)+"."+a.W,height:c,width:c});}j.S=function(){for(var a=this.o(),b=new google.maps.LatLngBounds(),c=0,f;f=a[c];c++)b.extend(f.getPosition());this.c.fitBounds(b);};j.z=h("j");j.o=h("a");j.V=function(){return this.a.length;};j.ba=e("J");j.I=h("J");j.G=function(a,b){for(var c=0,f=a.length,g=f;g!==0;)g=parseInt(g/10,10),c++;c=Math.min(c,b);return{text:f,index:c};};j.$=e("G");j.H=h("G");j.C=function(a,b){for(var c=0,f;f=a[c];c++)q(this,f);b||this.i();};function q(a,b){b.s=!1;b.draggable&&google.maps.event.addListener(b,"dragend",function(){b.s=!1;a.L();});a.a.push(b);}j.q=function(a,b){q(this,a);b||this.i();};function r(a,b){var c=-1;if(a.a.indexOf)c=a.a.indexOf(b);else for(var f=0,g;g=a.a[f];f++)if(g==b){c=f;break;}if(c==-1)return !1;b.setMap(d);a.a.splice(c,1);return !0;}j.Y=function(a,b){var c=r(this,a);return !b&&c?(this.m(),this.i(),!0):!1;};j.Z=function(a,b){for(var c=!1,f=0,g;g=a[f];f++)g=r(this,g),c=c||g;if(!b&&c)return this.m(),this.i(),!0;};j.U=function(){return this.f.length;};j.getMap=h("c");j.setMap=e("c");j.w=h("g");j.aa=e("g");j.v=function(a){var b=this.getProjection(),c=new google.maps.LatLng(a.getNorthEast().lat(),a.getNorthEast().lng()),f=new google.maps.LatLng(a.getSouthWest().lat(),a.getSouthWest().lng()),c=b.fromLatLngToDivPixel(c);c.x+=this.g;c.y-=this.g;f=b.fromLatLngToDivPixel(f);f.x-=this.g;f.y+=this.g;c=b.fromDivPixelToLatLng(c);b=b.fromDivPixelToLatLng(f);a.extend(c);a.extend(b);return a;};j.R=function(){this.m(!0);this.a=[];};j.m=function(a){for(var b=0,c;c=this.f[b];b++)c.remove();for(b=0;c=this.a[b];b++)c.s=!1,a&&c.setMap(d);this.f=[];};j.L=function(){var a=this.f.slice();this.f.length=0;this.m();this.i();window.setTimeout(function(){for(var b=0,c;c=a[b];b++)c.remove();},0);};j.i=function(){n(this);};function n(a){if(a.A)for(var b=a.v(new google.maps.LatLngBounds(a.c.getBounds().getSouthWest(),a.c.getBounds().getNorthEast())),c=0,f;f=a.a[c];c++)if(!f.s&&b.contains(f.getPosition())){for(var g=a,u=4E4,o=d,v=0,m=void 0;m=g.f[v];v++){var i=m.getCenter();if(i){var p=f.getPosition();if(!i||!p)i=0;else var w=(p.lat()-i.lat())*Math.PI/180,x=(p.lng()-i.lng())*Math.PI/180,i=Math.sin(w/2)*Math.sin(w/2)+Math.cos(i.lat()*Math.PI/180)*Math.cos(p.lat()*Math.PI/180)*Math.sin(x/2)*Math.sin(x/2),i=6371*2*Math.atan2(Math.sqrt(i),Math.sqrt(1-i));i<u&&(u=i,o=m);}}o&&o.F.contains(f.getPosition())?o.q(f):(m=new s(g),m.q(f),g.f.push(m));}}function s(a){this.k=a;this.c=a.getMap();this.g=a.w();this.l=a.l;this.r=a.r;this.d=d;this.a=[];this.F=d;this.n=new t(this,a.z(),a.w());}j=s.prototype;j.q=function(a){var b;a:if(this.a.indexOf)b=this.a.indexOf(a)!=-1;else{b=0;for(var c;c=this.a[b];b++)if(c==a){b=!0;break a;}b=!1;}if(b)return !1;if(this.d){if(this.r)c=this.a.length+1,b=(this.d.lat()*(c-1)+a.getPosition().lat())/c,c=(this.d.lng()*(c-1)+a.getPosition().lng())/c,this.d=new google.maps.LatLng(b,c),y(this);}else this.d=a.getPosition(),y(this);a.s=!0;this.a.push(a);b=this.a.length;b<this.l&&a.getMap()!=this.c&&a.setMap(this.c);if(b==this.l)for(c=0;c<b;c++)this.a[c].setMap(d);b>=this.l&&a.setMap(d);a=this.c.getZoom();if((b=this.k.I())&&a>b)for(a=0;b=this.a[a];a++)b.setMap(this.c);else if(this.a.length<this.l)z(this.n);else{b=this.k.H()(this.a,this.k.z().length);this.n.setCenter(this.d);a=this.n;a.B=b;a.ga=b.text;a.ea=b.index;if(a.b)a.b.innerHTML=b.text;b=Math.max(0,a.B.index-1);b=Math.min(a.j.length-1,b);b=a.j[b];a.da=b.url;a.h=b.height;a.p=b.width;a.M=b.textColor;a.e=b.anchor;a.N=b.textSize;a.D=b.backgroundPosition;this.n.show();}return !0;};j.getBounds=function(){for(var a=new google.maps.LatLngBounds(this.d,this.d),b=this.o(),c=0,f;f=b[c];c++)a.extend(f.getPosition());return a;};j.remove=function(){this.n.remove();this.a.length=0;delete this.a;};j.T=function(){return this.a.length;};j.o=h("a");j.getCenter=h("d");function y(a){a.F=a.k.v(new google.maps.LatLngBounds(a.d,a.d));}j.getMap=h("c");function t(a,b,c){a.k.extend(t,google.maps.OverlayView);this.j=b;this.fa=c||0;this.u=a;this.d=d;this.c=a.getMap();this.B=this.b=d;this.t=!1;this.setMap(this.c);}j=t.prototype;j.onAdd=function(){this.b=document.createElement("DIV");if(this.t)this.b.style.cssText=A(this,B(this,this.d)),this.b.innerHTML=this.B.text;this.getPanes().overlayMouseTarget.appendChild(this.b);var a=this;google.maps.event.addDomListener(this.b,"click",function(){var b=a.u.k;google.maps.event.trigger(b,"clusterclick",a.u);b.O&&a.c.fitBounds(a.u.getBounds());});};function B(a,b){var c=a.getProjection().fromLatLngToDivPixel(b);c.x-=parseInt(a.p/2,10);c.y-=parseInt(a.h/2,10);return c;}j.draw=function(){if(this.t){var a=B(this,this.d);this.b.style.top=a.y+"px";this.b.style.left=a.x+"px";}};function z(a){if(a.b)a.b.style.display="none";a.t=!1;}j.show=function(){if(this.b)this.b.style.cssText=A(this,B(this,this.d)),this.b.style.display="";this.t=!0;};j.remove=function(){this.setMap(d);};j.onRemove=function(){if(this.b&&this.b.parentNode)z(this),this.b.parentNode.removeChild(this.b),this.b=d;};j.setCenter=e("d");function A(a,b){var c=[];c.push("background-image:url("+a.da+");");c.push("background-position:"+(a.D?a.D:"0 0")+";");typeof a.e==="object"?(typeof a.e[0]==="number"&&a.e[0]>0&&a.e[0]<a.h?c.push("height:"+(a.h-a.e[0])+"px; padding-top:"+a.e[0]+"px;"):c.push("height:"+a.h+"px; line-height:"+a.h+"px;"),typeof a.e[1]==="number"&&a.e[1]>0&&a.e[1]<a.p?c.push("width:"+(a.p-a.e[1])+"px; padding-left:"+a.e[1]+"px;"):c.push("width:"+a.p+"px; text-align:center;")):c.push("height:"+a.h+"px; line-height:"+a.h+"px; width:"+a.p+"px; text-align:center;");c.push("cursor:pointer; top:"+b.y+"px; left:"+b.x+"px; color:"+(a.M?a.M:"black")+"; position:absolute; font-size:"+(a.N?a.N:11)+"px; font-family:Arial,sans-serif; font-weight:bold");return c.join("");}window.MarkerClusterer=k;k.prototype.addMarker=k.prototype.q;k.prototype.addMarkers=k.prototype.C;k.prototype.clearMarkers=k.prototype.R;k.prototype.fitMapToMarkers=k.prototype.S;k.prototype.getCalculator=k.prototype.H;k.prototype.getGridSize=k.prototype.w;k.prototype.getExtendedBounds=k.prototype.v;k.prototype.getMap=k.prototype.getMap;k.prototype.getMarkers=k.prototype.o;k.prototype.getMaxZoom=k.prototype.I;k.prototype.getStyles=k.prototype.z;k.prototype.getTotalClusters=k.prototype.U;k.prototype.getTotalMarkers=k.prototype.V;k.prototype.redraw=k.prototype.i;k.prototype.removeMarker=k.prototype.Y;k.prototype.removeMarkers=k.prototype.Z;k.prototype.resetViewport=k.prototype.m;k.prototype.repaint=k.prototype.L;k.prototype.setCalculator=k.prototype.$;k.prototype.setGridSize=k.prototype.aa;k.prototype.setMaxZoom=k.prototype.ba;k.prototype.onAdd=k.prototype.onAdd;k.prototype.draw=k.prototype.draw;s.prototype.getCenter=s.prototype.getCenter;s.prototype.getSize=s.prototype.T;s.prototype.getMarkers=s.prototype.o;t.prototype.onAdd=t.prototype.onAdd;t.prototype.draw=t.prototype.draw;t.prototype.onRemove=t.prototype.onRemove;})();var FUEL_OPTIONS={"1":{"short":"G95","name":"Gasolina 95"},"3":{"short":"G98","name":"Gasolina 98"},"4":{"short":"GOA","name":"Gasóleo Automoción"},"5":{"short":"NGO","name":"Nuevo Gasóleo A"},"6":{"short":"GOB","name":"Gasóleo B"},"7":{"short":"GOC","name":"Gasóleo C"},"8":{"short":"BIOD","name":"Biodiésel"}};var FUEL_COLORS={"G95":"#006633","G98":"#339933","GOA":"#000","NGO":"#aaa","GOB":"#CC3333","GOC":"#FF3300","BIOD":"#FFCC33"};function toTitle(s){return s.replace(" [N]","").replace(/^CARRETERA ?|^CR\.? ?/i,"CTRA. ").replace(/(CTRA. )+/i,"CTRA. ").replace(/^AVENIDA ?|^AV. ?/i,"AVDA. ").replace(/^POLIGONO INDUSTRIAL ?|POLIGONO ?|P\.I\. ?/i,"POL. IND. ").replace(/^CALLE |^CL\.? ?|C\/ ?/i,"C/ ").replace(/^RONDA |^RD /i,"RDA. ").replace(/^AUTOPISTA (AUTOPISTA ?)?/i,"AU. ").replace(/^PLAZA ?/i,"PL. ").replace(/^PASEO (PASEO ?)?/i,"Pº ").replace(/^TRAVESS?[IÍ]A /i,"TRAV. ").replace(/^V[ií]A (V[IÍ]A )?/i,"VÍA ").replace(/\B[^\d- ]+[ $]/g,function(t){return t.toLowerCase();}).replace(/\b[NAE]-.+\b/,function(t){return t.toUpperCase();}).replace(/\[D\]$/,"(m.d.)").replace(/\[I\]$/,"(m.i.)").replace(/ \[N\]$/,"");}function getLogo(label){if(label){label=label.replace(/camspa/i,"campsa");logo=label.match(/\b(abycer|agla|alcampo|andamur|a\.?n\.? energeticos|avia|bonarea|b\.?p\.?|buquerin|campsa|carmoned|carrefour|cepsa|empresoil|eroski|esclatoil|galp|gasolben|iberdoex|leclerc|makro|meroil|norpetrol|petrem|petrocat|petromiralles|petronor|repostar|repsol|saras|shell|simply|staroil|tamoil|valcarce)\b/i);if(logo)return logo[0].replace(/\./g,"").replace(/ /g,"_").toLowerCase();}return null;}function decodeName(s){return decodeURI(s).replace(/_/g," ").replace(/\|/g,"/");}function prettyName(s){if(s.match("/"))s=s.split("/")[1];if(s.match(/\)$/))s=s.match(/\(.+\)$/g)[0].replace("(","").replace(")"," ")+s.split(" (")[0];return s;}function decodeArray(a){for(var n=0;n<a.length;n++)a[n]=decodeName(a[n]);return a;}function encodeName(s){return s.replace(/\//g,"|").replace(/ /g,"_");}function checkLocalStorage(){try{return 'localStorage' in window&&window.localStorage!==null;}catch(e){return false;}}var info=null;var LOCAL_EXPIRATION=3600000;var APIS={"gasolineras":"api","resultados":"geo","ficha":"api"};function getApiData(url,key,callback){var req=new XMLHttpRequest();req.onload=function(r){info=JSON.parse(r.target.responseText);console.log("datos obtenidos: ",info);if(key){localStorage.setItem(key,JSON.stringify(info));localStorage.setItem("timestamp",new Date().getTime());}callback(info);};req.open("GET",url);req.send();}function clearCurrentStorage(){if(!checkLocalStorage())return;var pathArray=window.location.pathname.split("/");var option=pathArray[1];if(option=="ficha")localStorage.removeItem(pathArray.slice(2).join("*"));}function getData(callback){var pathArray=window.location.pathname.split("/");var option=pathArray[1];var where1=pathArray[2];var where2=pathArray[3];var key=null;if(checkLocalStorage()){var timestamp=localStorage.timestamp;if(timestamp&&(new Date().getTime()-parseInt(timestamp))>LOCAL_EXPIRATION){console.log("datos antiguos");localStorage.clear();}var storedData=null;if(option=="resultados"){key=where1;storedData=localStorage[key];}else if(option=="gasolineras"){if(where2){key=[where1,where2].join("*");storedData=localStorage[key];if(!storedData)storedData=localStorage[where1];}else{key=where1;storedData=localStorage[key];}}else if(option=="ficha"){var where3=pathArray[4];key=[where1,where2,where3].join("*");storedData=localStorage[key];}if(storedData)info=JSON.parse(storedData);}if(info){if((option=="gasolineras")&&where2){var prov=decodeName(where1);var town=decodeName(where2);tempData={};tempData._data={};tempData._data[prov]={};tempData._data[prov][town]=info._data[prov][town];info=tempData;}console.log("datos recuperados: ",info);callback(info);}else{console.log(key);getApiData(document.URL.replace(option,APIS[option]),key,callback);}return null;}var data;var map;var place="";var markers=[];var province="";var infoWindow=null;var town="";var markerCenter;var pagerN=20;var pagerCurrent=0;var markerIcon="/icon/pump_r.png";var windowTimeout;var focusMarker;function newDistance(){var location=document.getElementById("from").value+(town?(", "+town):"")+", "+province+", "+"Spain";var geocoder=new google.maps.Geocoder();geocoder.geocode({'address':location},function(res,stat){if(stat==google.maps.GeocoderStatus.OK){console.log(res);markerCenter.setPosition(res[0].geometry.location);markerCenter.set("place",res[0].formatted_address);if(infoWindow)infoWindow.close();map.panTo(res[0].geometry.location);calcDistances();paginateTable(0);var nearest=document.getElementById("table_data").getElementsByTagName("tr")[0];var infoDiv=document.getElementById("distante_info");infoDiv.innerHTML="La gasolinera más próxima a "+res[0].formatted_address+" se encuentra en "+nearest.getElementsByClassName("T_ADDR")[0].innerHTML.replace(/ \[.\]/g,"");console.log(nearest.getElementsByClassName("T_ADDR")[0].innerHTML);}else alert("Geocode ha fallado: "+stat);});}function filterCities(cname){var cities=document.getElementById("cities_list").getElementsByTagName("li");for(var c=0;c<cities.length;c++)cities[c].style.display=((cities[c].className==cname)?"block":"none");}function paginateTable(index){var rows=document.getElementById("table_data").getElementsByTagName("tr");var pager_links=document.getElementById("pager_links");pager_links.innerHTML="";if(typeof index=="string")if(index=="more")index=Math.min(pagerCurrent+pagerN,parseInt(rows.length/pagerN)*pagerN);else if(index=="less")index=Math.max(pagerCurrent-pagerN,0);for(var r=0;r<rows.length;r++){if(r<index)rows[r].className="r_off";else if(r<index+pagerN)rows[r].className="r_on";else rows[r].className="r_off";if(r%pagerN==0){var link=document.createElement("div");link.innerHTML=((r+1)+"<br/>"+Math.min(r+pagerN,rows.length)).link("javascript:paginateTable("+r+");");if(r==index)link.className="current";pager_links.appendChild(link);}}pagerCurrent=index;}function calcDistances(){var rows=document.getElementById("table_data").getElementsByTagName("tr");for(var r=0;r<rows.length;r++){try{var latlon=rows[r].getAttribute("latlon").split(",");var dlat=(latlon[0]-markerCenter.position.lat())*111.03461;var dlon=(latlon[1]-markerCenter.position.lng())*85.39383;var dist=Math.sqrt(dlat*dlat+dlon*dlon).toFixed(1);rows[r].getElementsByClassName("T_DIST")[0].textContent=dist;}catch(e){};}sortTable("T_DIST",false,true);}function initMap(){var mapOptions={center:new google.maps.LatLng(40.400,3.6833),zoom:8,mapTypeId:google.maps.MapTypeId.ROADMAP};map=new google.maps.Map(document.getElementById("google_map"),mapOptions);var geocoder=new google.maps.Geocoder();geocoder.geocode({'address':place},function(res,stat){if(stat==google.maps.GeocoderStatus.OK){map.setCenter(res[0].geometry.location);markerCenter=new google.maps.Marker({map:map,position:res[0].geometry.location,draggable:true});markerCenter.set("place",res[0].formatted_address);google.maps.event.addListener(markerCenter,'click',function(e){console.log(this);if(infoWindow)infoWindow.close();infoWindow=new google.maps.InfoWindow({content:"Punto de referencia:<br /> "+this.place.bold()});infoWindow.open(map,this);});calcDistances();}else alert("Geocode ha fallado: "+stat);});var markerCluster=new MarkerClusterer(map,markers);}function sortTable(cname,reverse,isfloat){if(typeof reverse=="undefined")reverse=false;function quickSort(a){if(a.length<=1)return a;var npivot=Math.floor(Math.random()*a.length);for(var p=npivot+1;p<a.length;p++)if(a[p][0]!=a[npivot][0])break;var pivot=a.splice(p-1,1);var less=[];var greater=[];for(var i=0;i<a.length;i++)if(a[i][0]<=pivot[0][0])less.push(a[i]);else greater.push(a[i]);return quickSort(less).concat(pivot,quickSort(greater));}var table_data=document.getElementById("table_data");var values=table_data.getElementsByClassName(cname);var array=[];for(var v=0;v<values.length;v++)if(values[v].textContent){var newval=(isfloat?parseFloat(values[v].textContent):values[v].textContent);array.push([newval,v]);}array=quickSort(array);if(reverse)array.reverse();var rows=table_data.getElementsByTagName("tr");var static_rows=[];for(var r=0;r<rows.length;r++)static_rows.push(rows[r]);for(var e=0;e<array.length;e++)table_data.insertBefore(static_rows[array[e][1]],table_data.children[e]);var headers=document.getElementById("table").getElementsByTagName("th");for(var h=0;h<headers.length;h++){headers[h].className=headers[h].className.replace(" sort_up","").replace(" sort_down","");if(headers[h].className.match(cname))headers[h].className=headers[h].className+(reverse?" sort_down":" sort_up");}paginateTable(0);}function initControl(){var filterT=document.getElementById("fuel_type").getElementsByTagName("li");for(var f=0;f<filterT.length;f++)filterT[f].addEventListener("click",function(e){var cname=e.target.className.split(" ")[0];if(e.target.className.match("off"))e.target.className=e.target.className.replace("off","on");else e.target.className=e.target.className.replace("on","off");var trs=document.getElementById("table").getElementsByTagName("tr");for(var tr=0;tr<trs.length;tr++){var row=trs[tr];row.getElementsByClassName(cname)[0].className=e.target.className;var tds=row.getElementsByClassName("on");var st_aux="";for(var td=0;td<tds.length;td++)st_aux+=tds[td].textContent;row.className=(st_aux.length)?"r_on":"r_off";}paginateTable(0);});document.getElementById("contains").onkeyup=function(e){function cleanFilter(s){return s.toLowerCase().replace("/áàä/g","a").replace("/éèë/g","e").replace("/íìï/g","i").replace("/óòö/g","o").replace("/úùü/g","u");}var filtervalue=e.target.value;var terms=filtervalue.split(" ");var rows=document.getElementById("table").getElementsByTagName("tr");for(var f=1;f<rows.length;f++){row=rows[f];var found=false;for(var t=0;t<terms.length;t++){term=terms[t];if(term.length!=0){var expected=(term[0]!="-");if(!expected){term=term.substr(1);if(term.length==0)continue;}var cells=row.getElementsByTagName("td");for(var c=0;c<2;c++){var cell=cells[c];found=found||(RegExp(term,"i").exec(cleanFilter(cell.textContent))!=null);}row.className=((found!=expected)?"r_off":"r_on");}}}paginateTable(0);};var heads=document.getElementById("table").getElementsByTagName("th");for(var h=0;h<heads.length;h++)heads[h].addEventListener("click",function(ev){sortTable(this.className.match(/T_\w+/)[0],this.className.match("sort_up"),this.hasAttribute("isfloat"));});document.getElementById("zoom_google_map").addEventListener("click",function(){var mapDiv=document.getElementById("google_map");mapDiv.className=((mapDiv.className)?"":"big");setTimeout(function(){google.maps.event.trigger(map,'resize');},1000);});var controls=document.getElementsByClassName("c_item");for(var c=0;c<controls.length;c++)controls[c].addEventListener("click",function(ev){var c_contents=document.getElementsByClassName("c_content");for(var cc=0;cc<c_contents.length;cc++)c_contents[cc].className=c_contents[cc].className.replace(" on","");document.getElementById(ev.target.id.replace("c_","")).className+=" on";var c_items=document.getElementsByClassName("c_item");for(var cc=0;cc<c_items.length;cc++)c_items[cc].className=c_items[cc].className.replace(" on","");this.className+=" on";});}function populateTable(id){var table=document.getElementById(id);var path=document.location.pathname.split("/");var nTotal=nG95=nG98=nGOA=nGO=nGOB=nGOC=nBIOD=0;var cities=[];for(var p in data){var p_link=encodeName(p);for(var t in data[p]){var t_link=encodeName(t);var s_link="/gasolineras/"+p_link+"/"+t_link;cities.push([t,s_link]);for(var s in data[p][t]){var label=data[p][t][s].label;var tr=document.createElement("tr");tr.className="r_on";var td_town=document.createElement("td");var a_town=document.createElement("a");a_town.href=s_link;a_town.title="Todas las gasolineras de "+t;a_town.textContent=t.toUpperCase();td_town.className="T_LOC";td_town.appendChild(a_town);tr.appendChild(td_town);var td_s=document.createElement("td");var a_s=document.createElement("a");a_s.href="/ficha/"+p_link+"/"+t_link+"/"+encodeName(s);a_s.textContent=toTitle(s);a_s.title="Detalles de la gasolinera en "+t+", "+a_s.textContent;td_s.appendChild(a_s);td_s.className="T_ADDR";var logo=getLogo(label);if(logo)td_s.style.backgroundImage="url('/img/logos/"+logo+"_mini.png')";tr.appendChild(td_s);var td_dist=document.createElement("td");td_dist.className="T_DIST";tr.appendChild(td_dist);for(var o in FUEL_OPTIONS){var otd=document.createElement("td");otd.className="T_"+FUEL_OPTIONS[o].short+" on";otd.textContent=data[p][t][s].options[o]||"";tr.appendChild(otd);}try{var pos=new google.maps.LatLng(data[p][t][s].latlon[0],data[p][t][s].latlon[1]);var marker=new google.maps.Marker({position:pos,icon:markerIcon});google.maps.event.addListener(marker,'click',function(e){if(infoWindow)infoWindow.close();infoWindow=new google.maps.InfoWindow({content:"contenido"});map.panTo(this.position);map.setZoom(12);infoWindow.open(map,this);});markers.push(marker);tr.setAttribute("markerid",markers.length-1);tr.setAttribute("latlon",data[p][t][s].latlon.join(","));}catch(e){}table.appendChild(tr);nTotal++;}}}paginateTable(0);var divInfo=document.getElementById("info");divInfo.innerHTML="<p>Se han encontrado "+nTotal+" gasolineras en "+(town?town:province).bold()+".</p>";if(cities.length>1){var citiesList=document.getElementById("cities_list");cities.sort(function(a,b){if(a[0].toLowerCase()<b[0].toLowerCase())return -1;if(a[0].toLowerCase()>b[0].toLowerCase())return 1;return 0;});for(var c=0;c<cities.length;c++){var newCity=document.createElement("li");newCity.innerHTML=cities[c][0].link(cities[c][1]);if(cities[c][0].charAt(0).toLowerCase()<"d")newCity.className="c_A";else if(cities[c][0].charAt(0).toLowerCase()<"n")newCity.className="c_D";else if(cities[c][0].charAt(0).toLowerCase()<"s")newCity.className="c_N";else newCity.className="c_S";citiesList.appendChild(newCity);}}else document.getElementById("c_cities").style.display="none";}function processData(info){console.log(info);var h1=document.getElementById("title");if(info._near){h1.textContent="Gasolineras cerca de: "+info._near;place=info._near;}else{var pts=decodeArray(document.location.pathname.split("/").splice(2));province=prettyName(pts[0]);if(pts[1])town=prettyName(pts[1]);h1.textContent="Gasolineras en "+(town?(town+", "):"la ")+"provincia de "+province;place=(town?(town+", "+province):province);}data=info._data;populateTable("table_data");initMap();initControl();}window.addEventListener("load",function(){getData(processData);});