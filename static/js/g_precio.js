window.addEventListener("load", function(){
	var req = new XMLHttpRequest();
	req.onload = function(r) {
		data = JSON.parse(r.target.responseText);
		if (data) {
			console.log(data);
		}
		
	}
	var url = document.URL;
	req.open("GET", document.URL.replace("graficos/precio", "stats"), true)
	req.send();
})