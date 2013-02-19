window.addEventListener("load", function(){
	var req = new XMLHttpRequest();
	req.onload = function(r) {
		data = JSON.parse(r.target.responseText);
		console.log(data);
		pts = decodeArray(document.location.pathname.split("/").splice(2));
		var province = pts[0];
		var town = pts[1];
		var station = pts[2];
		document.getElementById("sign").innerText = data.info[pts[0]][pts[1]][pts[2]].label;
		var img = document.createElement("img");
		img.src = "/img/logos/" + data.info[pts[0]][pts[1]][pts[2]].label.toLowerCase() + ".png";
		document.getElementById("logo").appendChild(img);

		var commentsDiv = document.getElementById("comments");
		var comments = data.info.comments;
		for (var c in comments) {
			var newComment = document.createElement("div");
			newComment.className = "comment";
			newComment.innerText = comments[c].content;
			commentsDiv.appendChild(newComment);
		}

		// Gráficos
		// var r = Raphael(document.getElementById("history"), 640, 480);
		// // Creates pie chart at with center at 320, 200,	
		// // radius 100 and data: [55, 20, 13, 32, 5, 1, 2]
	
		// var history = data.info.history;
		// xval = []
		// ytemp = {};
		// var ndata = 0;
		// for (var h in history) {
		// 	ndata++;
		// 	xval.push(ndata);
		// 	for (var o in history[h]) {
		// 		if (!ytemp[o]) ytemp[o] = [];
		// 		ytemp[o].push(history[h][o]);
		// 	}
		// }

		// yval = [];
		// for (var y in ytemp) yval.push(ytemp[y]);
		// console.log(yval);

		// r.linechart(0, 0, 400, 400, xval, yval, {smooth: false});
		

		var chart_data = new google.visualization.DataTable();
		chart_data.addColumn('date', 'Fecha');
		var history = data.info.history;
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
		// var annotatedtimeline = new google.visualization.AnnotatedTimeLine(
		// 	document.getElementById('chart'));
		// annotatedtimeline.draw(chart_data, {'displayAnnotations': true});

		var options = {
          title: 'Precios'
        };
		var chart = new google.visualization.LineChart(document.getElementById('chart'));
        chart.draw(chart_data, options);
	}
	req.open("GET", document.URL.replace("ficha", "api"), true);
	req.send();
})