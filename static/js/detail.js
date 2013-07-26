var POINTS = [
				"Deja mucho que desear",		// 1
				"Las hay mejores",				// 2
				"Está bien en general",			// 3
				"Muy recomendable",				// 8
				"¡Excelente!"					// 10
			];
var POST_ERRORS = {
	"no_name": ["c_name","Debes indicar tu nombre en el comentario"],
	"no_email": ["c_email","Debes indicar tu dirección de correo electrónico (no será guardada ni mostrada)"],
	"nv_email": ["c_email","La dirección de correo electrónico no es válida"],
	"no_points": ["c_points","Olvidaste valorar esta gasolinera"],
	"no_content": ["c_content","El texto del comentario está vacío"],
	"no_captcha": ["recaptcha_response_field", "No has resuelto el captcha"],
	"bad_captcha": ["recaptcha_response_field","La solución del captcha no es correcta"],
	"err_captcha": [null,"No se ha podido verificar el captcha. Por favor, inténtalo de nuevo más tarde."],
	"server_error": [null,"Por un problema en el servidor no se ha podido guardar el comentario. Por favor, inténtalo de nuevo más tarde."]
}
var gasole = null;			// todo gasole
var sdata = null;			// esta estación
var map = null;				// el mapa
var candidateMark = null; 	// marcador de gasolinera propuesta por el recomendador
var moreR = 5;				// Radio de búsqueda para gasolineras alternativas

