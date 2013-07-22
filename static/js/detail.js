var POINTS = [
				"Deja mucho que desear",		// 1
				"Las hay mejores",				// 2
				"Está bien en general",			// 3
				"Muy recomendable",				// 8
				"¡Excelente!"					// 10
			]
var gasole = null;	// todo gasole
var sdata = null;	// esta estación
var map = null;				// el mapa
var candidateMark = null; 	// marcador de gasolinera propuesta por el recomendador

function initMap(latlon) {
	if (!latlon) return;
	var position = new google.maps.LatLng(latlon[0], latlon[1]);
	var mapOptions = {
		center: position,
		zoom: 15,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById("map"),
		mapOptions);
	markerCenter = new google.maps.Marker({
    	map: map,
    	position: position,
    	animation: google.maps.Animation.DROP,
		icon: '/img/pump_mark.png'
	});
}

/* Eventos para valoración de una gasolinera */
function initPoints() {
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
	var stars = document.getElementById("c_points_div").getElementsByClassName("star");
	for (var s=0, sl=stars.length; s<sl; s++) {
		addEvent(stars[s],"mouseout", function() {
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
		addEvent(stars[s],"mouseover", function() {
			if (timeOut) clearTimeout(timeOut);
			document.getElementById("c_points_div").className = "";
			var id = this.id.split("_")[1];
			selStar(parseInt(id));
			var msg = document.getElementById("c_points_text");
			msg.textContent = POINTS[id];
			msg.className = "sel";
		});
		addEvent(stars[s],"click", function() {
			var id = this.id.split("_")[1];
			document.getElementById("c_points").value = parseInt(id)+1;
			document.getElementById("c_points_text").className = "sel";
		});
	}
}
function resetError(d) {
	document.getElementById("error_"+d.id).style.display = "none";
	d.className = "";
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
function insertLogo(label) {
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
}

/* Inicializa tablón de precios y reomendador */
function initPrice(price) {
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
		addEvent(dmore,"click", function(e) {
			var radius = 5;
			var type = this.id.split("-")[1];
			var div = document.getElementById("rel-"+type);
			var price = sdata.i.o[type];
			if (this.textContent=="+") {
				this.textContent="x";
				div.className+=" on";
				var g = sdata.i.g;
				if (g) {
					var where = new SearchLocations();
					where.add("esta gasolinera", g);
					where.radius = radius;
					var result = gasole.nearDataArray(where, type, "p");
					console.log(result);
					var rlen=result.length;
					if (rlen) {
						for (var i=rlen-1; i>=0; i--) if (result[i].p>=price) result.splice(i,1);	// precios más caros
						rlen = result.length;
						if (!rlen) {
							div.innerHTML = "<p>La más barata para este combustible en un radio de "+radius+" km.</p>";
							div.innerHTML += "<div class='sprt the_best'></div>";
							return;
						}
						div.textContent = "Hay "+rlen+" gasolineras más baratas en un radio de "+radius+" km.";
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
									candidateMark.setMap(map);
									candidateMark.setPosition(candidate);
									candidateMark.setAnimation(google.maps.Animation.BOUNCE)
								} else {
									// var image = new google.maps.MarkerImage("/img/sprt.png", new google.maps.Size(25, 25, "px", "px"), new google.maps.Point(2,473), null, null);
									candidateMark = new google.maps.Marker({
										map: map,
										position: candidate,
										// icon: image,
										icon: "/img/pump_mark.png",
										animation: google.maps.Animation.BOUNCE
									});
								}
							});
							addEvent(tr,"mouseout", function() {
								if (candidateMark) candidateMark.setMap(null);
							});
							table.appendChild(tr);
						}
						lockScroll(list);
						list.appendChild(table);
						div.appendChild(list);
						return;
					}
				} 
				div.textContent = "No se pueden encontrar otras gasolineras próximas";
			} else {
				this.textContent="+";
				div.innerHTML="";
				div.className = div.className.replace(" on", "");
			}
		});
		dsec.appendChild(dmore);
		var drelated = document.createElement("div");
		drelated.id = "rel-"+p;
		drelated.className = "rel";
		dsec.appendChild(drelated);
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

/* rellena una valoración basada en la puntuación */
function fillStars(div, p) {
	p--;
	div.textContent = POINTS[p]+": ";
	div.className = "c_points";
	for (var s=0; s<5; s++) {
		var star = document.createElement("div");
		star.className = "sprt star_mini";
		star.className += (s<=p) ? " son" : " soff";
		div.appendChild(star);
	}
}

/* Rellena los comentarios de la gasolinera */
function fillComments(comments) {
	var commentsDiv = document.getElementById("old_comments");
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

		var points = comments[c].points;
		if (points) {
			points = parseInt(points);
			total_points+=points;
			var newCPoints = document.createElement("div");
			fillStars(newCPoints,points);
			newComment.appendChild(newCPoints);
			n_comments++;
		}

		var newCAvatar = document.createElement("img");
		newCAvatar.className = "c_avatar";
		newCAvatar.src = comments[c].avatar;
		newComment.appendChild(newCAvatar);

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
function processData(info) {
	document.getElementById("address").textContent = toTitle(info.s) + " (" + info.t + ", " + info.p + ")";
	document.getElementById("hours").textContent = info.i.h;
	insertLogo(info.i.l);
	initMap(info.i.g);
	initPrice(info.i.o);
	(info.c.length!=0) ? fillComments(info.c) : (document.getElementById("no-comments").style.display="block");
	var replyto = document.getElementById("c_replyto");
	if (replyto.value) {
		fillReplyTo(replyto.value);
	}
	// relleno de http:// en c_link
	var clink = document.getElementById("c_link");
	addEvent(clink,"click", function() {
		if (this.value == "")
			this.value = "http://";
	});
	addEvent(clink,"blur", function() {
		if (this.value == "http://")
			this.value = "";
	});

    /* Amchart */
    amChart(info.h);
    /* Puntuaciones (estrellas) */
    initPoints();
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
	// Resultado de una acción anterior: un comentario
	var result = document.getElementById("result");
	if (result) {
		result.scrollIntoView();
		if (checkLocalStorage()) localStorage.removeItem(getKey());
	}
	var error = document.getElementById("error");
	if (error) {
		error.scrollIntoView();
		var lis = error.getElementsByTagName("li");
		for (var l=0; l<lis.length; l++) {
			var cname = lis[l].id.replace("e_", "");
			var e = null;
			if (cname == "c_points") {
				document.getElementById("c_points_div").className = "perror";
			} else {
				var e = document.getElementById(cname);
				if (e) e.className = "error";
			}
		}
	}
	var path = decodeArray(window.location.pathname.split("/"));
	sdata = {'p':path[2], 't': path[3], 's': path[4]};		// toda la información de la estación
	gasole = new Gasole(function() {
		sdata.i = this.info[sdata.p][sdata.t][sdata.s];
		getApiData(function(d) {
			sdata.c = d._comments;
			sdata.h = d._history;
			processData(sdata);
		})
	})
})