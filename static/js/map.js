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
			path.addEventListener("mouseover", function(e) {
				var label = document.getElementById("label");
				var text = document.getElementById(e.target.id+"-txt");
				var x = text.getAttribute("x");
				var y = text.getAttribute("y");
				console.log(x);
				label.style.display = "block";
				label.setAttribute("transform", "translate("+x+","+y+")")
			}, true)
			path.addEventListener("mouseout", function(e) {
				var label = document.getElementById("label");
				label.style.display = "none";
			})
			var color = "rgb(255," + Math.floor(value).toString()+ ",0)"
			path.style.fill = color;
		}
	}
	req.open("get", "http://localhost:8087/data/1/madrid", true)
	req.send()
}