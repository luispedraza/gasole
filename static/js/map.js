function init(e) {
	if (window.svgDocument == null) {
		svgDoc = e.target.ownerDocument;
	}
}

window.onload = function() {
	var req = new XMLHttpRequest()
	req.onload = function() {
		var data = JSON.parse(req.responseText)
		console.log(data)
		var min = 10
		var max = -10
		for (p in data) {
			var val = Math.log(data[p]*1000)
			if (val < min)
				min = val
			else if (val > max)
				max = val
		}
		range = max-min
		values = []
		for (p in data) {
			values.push(165-Math.floor((Math.log(data[p]*1000)-min)*165/range))
		}
		var provinces = document.getElementsByTagName("path")
		var n = provinces.length
		for (var i=0; i<n; i++) {
			var color = "rgb(255," + Math.floor(values[i]).toString()+ ",0)"
			provinces[i].style.fill = color
		}
	}
	req.open("get", "http://localhost:8084/data/1/madrid", true)
	req.send()
}