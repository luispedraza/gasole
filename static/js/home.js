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
	var gasole = new Gasole(function () {
		var stats = this.stats.stats;
		for (var o in stats) {
			fillPriceDigits(document.getElementById("p_"+FUEL_OPTIONS[o]["short"]).children[0], stats[o].mu);
			fillPriceDigits(document.getElementById("min_"+FUEL_OPTIONS[o]["short"]).children[0], stats[o].min);
			fillPriceDigits(document.getElementById("max_"+FUEL_OPTIONS[o]["short"]).children[0], stats[o].max);
		}
		var date = this.date;
		var updated = date.getDate() + " de " + MONTHS[date.getMonth()];
		updated += " a las " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2);
		document.getElementById("updated").innerHTML = "<sup>*</sup>Precios actualizados el " + updated;
	});
})