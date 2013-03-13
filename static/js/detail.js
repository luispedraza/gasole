function initMap(latlon) {
	if (!latlon) return;
	var position = new google.maps.LatLng(latlon[0], latlon[1]);
	var mapOptions = {
		center: position,
		zoom: 15,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById("google_map"),
		mapOptions);
	markerCenter = new google.maps.Marker({
    	map: map,
    	position: position
	});
}

function initPoints(val) {
	var stars = document.getElementsByClassName("star");
	for (var s=0; s<stars.length; s++) {
		stars[s].addEventListener("mouseover", function() {
			var id = this.id.split("_")[1];
			var stars = document.getElementsByClassName("star");
			for (var s=0; s<stars.length; s++) {
				var _id=stars[s].id.split("_")[1];
				if (_id<=id) stars[s].className = "star on";
				else stars[s].className = "star";
			}
			var shit = document.getElementById("star_0");
			if (id==0) shit.className = "star shit on";
			else shit.className = "star shit";
			// document.getElementById("c_points").value = id;
		})
		stars[s].addEventListener("click", function() {
			var id = this.id.split("_")[1];
			document.getElementById("c_points").value = id
		})
	}
}

function insertLogo(label) {
	var logoid = getLogo(label);
	if (logoid) {
		var img = document.createElement("img");
		img.src = "/img/logos/" + logoid + "_w.png";
		document.getElementById("logo").appendChild(img);
	}
	else {
		document.getElementById("logo").textContent = label;
	}
}
function initPrice(price) {
	for (var p in price) {
		var type = FUEL_OPTIONS[p]["short"];
		document.getElementById("sec_"+type).style.display = "block";
		document.getElementById("p_"+type).textContent = price[p];
	}
}
function fillReplyTo(id) {
	console.log(id);
	var comment = document.getElementById("comment-"+id);
	document.getElementById("replyto_name").innerHTML = comment.getElementsByClassName("c_name")[0].textContent.bold();
	document.getElementById("replyto_msg").innerHTML = comment.getElementsByClassName("c_content")[0].innerHTML;
	document.getElementById("replyto").style.display = "block";
	document.getElementById("comments").scrollIntoView();
	document.getElementById("c_replyto").value = id;
	document.getElementById("section_title").style.display = "none";
	document.getElementById("section_points").style.display = "none";
	document.getElementById("replyto_cancel").addEventListener("click", function() {
		document.getElementById("replyto").style.display = "none";
		document.getElementById("replyto_name").innerHTML = "";
		document.getElementById("replyto_msg").innerHTML = "";
		document.getElementById("c_replyto").value = "";
		document.getElementById("section_title").style.display = "block";
		document.getElementById("section_points").style.display = "block";
	})
}

window.addEventListener("load", function(){
	var req = new XMLHttpRequest();
	req.onload = function(r) {
		info = JSON.parse(r.target.responseText);
		console.log(info);
		data = info["_data"];
		var province, town, station, date, label, hours, latlon, price;
		for (var p in data) province= p
			for (var t in data[p]) town=t;
				for (var s in data[p][t]) {
					station=s;
					date = data[p][t][s]["date"];
					label = data[p][t][s]["label"];
					hours = data[p][t][s]["hours"];
					latlon = data[p][t][s]["latlon"];
					price = data[p][t][s]["options"];
				}

		document.getElementById("address").textContent = toTitle(station) + " (" + town + ", " + province + ")";
		document.getElementById("hours").textContent = hours;
		insertLogo(label);
		initMap(latlon);
		initPrice(price);

		var commentsDiv = document.getElementById("old_comments");
		var comments = info._comments;
		var points = 0;
		var n_comments = 0;
		for (var c=0; c<comments.length; c++) {
			var newComment = document.createElement("div");
			newComment.className = "c_comment";
			newComment.id = "comment-"+comments[c].id;

			if (comments[c].points!=null) {
				var newCPoints = document.createElement("div");
				var c_points = parseInt(comments[c].points)/10;
				newCPoints.textContent = c_points;
				if (newCPoints.textContent=="0") {
					newCPoints.className = "c_points_0";	
				} else {
					newCPoints.className = "c_points";	
				}
				newComment.appendChild(newCPoints);
				// La puntuación de la gasolinera:
				points = (points*n_comments + c_points)/(n_comments+1);
				n_comments++;
			}

			var newCName = document.createElement("div");
			newCName.className = "c_name";
			if (comments[c].link) newCName.innerHTML = "<a href='" + comments[c].link + "' rel='nofollow'>"+comments[c].name+"</a>";
			else newCName.textContent = comments[c].name;
			newComment.appendChild(newCName);
			var newCDate = document.createElement("div");
			newCDate.className = "c_date";
			newCDate.textContent = new Date(comments[c].date).toLocaleString().split(" ")[0];
			newComment.appendChild(newCDate);
			var newCAvatar = document.createElement("img");
			newCAvatar.className = "c_avatar";
			newCAvatar.src = comments[c].avatar;
			newComment.appendChild(newCAvatar);

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
			newCReply.className = "reply_btn";
			newCReply.id = "replyto-"+comments[c].id;
			newCReply.addEventListener("click", function(e) {
				var id = this.id.split("-")[1];
				fillReplyTo(id);
			})
			newComment.appendChild(newCReply);
			// Div auxiliar para respuestas:
			var newCReplies = document.createElement("div");
			newCReplies.id = "replies-"+comments[c].id;
			newCReplies.className = "replies";
			newComment.appendChild(newCReplies);
			// Inserto el comentario
			if (comments[c].replyto) {
				document.getElementById("replies-"+comments[c].replyto).appendChild(newComment);
			} else {
				commentsDiv.appendChild(newComment);	
			}

		}

		if (document.getElementById("c_replyto").value) {
			fillReplyTo(document.getElementById("c_replyto").value);
		}
		function fillLinkProtocol(e) {
			if (this.value == "")
				this.value = "http://";
		}
		document.getElementById("c_link").addEventListener("click", fillLinkProtocol);
		if (points) {
			document.getElementById("points").innerHTML = points.toFixed(1) + " (" + n_comments + " valoraciones)";
		}

		var chart_data = new google.visualization.DataTable();
		chart_data.addColumn('date', 'Fecha');
		var chart_colors = []
		var history = info._history;
		var init = false;
		for (var h in history){
			if (!init) {
				for (var o in history[h]) {
					chart_data.addColumn('number', o);
					chart_colors.push(FUEL_COLORS[o]);
				}
				init = true;
			}
			var date = h.split("-");
			var values = [];
			for (var o in history[h]) {
					values.push(history[h][o]);
				}

			chart_data.addRows([
				[new Date(date[0], date[1]-1, date[2])].concat(values),
			]);
		}
		chart_data.sort(0);
		
		var options = {
          title: 'Precios',
          theme: 'maximized',
          pointSize: 5,
          colors: chart_colors

        };
		var chart = new google.visualization.LineChart(document.getElementById('chart'));
        chart.draw(chart_data, options);

        /* Puntuaciones (estrellas) */
        initPoints(5);

        if (document.getElementById("c_error")) {
        	document.getElementById("comments").scrollIntoView();
        }
	}
	req.open("GET", document.URL.replace("ficha", "api"), true);
	req.send();
})