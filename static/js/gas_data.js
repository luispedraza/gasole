$(document).ready(function() 
    { 
        $("#table").tablesorter();
    } 
);



window.onload = function(){
	var options = document.getElementsByClassName("op");
	for (var i=0; i<options.length; i++) {
		options[i].addEventListener("click", function(e) {
			var items = document.getElementsByClassName(e.target.id);
			console.log(items);
			if (e.target.className.match("off")) {
				for (var j=0; j<items.length; j++) {
					items[j].className = items[j].className.replace(" off", "");
				}
			}
			else {
				for (var j=0; j<items.length; j++) {
					items[j].className += " off";
				}
			}
		})
	}
}