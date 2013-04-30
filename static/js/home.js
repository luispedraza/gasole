var PROVS = {
	"Álava": "01",
	"Albacete": "02",
	"Alicante": "03",
	"Almería": "04",
	"Asturias": "33",
	"Ávila": "05",
	"Badajoz": "06",
	"Balears (Illes)": "07",
	"Barcelona": "08",
	"Burgos": "09",
	"Cáceres": "10",
	"Cádiz": "11",
	"Cantabria": "39",
	"Castellón / Castelló": "12",
	"Ceuta": "51",
	"Ciudad Real": "13",
	"Córdoba": "14",
	"Coruña (A)": "15",
	"Cuenca": "16",
	"Girona": "17",
	"Granada": "18",
	"Guadalajara": "19",
	"Guipúzcoa": "20",
	"Huelva": "21",
	"Huesca": "22",
	"Jaén": "23",
	"León": "24",
	"Lleida": "25",
	"Lugo": "27",
	"Madrid": "28",
	"Málaga": "29",
	"Melilla": "52",
	"Murcia": "30",
	"Navarra": "31",
	"Ourense": "32",
	"Palencia": "34",
	"Palmas (Las)": "35",
	"Pontevedra": "36",
	"Rioja (La)": "26",
	"Salamanca": "37",
	"Santa Cruz De Tenerife": "38",
	"Segovia": "40",
	"Sevilla": "41",
	"Soria": "42",
	"Tarragona": "43",
	"Teruel": "44",
	"Toledo": "45",
	"Valencia / València": "46",
	"Valladolid": "47",
	"Vizcaya": "48",
	"Zamora": "49",
	"Zaragoza": "50"};

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
			var c = document.getElementById("prov-current"); 
			c.className = "prov-current on";
			c.textContent = pname;
		});
		prov.addEventListener("mouseout", function() {
			var pname = getProvName(this.id.slice(1));
			var c = document.getElementById("prov-current");
			c.className = "prov-current";
			c.textContent = pname;
		});
	}

	var req = new XMLHttpRequest();
	req.onload = function() {
		info = JSON.parse(this.responseText);
		console.log(info)
	}
	req.open("GET", "/api/All");
	req.send();
})