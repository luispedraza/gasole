window.addEventListener("load", function(){
	var req = new XMLHttpRequest();
	req.onload = function(r) {
		data = JSON.parse(r.target.responseText);
		if (data) {
			console.log(data);
			drawPriceMap(data, "1");

			document.getElementById("hide").addEventListener("change", function() {
				drawPriceMap(data, "5", this.checked);
			})
		}
		
	}
	var url = document.URL;
	req.open("GET", document.URL.replace("graficos/precio", "stats"), true)
	req.send();
})