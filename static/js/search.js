window.onload = function() {
	var provinces = document.getElementsByClassName("provincia");
	for (var p=0; p<provinces.length; p++) {
		provinces[p].addEventListener("click", function() {
			alert("hola")
		})
	}
}