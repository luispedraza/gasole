window.addEventListener("load", function(){
	var req = new XMLHttpRequest();
	req.onload = function(r) {
		info = JSON.parse(r.target.responseText);
		console.log(info);
		data = info["_data"];
		pts = decodeArray(document.location.pathname.split("/").splice(2));
		var province = pts[0];
		var town = pts[1];
		var station = pts[2];
		document.getElementById("sign").innerText = data[pts[0]][pts[1]][pts[2]].label;
		var img = document.createElement("img");
		img.src = "/img/logos/" + data[pts[0]][pts[1]][pts[2]].label.toLowerCase() + ".png";
		document.getElementById("logo").appendChild(img);

		var commentsDiv = document.getElementById("comments");
		var comments = data.comments;
		for (var c in comments) {
			var newComment = document.createElement("div");
			newComment.className = "comment";
			newComment.innerText = comments[c].content;
			commentsDiv.appendChild(newComment);
		}

		var chart_data = new google.visualization.DataTable();
		chart_data.addColumn('date', 'Fecha');
		var history = data.history;
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