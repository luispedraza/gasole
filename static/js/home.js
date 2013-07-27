(function(w) {
	addEvent(w,"load", function() {
		initProvLinks("province");	// lista de provincias
		var gasole = new Gasole(function () {
			var stats = this.stats.stats,
				type,data;
			for (var o in stats) {
				type = FUEL_OPTIONS[o]["short"];
				data = stats[o];
				fillPriceDigits(document.getElementById("p_"+type).children[0], data.mu);
				fillPriceDigits(document.getElementById("min_"+type).children[0], data.min);
				fillPriceDigits(document.getElementById("max_"+type).children[0], data.max);
			}
			document.getElementById("updated").innerHTML = "<sup>*</sup> " + formatUpdate(this.date);
		});
		/* Eventos del mapa */
		for (var p in PROVS) {
			prov = document.getElementById("P"+PROVS[p]);
			addEvent(prov,"click", function() {
				var pname = getProvName(this.id.slice(1));
				window.location = "/gasolineras/" + encodeName(pname);
			});
			addEvent(prov,"mouseover", function() {
				var pname = getProvName(this.id.slice(1));
				document.getElementById("prov-current").textContent = pname;
			});
			addEvent(prov,"mouseout", function() {
				document.getElementById("prov-current").textContent = "lista de provincias";
			});
		};
	});
})(window);