function initPoints() {
	var timeOut=null,
		sDiv=document.getElementById("c_points_div"),
		mDiv=document.getElementById("c_points_text"),
		points=document.getElementById("c_points");
	function selStar(i){
		var stars = sDiv.getElementsByClassName("star");
		for (var s=0; s<stars.length; s++) {
			var id=parseInt(stars[s].id.split("_")[1]);
			stars[s].className="sprt star s"+((id<=i) ? "on" : "off");
		}
	}
	sDiv.innerHTML="";
	for (var s=0; s<5; s++) {
		var star = document.createElement("div");
		star.className = "sprt star soff";
		star.id = "star_"+s;
		addEvent(star,"mouseout", function() {
			var val = points.value;
			if (!val){
				timeOut = setTimeout(function() {
					sDiv.className="error";
					mDiv.className="";
					selStar(-1);
				}, 500);
			}
			else {
				val = parseInt(val)-1;
				selStar(val);
				sDiv.className="";
				mDiv.textContent = POINTS[val];
			}
		});
		addEvent(star,"mouseover", function() {
			if (timeOut) clearTimeout(timeOut);
			sDiv.className = "";
			var id = this.id.split("_")[1];
			selStar(parseInt(id));
			mDiv.textContent= POINTS[id];
			mDiv.className = "sel";
		});
		addEvent(star,"click", function() {
			var id = this.id.split("_")[1];
			points.value = parseInt(id)+1;
			mDiv.className = "sel";
		});
		sDiv.appendChild(star);
	}
}
function resetError() {this.className=""};
function checkName(s) {
	s = clearHtmlTags(s);
	return (!s.length) ? false : s;
}
function onBlurName() {
	var val = checkName(this.value);
	if (val) this.value = val;
	this.className = ((!val) ? "error": "ok");
}
function checkEmail(s) {
	s = clearHtmlTags(s.toLowerCase().replace(/^\s+|\s+$/g,''));
	var re = new RegExp("[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?");
	return (re.test(s) ? s : false);
}
function onBlurEmail() {
	var val = checkEmail(this.value);
	if (val) this.value = val;
	this.className = ((!val) ? "error" : "ok");
}
function checkContent(s) {
	s = clearHtmlTags(s);
	return ((s.length) ? s : false);
}
function onBlurContent() {
	var val = checkContent(this.value);
	if (val) this.value = val;
	this.className = (!val) ? "error" : "ok";
}
function onBlurCaptcha() {
	this.className = (this.value.length) ? "" : "error";
}
// Información relacionada con un tipo de precio
function showMore() {
	var type = this.id.split("-")[1];
	var rel = document.getElementById("rel-"+type);
	if (this.textContent=="+") {
		this.textContent="-";
		rel.className+=" on";
		if (rel.innerHTML!="") return;
		var g = sdata.i.g;
		if (g) {
			var price = sdata.i.o[type];
			var where = new SearchLocations();
			where.add("Aquí", g);
			where.radius = moreR;
			var result = gasole.nearDataArray(where, type, "p");
			var rlen=result.length;
			if (rlen) {
				result = result.filter(function(e) {return e.p<price});
				rlen = result.length;
				if (!rlen) {
					rel.innerHTML = "<p>La más barata para este combustible en un radio de "+moreR+" km.</p>\
									<div class='sprt the_best'></div>";
					return;
				}
				rel.innerHTML = "<p>Hay "+rlen+" gasolineras más baratas en un radio de "+moreR+" km.</p>";
				// Lista de gasolineras más económicas:
				var list = document.createElement("div");
				list.className = "rel-list";
				var table = document.createElement("table");
				for (var i=0; i<rlen; i++) {
					var tr = document.createElement("tr");
					var td = document.createElement("td");
					td.textContent = "A "+result[i].d.toFixed(1)+ "km.";
					tr.appendChild(td);
					td = document.createElement("td");
					td.className = "label";
					td.textContent = result[i].l;
					tr.appendChild(td);
					td = document.createElement("td");
					td.textContent = result[i].p +" €/l";
					tr.appendChild(td);
					tr.setAttribute("data-g", result[i].g);
					tr.setAttribute("data-p", result[i].prov);
					tr.setAttribute("data-t", result[i].t);
					tr.setAttribute("data-s", result[i].a);
					addEvent(tr,"click", function() {
						window.location = "/ficha/"+encodeName(this.getAttribute("data-p"))+"/"+encodeName(this.getAttribute("data-t"))+"/"+encodeName(this.getAttribute("data-s"));
					});
					addEvent(tr,"mouseover", function() {
						var bounds = new google.maps.LatLngBounds();
						var current = new google.maps.LatLng(sdata.i.g[0], sdata.i.g[1]);
						bounds.extend(current);
						var g = this.getAttribute("data-g").split(",");
						var candidate = new google.maps.LatLng(parseFloat(g[0]), parseFloat(g[1]));
						bounds.extend(candidate);
						map.fitBounds(bounds);
						if (candidateMark) {
							candidateMark.setPosition(candidate);
							candidateMark.setAnimation(google.maps.Animation.BOUNCE);
							candidateMark.setMap(map);
						} else {
							candidateMark = new google.maps.Marker({
								map: map,
								position: candidate,
								icon: "/img/pump_mark.png",
								animation: google.maps.Animation.BOUNCE
							});
						}
					});
					addEvent(tr,"mouseout", function() {if (candidateMark) candidateMark.setMap(null);});
					table.appendChild(tr);
				}
				lockScroll(list);
				list.appendChild(table);
				rel.appendChild(list);
			} else {
				rel.innerHTML = "<p>No se encuentran otros puntos de venta de "+FUEL_OPTIONS[type].name+" en un radio de "+moreR+" km.</p>";
			}
		} else { // not g
			rel.innerHTML = "<p>No se conoce la localización de esta gasolinera, y no se pueden buscar otras alternativas próximas.</p>";
		}
	} else {
		this.textContent="+";
		rel.className = rel.className.replace(" on", "");
	}
}
/* Rellena los comentarios de la gasolinera */
function fillComments(comments) {
	function fillReplyTo() {
		/* Para contestar a un comentario existente */
		var id=this.id.split("-")[1];
			comment = document.getElementById("comment-"+id),
			dName=document.getElementById("replyto_name"),
			dMsg=document.getElementById("replyto_msg"),
			dReplyTo=document.getElementById("replyto"),
			inputReplyTo=document.getElementById("c_replyto"),
			dPoints=document.getElementById("section_points");
		dName.innerHTML = comment.getElementsByClassName("c_name")[0].textContent.bold();
		dMsg.innerHTML = comment.getElementsByClassName("c_content")[0].innerHTML;
		inputReplyTo.value = id;
		dReplyTo.style.display = "block";
		dPoints.style.display = "none";
		document.getElementById("replyto_cancel").onclick = function() {
			// cancela contestar a un comentario
			dName.innerHTML = "";
			dMsg.innerHTML = "";
			inputReplyTo.value = "";
			dReplyTo.style.display = "none";
			dPoints.style.display = "block";
		};
		document.getElementById("comments").scrollIntoView();
	}
	function fillStars(div,p) {
		/* rellena una valoración basada en la puntuación */
		div.innerHTML = "<p>"+POINTS[--p]+"</p>";
		div.className = "c_points";
		for (var s=0; s<5; s++) 
			div.innerHTML+="<div class='sprt star_mini s"+((s<=p) ? "on" : "off")+"'></div>";
	}
	var clen=comments.length;
	if (clen==0) {
		document.getElementById("no-comments").style.display="block";
		return;
	}
	var commentsDiv = document.getElementById("old_comments"),
		total_points = 0,			// suma total de puntos
		n_comments = 0;				// número de comentarios con puntiación
	commentsDiv.innerHTML="";
	for (var c=0; c<clen; c++) {
		var comment=comments[c],
			points=comment.points,
			name=comment.name,
			link=comment.link,
			title=comment.title,
			id=comment.id,
			replyto=comment.replyto;
		var newCommentBlock = document.createElement("div");
			newCommentBlock.className = "c_block";
			newCommentBlock.id = "block-"+id;
		var newComment = document.createElement("div");
			newComment.className = "c_comment";
			newComment.id = "comment-"+id;
		var newCAvatar = document.createElement("img");
			newCAvatar.className = "c_avatar";
			newCAvatar.src = comment.avatar;
			newComment.appendChild(newCAvatar);
		if (points) {
			total_points+=points;
			n_comments++;
			points = parseInt(points);
			var newCPoints = document.createElement("div");
			fillStars(newCPoints,points);
			newComment.appendChild(newCPoints);
		}
		var newCName = document.createElement("div");
			newCName.className = "c_name";
			newCName.innerHTML = link ? ("<a href='"+link+"' rel='external nofollow'>"+name+"</a>") : name;
			newComment.appendChild(newCName);
		var newCDate = document.createElement("div");
			newCDate.className = "c_date";
			newCDate.textContent = new Date(comment.date).toLocaleDateString();
			newComment.appendChild(newCDate);
		if (title) {
			var newCTitle = document.createElement("div");
				newCTitle.className = "c_title";
				newCTitle.textContent = title;
				newComment.appendChild(newCTitle);	
		}
		var newCContent = document.createElement("div");
			newCContent.className = "c_content";
			newCContent.innerHTML = comment.content.replace(/\n/g, "<br>");
			newComment.appendChild(newCContent);
		var newCReply = document.createElement("div");
			newCReply.textContent = "responder…";
			newCReply.className = "reply button";
			newCReply.id = "replyto-"+id;
			addEvent(newCReply,"click",fillReplyTo);
			newComment.appendChild(newCReply);
		newCommentBlock.appendChild(newComment);			// inserción del comentario en el bloque
		var newCReplies = document.createElement("div");	// div auxiliar para respuestas
			newCReplies.id = "replies-"+id;
			newCReplies.className = "replies";
			newCommentBlock.appendChild(newCReplies);
		// Inserto el comentario
		if (replyto) document.getElementById("replies-"+replyto).appendChild(newCommentBlock);
		else commentsDiv.appendChild(newCommentBlock);
	}
	if (total_points) fillStars(document.getElementById("points"), Math.round(total_points/n_comments));
}
/* Procesamiento de los datos de la gasolinera */
function processData(info) {
	/* Eventos para valoración de una gasolinera */
	initPoints();
	/* Inicializa el mapa */
	(function initMap(latlon) {
		var mapdiv = document.getElementById("map");
		if (!latlon) {
			mapdiv.style.display = "none";
			return;
		}
		var position = new google.maps.LatLng(latlon[0], latlon[1]);
		var mapOptions = {
			center: position,
			zoom: 15,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		map = new google.maps.Map(mapdiv,
			mapOptions);
		markerCenter = new google.maps.Marker({
	    	map: map,
	    	position: position,
	    	animation: google.maps.Animation.DROP,
			icon: '/img/pump_mark.png'
		});
	})(info.i.g);
	/* El horario de la gasaolinera*/
	(function initHours(h) {
		document.getElementById("hours").textContent = h;	
	})(info.i.h);
	/* El logo de la gasolinera */
	(function insertLogo(label) {
		var logoId = getLogo(label);
		var logoDiv = document.getElementById("station-logo");
		if (logoId) {
			var imgUrl = "/img/logos/" + logoId + "_w.png";
			logoDiv.style.backgroundImage = "url("+imgUrl+")";
		}
		else {
			logoDiv.style.backgroundImage = "url('/img/logos/otra_w.png')";
			logoDiv.textContent = label;
		}
	})(info.i.l);
	/* Inicializa tablón de precios y reomendador */
	(function initPrice(price) {
		for (var p in price) {
			var type = FUEL_OPTIONS[p]["short"];
			var dsec = document.getElementById("sec-"+type);
			dsec.style.display = "block";
			fillPriceDigits(document.getElementById(type), price[p]);
			// Recomendador
			var dmore = document.createElement("div");
			dmore.className = "more";
			dmore.id = "more-"+p;
			dmore.textContent = "+";
			dmore.onclick = showMore;
			dsec.appendChild(dmore);
			var drelated = document.createElement("div");
			drelated.id = "rel-"+p;
			drelated.className = "rel";
			dsec.appendChild(drelated);
		}
	})(info.i.o);
	// relleno de http:// en c_link
	var clink = document.getElementById("c_link");
	if (clink) {
		addEvent(clink,"click", function() {if (this.value == "") this.value = "http://";});
		addEvent(clink,"blur", function() {if (this.value == "http://") this.value = "";});	
	}
}
function amChart(chartData) {
	var chart;
	for (var i in chartData) chartData[i].d = new Date(chartData[i].d);
    // SERIAL CHART
    chart = new AmCharts.AmSerialChart();
    chart.pathToImages = "/img/";
    chart.zoomOutButton = {
        backgroundColor: '#000000',
        backgroundAlpha: 0.15
	};
    chart.dataProvider = chartData;
    chart.marginTop = 20;
    chart.autoMarginOffset = 40;
    chart.marginRight = 0;        
    chart.categoryField = "d";
    chart.addTitle("Evolución histórica de los precios", 15);
    // AXES
    // Category
    var categoryAxis = chart.categoryAxis;
    categoryAxis.parseDates = true;
    categoryAxis.gridAlpha = 0.07;
    categoryAxis.axisColor = "#DADADA";
    categoryAxis.startOnAxis = true;
    categoryAxis.showLastLabel = false;
    // categoryAxis.title = "Fecha";
    // Value
    var valueAxis = new AmCharts.ValueAxis();
    valueAxis.gridAlpha = 0.07;
    valueAxis.title = "Precio (€/l)";
    chart.addValueAxis(valueAxis);
    for (var o=0; o<CHART_OPTIONS.length; o++) {
    	var t = CHART_OPTIONS[o].id;
    	if (!chartData[chartData.length-1].hasOwnProperty(t)) continue;
    	var graph = new AmCharts.AmGraph();
	    graph.type = "line";
	    graph.title = CHART_OPTIONS[o].name;
	    graph.valueField = t;
	    graph.lineAlpha = 1;
	    graph.lineThickness = 1;
	    graph.fillAlphas = 0.6;
	    graph.lineColor = CHART_OPTIONS[o].color;
	    chart.addGraph(graph);
    }
    // LEGEND
    chart.addLegend(new AmCharts.AmLegend());
    // SCROLLBAR
    chart.addChartScrollbar(new AmCharts.ChartScrollbar());
    // CURSOR
    var cursor = new AmCharts.ChartCursor();
    cursor.valueBalloonsEnabled = false;
    chart.addChartCursor(cursor);
    // WRITE
    chart.write("chart");
}
/* Enviar un nuevo comentario */
function postComment() {
	var form = this;
	// Comprobación local de campos
	function checkElements(elem) {
		var checkResult=[];
		for (var i=0; i<elem.length; i++) {
			var f = elem[i];
			if (!f.hasAttribute("name")) continue;
			var fname = f.name, fval=f.value;
			if ((fname=="c_name") && (!fval)) checkResult.push("no_name");
			else if (fname=="c_email") {
				if (!fval) checkResult.push("no_email");
				else if (!checkEmail(fval)) checkResult.push("nv_email");
			}
			else if ((fname=="c_points") && (!fval) && (!document.getElementById("c_replyto").value)) 
				checkResult.push("no_points");
			else if ((fname=="c_content") && (!fval)) 
				checkResult.push("no_content");
			else if ((fname=="recaptcha_response_field") && (!fval)) 
				checkResult.push("no_captcha");
		}
		return checkResult;
	}
	// Limpieza del formulario
	function clearForm() {
		var elements = form.elements;
		for (var i=0;i<elements.length;i++) {
			var e=elements[i];
			if (e.type!="submit") e.value=e.className="";
		}
		initPoints();
		Recaptcha.reload();
		var replyBtn = document.getElementById("replyto_cancel");
		if (replyBtn && replyBtn.onclick) replyBtn.onclick();	// para limpiar respuesta a 
	}
	/* Ocultar el resultado de la publicación */
	function hideResult() {
		document.body.removeChild(document.getElementById("result-container"));
		window.onclick = null;
	}
	/* Mostrar el resultado de la publicación */
	function showResult(response,local) {
		window.onclick = hideResult;
		var rDiv = document.createElement("div");
		rDiv.id="result";
		if (response.hasOwnProperty("OK")) {
			clearForm();	// limpiamos el formulario
			rDiv.innerHTML = "<p>Michas gracias por tu valoración.<br>Tu comentario ha sido publicado y se mostrará en unos instantes.</p><div class='bullets'></div>";
			var nBullet=0;
			var interval = setInterval(function() {
				nBullet++;
				var rd = document.getElementById("result");
				if (rd) {
					var bullet = rd.getElementsByClassName("bullets")[0];
					bullet.innerHTML+="&#8226;";
					if (nBullet==40){
						clearInterval(interval);
						hideResult();
					}
				} else clearInterval(interval);
			},50);
			// Los nuevos comentarios
			var newID = response["OK"];
			getApiData("comments", function(d) {
				fillComments(d);
				var newComment = document.getElementById("comment-"+newID);
				newComment.scrollIntoView();
				newComment.className="c_comment strong";
			}, true);
		} else {
			var errors=response.ERROR;
			rDiv.className = "e";
			rDiv.innerHTML = "<p>Se han detectado errores en el formulario:</p>";
			for (var i=0;i<errors.length;i++) {
				var e=errors[i],
					fieldID=POST_ERRORS[e][0],	// campo del formulario
					emsg=POST_ERRORS[e][1];		// mensaje de error
				if (fieldID) {
					var field=document.getElementById(fieldID);
					field.className = "error";
				}
				rDiv.innerHTML+=("<div>"+emsg+"</div>");
			}
			rDiv.innerHTML+="<div class='button'>De acuerdo, me ha quedado claro.</div>";
			// captcha correcto, no se puede reutilizar
			if ((errors.indexOf("bad_captcha")<0)&&(!local)) Recaptcha.reload();
		}
		var rCont = document.createElement("div");
		rCont.id="result-container";
		document.body.appendChild(rCont);
		rCont.appendChild(rDiv);
	}
	var elements = form.elements,
		segments = [];
	// Primera comprobación local de los campos, para no 'molestar' al servidor
	var check = checkElements(elements);
	if (check.length==0) {	// todo ok 
		for (var nItem=0; nItem<elements.length; nItem++) {
			field = elements[nItem];
			 if (!field.hasAttribute("name")) continue;
			 segments.push(field.name+"="+encodeURIComponent(clearHtmlTags(field.value)));
		}
		var req = new XMLHttpRequest();
		req.open("POST", document.URL.replace("ficha", "api/c"), true);
		req.setRequestHeader("content-type", "application/x-www-form-urlencoded; charset=utf-8");
		req.onload = function(r) {showResult(JSON.parse(this.responseText),false);}
		req.send(segments.join("&"));
	} else {
		showResult({"ERROR":check},true);
	}
	return false;
}
addEvent(window,"load", function() {
	getApiData("comments", fillComments, false);					// los comentarios
	// Para mostrar los gráficos
	document.getElementById("chart").onclick = function() {
		this.onclick = null;
		this.className="";
		this.innerHTML="";
		getApiData("history", amChart);
	}
	var path = decodeArray(window.location.pathname.split("/"));
	sdata = {'p':path[2], 't': path[3], 's': path[4]};				// toda la información de la estación
	gasole = new Gasole(function() {
		sdata.i = this.info[sdata.p][sdata.t][sdata.s];
		breadCrumb("breadcrumb", sdata.i.l);						// miga de pan del detalle
		processData(sdata);
		document.getElementById("maintitle").textContent =
			"Ficha de la Gasolinera " + sdata.i.l + " en " + toTitle(sdata.s) + ", " + toTitle(sdata.t);
	});
	document.getElementById("comment-form").onsubmit = postComment;
	var field = document.getElementById("c_name"); if (field) {
		field.onblur = onBlurName;
		field.onclick = resetError;	
	} 
	field = document.getElementById("c_email"); if (field) {
		field.onblur = onBlurEmail;
		field.onclick = resetError;	
	} 
	field = document.getElementById("c_content"); if (field) {
		field.onblur = onBlurContent;
		field.onclick = resetError;	
	} 
	document.getElementById("recaptcha_response_field").onclick = resetError;
})