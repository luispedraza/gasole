function geoCode() {
	var req = new XMLHttpRequest();
	req.onload = function(r) {
		console.log(r);
	}
	var a = document.getElementById("address").value;
	a.replace(/ /g, '+');
	req.open("get", "http://maps.googleapis.com/maps/api/geocode/json?region=ES&address="+a, true);
	req.send();
}