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
		/* El mapa pintado con Raphael */
		(function raphaelMap() {
			paper = Raphael("map");
			for (p in PROVS) {
				var prov = paper.path(PATHS[PROVS[p]]).attr({"cursor":"pointer","stroke":"#fff", "stroke-width":0, "fill":"#f00"});
				prov.pname = p;
				prov.click(function() {window.location = "/gasolineras/" + encodeName(this.pname)});
				var hoverIn = function() {
					this.attr("opacity",.5);
					document.getElementById("prov-current").textContent = this.pname.replace("Santa", "Sta.");
				};
				var hoverOut = function() {
					this.attr("opacity",1);
					document.getElementById("prov-current").textContent = "lista de provincias";
				};
				prov.hover(hoverIn,hoverOut,prov,prov);
			}
			paper.setViewBox(-50,0,450,400, true);
		})();
	});
})(window);
