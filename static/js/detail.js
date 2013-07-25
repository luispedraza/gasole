var POINTS = [
				"Deja mucho que desear",		// 1
				"Las hay mejores",				// 2
				"Está bien en general",			// 3
				"Muy recomendable",				// 8
				"¡Excelente!"					// 10
			]
var gasole = null;			// todo gasole
var sdata = null;			// esta estación
var map = null;				// el mapa
var candidateMark = null; 	// marcador de gasolinera propuesta por el recomendador
var moreR = 5;				// Radio de búsqueda para gasolineras alternativas

function resetError() {
	this.className = this.className.replace("error", "");
}
function onBlurName(d) {
	var val = clearHtmlTags(d.value);
	d.value = val;
	var de = document.getElementById("error_"+d.id);
	if (!val.length) {
		d.className = "error";
		de.style.display = "block";
		de.textContent = "Debes indicar tu nombre";
	}
	else {
		d.className = "ok";
		de.style.display = "none";
	}
}
function onBlurEmail(d) {
	function validEmail(s) {
		var re = new RegExp("[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?");
		return re.test(s);
	}
	var val = clearHtmlTags(d.value);
	d.value = val;
	var de = document.getElementById("error_"+d.id);
	if (!val.length) {
		de.textContent = "Debes indicar tu e-mail";
	}
	else {
		val = val.toLowerCase().replace(/^\s+|\s+$/g,'');
		if (validEmail(val)) {
			d.value = val;
			d.className = "ok";
			de.style.display = "none";
			return;
		} else {
			de.textContent = "El e-mail no parece válido";
		}
	}
	d.className = "error";
	de.style.display = "block";
}
function onBlurContent(d) {
	var val = clearHtmlTags(d.value);
	d.value = val;
	var de = document.getElementById("error_"+d.id);
	if (!val.length) {
		de.textContent = "¡No olvides escribir tu comentario!";
		d.className = "error";
		de.style.display = "block";
	}
	else {
		de.style.display ="none";
		d.className = "ok";
	}
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
function fillReplyTo(id) {
	var comment = document.getElementById("comment-"+id);
	document.getElementById("replyto_name").innerHTML = comment.getElementsByClassName("c_name")[0].textContent.bold();
	document.getElementById("replyto_msg").innerHTML = comment.getElementsByClassName("c_content")[0].innerHTML;
	document.getElementById("replyto").style.display = "block";
	document.getElementById("comments").scrollIntoView();
	document.getElementById("c_replyto").value = id;
	document.getElementById("section_points").style.display = "none";
	addEvent(document.getElementById("replyto_cancel"),"click", function() {
		document.getElementById("replyto").style.display = "none";
		document.getElementById("replyto_name").innerHTML = "";
		document.getElementById("replyto_msg").innerHTML = "";
		document.getElementById("c_replyto").value = "";
		document.getElementById("section_points").style.display = "block";
	})
}

/* Rellena los comentarios de la gasolinera */
function fillComments(comments) {
	console.log(comments);
	/* rellena una valoración basada en la puntuación */
	function fillStars(div, p) {
		p--;
		div.innerHTML = "<p>"+POINTS[p]+"</p>";
		div.className = "c_points";
		for (var s=0; s<5; s++) {
			var star = document.createElement("div");
			star.className = "sprt star_mini";
			star.className += (s<=p) ? " son" : " soff";
			div.appendChild(star);
		}
	}
	if (comments.length==0) {
		document.getElementById("no-comments").style.display="block";
		return;
	}
	var commentsDiv = document.getElementById("old_comments");
	commentsDiv.innerHTML="";
	var total_points = 0;
	var n_comments = 0;
	var comments_length = comments.length;
	for (var c=0; c<comments_length; c++) {
		var newCommentBlock = document.createElement("div");
		newCommentBlock.className = "c_block";
		newCommentBlock.id = "block-"+comments[c].id;

		var newComment = document.createElement("div");
		newComment.className = "c_comment";
		newComment.id = "comment-"+comments[c].id;

		var newCAvatar = document.createElement("img");
		newCAvatar.className = "c_avatar";
		newCAvatar.src = comments[c].avatar;
		newComment.appendChild(newCAvatar);

		var points = comments[c].points;
		if (points) {
			points = parseInt(points);
			total_points+=points;
			var newCPoints = document.createElement("div");
			fillStars(newCPoints,points);
			newComment.appendChild(newCPoints);
			n_comments++;
		}
		var newCName = document.createElement("div");
		newCName.className = "c_name";
		if (comments[c].link) newCName.innerHTML = "<a href='" + comments[c].link + "' rel='external nofollow'>"+comments[c].name+"</a>";
		else newCName.textContent = comments[c].name;
		newComment.appendChild(newCName);
		var newCDate = document.createElement("div");
		newCDate.className = "c_date";
		newCDate.textContent = new Date(comments[c].date).toLocaleDateString();
		newComment.appendChild(newCDate);
		
		if (comments[c].title) {
			var newCTitle = document.createElement("div");
			newCTitle.className = "c_title";
			newCTitle.textContent = comments[c].title;
			newComment.appendChild(newCTitle);	
		}
		
		var newCContent = document.createElement("div");
		newCContent.className = "c_content";
		newCContent.innerHTML = comments[c].content.replace(/\n/g, "<br>");
		newComment.appendChild(newCContent);

		var newCReply = document.createElement("div");
		newCReply.textContent = "responder…";
		newCReply.className = "reply button";
		newCReply.id = "replyto-"+comments[c].id;
		addEvent(newCReply,"click", function(e) {
			var id = this.id.split("-")[1];
			fillReplyTo(id);
		})
		newComment.appendChild(newCReply);
		// Inserto el comentario en el block:
		newCommentBlock.appendChild(newComment);
		// Div auxiliar para respuestas:
		var newCReplies = document.createElement("div");
		newCReplies.id = "replies-"+comments[c].id;
		newCReplies.className = "replies";
		newCommentBlock.appendChild(newCReplies);

		// Inserto el comentario
		if (comments[c].replyto) {
			document.getElementById("replies-"+comments[c].replyto).appendChild(newCommentBlock);
		} else {
			commentsDiv.appendChild(newCommentBlock);	
		}
	}
	if (total_points!=0) {
		// var points = Math.round(total_points/n_comments);
		// document.getElementById("points").innerHTML = points.toFixed(1) + " (" + n_comments + " valoraciones)";
		fillStars(document.getElementById("points"), Math.round(total_points/n_comments));
	}
}
/* Procesamiento de los datos de la gasolinera */
function processData(info) {
	/* Eventos para valoración de una gasolinera */
	(function initPoints() {
		var timeOut=null;
		function selStar(i){
			var stars = document.getElementById("c_points_div").getElementsByClassName("star");
			for (var s=0; s<stars.length; s++) {
				var id=parseInt(stars[s].id.split("_")[1]);
				var cname = stars[s].className;
				if (id<=i) stars[s].className = cname.replace("off", "on");
				else stars[s].className = cname.replace("on", "off");
			}
		}
		var stars = document.getElementById("c_points_div");
		for (var s=0; s<5; s++) {
			var star = document.createElement("div");
			star.className = "sprt star soff";
			star.id = "star_"+s;
			stars.appendChild(star);
			addEvent(star,"mouseout", function() {
				var val = document.getElementById("c_points").value;
				var msg = document.getElementById("c_points_text");
				if (!val){
					timeOut = setTimeout(function() {
						msg.textContent = "Debes asignar una puntuación";
						msg.className = "error";
						msg.style.display = "block";
						selStar(-1);
					}, 500);
				}
				else {
					val = parseInt(val)-1;
					selStar(val);
					msg.textContent = POINTS[val];
					msg.className = "sel";
				}
			});
			addEvent(star,"mouseover", function() {
				if (timeOut) clearTimeout(timeOut);
				document.getElementById("c_points_div").className = "";
				var id = this.id.split("_")[1];
				selStar(parseInt(id));
				var msg = document.getElementById("c_points_text");
				msg.textContent = POINTS[id];
				msg.className = "sel";
			});
			addEvent(star,"click", function() {
				var id = this.id.split("_")[1];
				document.getElementById("c_points").value = parseInt(id)+1;
				document.getElementById("c_points_text").className = "sel";
			});
		}
	})();
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
	addEvent(clink,"click", function() {if (this.value == "") this.value = "http://";});
	addEvent(clink,"blur", function() {if (this.value == "http://") this.value = "";});
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

addEvent(window,"load", function() {
	/* Enviar un nuevo comentario */
	function postComment(e) {
		/* Mostrar el resultado de la publicación */
		function showResult(response) {
			var rCont = document.createElement("div");
			rCont.id="result-container";
			document.body.appendChild(rCont);
			window.onclick = function() {
				document.body.removeChild(document.getElementById("result-container"));
				window.onclick = null;
			};
			var rDiv = document.createElement("div");
			rDiv.id="result";
			if (response.hasOwnProperty("OK")) {
				getApiData("comments", fillComments, true);
				rDiv.innerHTML = "<p>Gracias. Tu comentario ha sido publicado.</p>";
			} else {
				rDiv.className = "e";
				rDiv.innerHTML = "<p>Se han detectado errores en el formulario:</p>";
				for (var e in response) {
					var field=null;
					if (e=="c_points") {
						field = document.getElementById("c_points_div");
						field.className = "perror";
					}
					else {
						field = document.getElementById(e);
						field.className = "error";	
					} 
					addEvent(field,"focus",resetError);
					var newE = document.createElement("div");
					newE.id = "em_"+e;
					newE.textContent = response[e];
					rDiv.appendChild(newE);
				}
			}
			rCont.appendChild(rDiv);
		}
		stopEvent(e);
		console.log("enviando");
		function encodeParams(dict) {
			params = ""
			for (var k in dict) {
				params += k+"="+dict[k]+"&";
			}
			return params;
		}
		var req = new XMLHttpRequest();
		var url = document.URL.replace("ficha", "api/c");
		req.open("POST", url, true);
		req.setRequestHeader("content-type", "application/x-www-form-urlencoded; charset=utf-8");
		req.onload = function(r) {
			var response = JSON.parse(this.responseText);
			showResult(response);
		}
		var comment = {
			c_replyto: document.getElementById("c_replyto").value,
			c_content: document.getElementById("c_content").value,
			c_points: document.getElementById("c_points").value,
			recaptcha_response_field: Recaptcha.get_response(),
			recaptcha_challenge_field: Recaptcha.get_challenge()
		};
		if (document.getElementById("user-data")){
			comment.c_name = document.getElementById("c_name").value;
			comment.c_email = document.getElementById("c_email").value;
			comment.c_link = document.getElementById("c_link").value;
		}
		req.send(encodeParams(comment));
		return false;
	}
	// Resultado de una acción anterior: un comentario
	var result = document.getElementById("result");
	if (result) {
		result.scrollIntoView();
		if (checkLocalStorage()) localStorage.removeItem(getKey());
	}
	var path = decodeArray(window.location.pathname.split("/"));
	sdata = {'p':path[2], 't': path[3], 's': path[4]};		// toda la información de la estación
	gasole = new Gasole(function() {
		sdata.i = this.info[sdata.p][sdata.t][sdata.s];
		breadCrumb("breadcrumb", sdata.i.l);	// miga de pan del detalle
		processData(sdata);
		var title=document.getElementById("maintitle");
		title.textContent="Ficha de la Gasolinera " + 
			sdata.i.l + " en " + toTitle(sdata.s) + ", " + toTitle(sdata.t);
	});
	document.getElementById("chart").onclick = function() {
		document.getElementById("chart").onclick = null;
		this.className="";
		this.textContent="";
		getApiData("history", amChart);
	}
	document.getElementById("send_comment").onclick = postComment;
	// document.getElementById("comment-form").action = postComment;
})