function initMap(latlon) {
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

function insertLogo(label) {
	var logoid = label.match(/\b(avia|bp|campsa|carmoned|carrefour|cepsa|galp|petronor|repsol|saras|shell|tamoil)\b/i);
	if (logoid) {
		var img = document.createElement("img");
		img.src = "/img/logos/" + logoid[0].toLowerCase() + ".png";
		document.getElementById("logo").appendChild(img);
	}
	else {
		document.getElementById("logo").textContent = label;
	}
}

window.addEventListener("load", function(){
	var req = new XMLHttpRequest();
	req.onload = function(r) {
		info = JSON.parse(r.target.responseText);
		console.log(info);
		data = info["_data"];
		var province, town, station, date, label, hours, latlon;
		for (var p in data) province= p
			for (var t in data[p]) town=t;
				for (var s in data[p][t]) {
					station=s;
					date = data[p][t][s]["date"];
					label = data[p][t][s]["label"];
					hours = data[p][t][s]["hours"];
					latlon = data[p][t][s]["latlon"];
				}

		document.getElementById("label").innerText = label;
		document.getElementById("address").innerText = toTitle(station) + " (" + town + ", " + province + ")";
		document.getElementById("hours").innerText = hours;
		insertLogo(label);
		initMap(latlon);

		var commentsDiv = document.getElementById("comments");
		var comments = info._comments;
		for (var c in comments) {
			var newComment = document.createElement("div");
			newComment.className = "comment";
			newComment.innerText = comments[c].content;
			commentsDiv.appendChild(newComment);
		}

		var chart_data = new google.visualization.DataTable();
		chart_data.addColumn('date', 'Fecha');
		var history = info._history;
		var init = false;
		for (var h in history){
			if (!init) {
				for (var o in history[h]) {
					chart_data.addColumn('number', o);
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
          title: 'Precios'
        };
		var chart = new google.visualization.LineChart(document.getElementById('chart'));
        chart.draw(chart_data, options);
	}
	req.open("GET", document.URL.replace("ficha", "api"), true);
	req.send();
})