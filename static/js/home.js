window.addEventListener("load", function() {
	/* Eventos del mapa */
	for (var p in PROVS) {
		prov = document.getElementById("P"+PROVS[p]);
		prov.addEventListener("click", function() {
			var pname = getProvName(this.id.slice(1));
			window.location = window.location.origin + "/gasolineras/" + encodeName(pname);
		});
		prov.addEventListener("mouseover", function() {
			var pname = getProvName(this.id.slice(1));
			document.getElementById("prov-current").textContent = pname;
		});
		prov.addEventListener("mouseout", function() {
			document.getElementById("prov-current").textContent = "lista de provincias";
		});
	}
	initProvLinks("province");
	lockScroll("province");
	var gasole = new Gasole(function () {
		console.log(this);
		var stats = this.stats.stats;
		for (var o in stats) {
			document.getElementById("p_"+FUEL_OPTIONS[o]["short"]).textContent = stats[o].mu.toFixed(3);
			document.getElementById("min_"+FUEL_OPTIONS[o]["short"]).textContent = stats[o].min.toFixed(3);
			document.getElementById("max_"+FUEL_OPTIONS[o]["short"]).textContent = stats[o].max.toFixed(3);
		}
	});
})