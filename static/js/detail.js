var POINTS = [
				"Deja mucho que desear",		// 1
				"Las hay mejores",				// 2
				"Está bien en general",			// 3
				"Muy recomendable",				// 8
				"¡Excelente!"					// 10
			]

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

var timeOut=null;
function initPoints() {
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
	// document.getElementById("c_points_div")
	for (var s=0; s<stars.length; s++) {
		stars[s].addEventListener("mouseout", function() {
			var val = document.getElementById("c_points").value;
			var msg = document.getElementById("c_points_text");
			console.log("out");
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
		stars[s].addEventListener("mouseover", function() {
			console.log("over");
			if (timeOut) clearTimeout(timeOut);
			document.getElementById("c_points_div").className = "";
			var id = this.id.split("_")[1];
			selStar(parseInt(id));
			var msg = document.getElementById("c_points_text");
			msg.textContent = POINTS[id];
			msg.className = "sel";
		});
		stars[s].addEventListener("click", function() {
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
	var logoid = getLogo(label);
	if (logoid) {
		var img = document.createElement("img");
		img.src = "/img/logos/" + logoid + "_w.png";
		document.getElementById("station-logo").appendChild(img);
	}
	else {
		document.getElementById("station-logo").textContent = label;
	}
}
function initPrice(price) {
	for (var p in price) {
		var type = FUEL_OPTIONS[p]["short"];
		document.getElementById("sec-"+type).style.display = "block";
		var priceDiv = document.getElementById(type);
		var digits = price[p].toFixed(3);
		for (var d=0; d<digits.length; d++){
			var digitBack = document.createElement("div");
			digitBack.className = "back";
			if (digits[d]==".") digitBack.className += " point";
			else digitBack.textContent = 8;
			var digitDiv = document.createElement("div"); 
			digitDiv.className = "digit"; 
			digitDiv.textContent = digits[d];
			digitBack.appendChild(digitDiv);
			priceDiv.appendChild(digitBack);
		}
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
	document.getElementById("replyto_cancel").addEventListener("click", function() {
		document.getElementById("replyto").style.display = "none";
		document.getElementById("replyto_name").innerHTML = "";
		document.getElementById("replyto_msg").innerHTML = "";
		document.getElementById("c_replyto").value = "";
		document.getElementById("section_points").style.display = "block";
	})
}

function processData(info) {
	console.log(info);
	data = info["_data"];
	var province, town, station, date, label, hours, latlon, price;
	for (var p in data) province = p;
	for (var t in data[p]) town = t;
	for (var s in data[p][t]) {
		station=s;
		date = data[p][t][s]["d"];
		label = data[p][t][s]["l"];
		hours = data[p][t][s]["h"];
		latlon = data[p][t][s]["g"];
		price = data[p][t][s]["o"];
	}

	document.getElementById("address").textContent = toTitle(station) + " (" + town + ", " + province + ")";
	document.getElementById("hours").textContent = hours;
	insertLogo(label);
	initMap(latlon);
	initPrice(price);

	var commentsDiv = document.getElementById("old_comments");
	var comments = info._comments;
	var total_points = 0;
	var n_comments = 0;
	for (var c=0; c<comments.length; c++) {
		var newCommentBlock = document.createElement("div");
		newCommentBlock.className = "c_block";
		newCommentBlock.id = "block-"+comments[c].id;

		var newComment = document.createElement("div");
		newComment.className = "c_comment";
		newComment.id = "comment-"+comments[c].id;

		if (comments[c].points!=null) {
			var newCPoints = document.createElement("div");
			var points = parseInt(comments[c].points);
			total_points+=points;
			points-=1;
			newCPoints.textContent = POINTS[points];
			newCPoints.className = "c_points";
			for (var p=0; p<5; p++) {
				var star = document.createElement("div");
				star.className = "sprt star_mini";
				star.className += (p<=points) ? " son" : " soff";
				newCPoints.appendChild(star);
			}
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
		newCReply.addEventListener("click", function(e) {
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

	if (document.getElementById("c_replyto").value) {
		fillReplyTo(document.getElementById("c_replyto").value);
	}
	// relleno de http:// en c_link
	document.getElementById("c_link").addEventListener("click", function() {
		if (this.value == "")
			this.value = "http://";
	});
	document.getElementById("c_link").addEventListener("blur", function() {
		if (this.value == "http://")
			this.value = "";
	});
	if (total_points!=0) {
		var points = total_points/n_comments;
		document.getElementById("points").innerHTML = points.toFixed(1) + " (" + n_comments + " valoraciones)";
	}

    /* Amchart */
    amChart(info._history);
	// this method is called when chart is inited as we listen for "dataUpdated" event
	function zoomChart() {
		// different zoom methods can be used - zoomToIndexes, zoomToDates, zoomToCategoryValues
		amchart.zoomToIndexes(chartData.length - 40, chartData.length - 1);
	}


    /* Puntuaciones (estrellas) */
    initPoints();
}

function amChart(chartData) {
	var chart;
	for (var i in chartData) chartData[i].d = new Date(chartData[i].d);
	AmCharts.ready(function() {
	    // SERIAL CHART
	    chart = new AmCharts.AmSerialChart();
	    chart.pathToImages = "http://www.amcharts.com/lib/images/";
	    chart.zoomOutButton = {
	        backgroundColor: '#000000',
	        backgroundAlpha: 0.15
    	};
	    chart.dataProvider = chartData;
	    chart.marginTop = 10;
	    chart.autoMarginOffset = 3;
	    chart.marginRight = 0;        
	    chart.categoryField = "d";
	    chart.addListener("dataUpdated", zoomChart);
	    // AXES
	    // Category
	    var categoryAxis = chart.categoryAxis;
	    categoryAxis.parseDates = true;
	    categoryAxis.gridAlpha = 0.07;
	    categoryAxis.axisColor = "#DADADA";
	    categoryAxis.startOnAxis = true;
	    categoryAxis.showLastLabel = false;
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
		    graph.fillAlphas = 0.8;
		    graph.lineColor = CHART_OPTIONS[o].color;
		    chart.addGraph(graph);
	    }
	    // LEGEND
	    var legend = new AmCharts.AmLegend();
	    legend.position = "top";
	    chart.addLegend(legend);
	    // SCROLLBAR
	    var chartScrollbar = new AmCharts.ChartScrollbar();
	    chart.addChartScrollbar(chartScrollbar);
	    // CURSOR
	    var chartCursor = new AmCharts.ChartCursor();
	    chartCursor.zoomable = false; // as the chart displayes not too many values, we disabled zooming
	    chartCursor.cursorAlpha = 0;
	    chart.addChartCursor(chartCursor);
	    // WRITE
	    chart.write("chart");
	    function zoomChart() {
		    // different zoom methods can be used - zoomToIndexes, zoomToDates, zoomToCategoryValues
		    chart.zoomToIndexes(chartData.length - 40, chartData.length - 1);
		}
	});
}

window.addEventListener("load", function() {
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
	getData(processData);
})