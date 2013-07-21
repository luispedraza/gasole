addEvent(window,"load", function() {
	/* Eventos del mapa */
	for (var p in PROVS) {
		prov = document.getElementById("P"+PROVS[p]);
		addEvent(prov,"click", function() {
			var pname = getProvName(this.id.slice(1));
			window.location = window.location.origin + "/gasolineras/" + encodeName(pname);
		});
		addEvent(prov,"mouseover", function() {
			var pname = getProvName(this.id.slice(1));
			document.getElementById("prov-current").textContent = pname;
		});
		addEvent(prov,"mouseout", function() {
			document.getElementById("prov-current").textContent = "lista de provincias";
		});
	}
	initProvLinks("province");
	var gasole = new Gasole(function () {
		var stats = this.stats.stats;
		for (var o in stats) {
			fillPriceDigits(document.getElementById("p_"+FUEL_OPTIONS[o]["short"]).children[0], stats[o].mu);
			fillPriceDigits(document.getElementById("min_"+FUEL_OPTIONS[o]["short"]).children[0], stats[o].min);
			fillPriceDigits(document.getElementById("max_"+FUEL_OPTIONS[o]["short"]).children[0], stats[o].max);
		}
		document.getElementById("updated").innerHTML = "<sup>*</sup> " + formatUpdate(this.date);
	});
})