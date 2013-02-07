function init(e) {
	if (window.svgDocument == null) {
		svgDoc = e.target.ownerDocument;
	}
}

function normalizeString (s) {
	var r = s.toLowerCase().split(" (")[0].split(" /")[0];
	r = r.replace(/á/g, "a");
	r = r.replace(/é/g, "e");
	r = r.replace(/í/g, "i");
	r = r.replace(/ó/g, "o");
	r = r.replace(/ú/g, "u");
	r = r.replace(/ñ/g, "n");
	r = r.replace(/ /g, "_");
	return r;
}
var timeout;
window.onload = function() {
	var req = new XMLHttpRequest()
	req.onload = function() {
		var data = JSON.parse(req.responseText);
		var min = 10;
		var max = -10;
		for (p in data) {
			var val = Math.log(data[p]*1000)
			if (val < min)
				min = val;
			else if (val > max)
				max = val;
		}
		range = max-min;
		for (p in data) {
			var value = 165-Math.floor((Math.log(data[p]*1000)-min)*165/range);
			console.log(normalizeString(p));
			var path = document.getElementById(normalizeString(p));
			path.setAttribute("value", data[p].toFixed(2))
			path.addEventListener("mouseover", function(e) {
				clearTimeout(timeout);
				e.preventDefault();
				var label = document.getElementById("label");
				var text = document.getElementById(e.target.id+"-txt");
				var x = text.getAttribute("x");
				var y = text.getAttribute("y");
				label.style.display = "block";
				label.setAttribute("transform", "translate("+x+","+y+")")
				document.getElementById("label_value").firstChild.nodeValue = e.target.getAttribute("value")
				console.log(e.target.getAttribute("value"))
				timeout = setTimeout(function() {
					var label = document.getElementById("label");
					label.style.display = "none";
				}, 3000)
			})
			var color = "rgb(255," + Math.floor(value).toString()+ ",0)"
			path.style.fill = color;
		}
	}
	// req.open("get", "http://gasole-app.appspot.com/data/1/madrid", true)
	req.open("get", "http://localhost:8080/data/1/madrid", true)
	req.send()
}