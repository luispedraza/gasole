var FUEL_OPTIONS = {"1": {"short": "G95", "name": "Gasolina 95"},
				"3": {"short": "G98", "name": "Gasolina 98"},
				"4": {"short": "GOA", "name": "Gasóleo Automoción"},
				"5": {"short": "NGO", "name": "Nuevo Gasóleo A"},
				"6": {"short": "GOB", "name": "Gasóleo B"},
				"7": {"short": "GOC", "name": "Gasóleo C"},
				"8": {"short": "BIOD", "name": "Biodiésel"}}
var FUEL_COLORS = {
	"G95": "#006633",
	"G98": "#339933",
	"GOA": "#000",
	"NGO": "#aaa",
	"GOB": "#CC3333",
	"GOC": "#FF3300",
	"BIOD": "#FFCC33"
}
function toTitle(s) {
	return s.replace(" [N]", "")
		.replace(/^CARRETERA ?|^CR\.? ?/i, "CTRA. ")
		.replace(/(CTRA. )+/i, "CTRA. ")
		.replace(/^AVENIDA ?|^AV. ?/i, "AVDA. ")
		.replace(/^POLIGONO INDUSTRIAL ?|POLIGONO ?|P\.I\. ?/i, "POL. IND. ")
		.replace(/^CALLE |^CL\.? ?|C\/ ?/i, "C/ ")
		.replace(/^RONDA |^RD /i, "RDA. ")
		.replace(/^AUTOPISTA (AUTOPISTA ?)?/i, "AU. ")
		.replace(/^PLAZA ?/i, "PL. ")
		.replace(/^PASEO (PASEO ?)?/i, "Pº ")
		.replace(/^TRAVESS?[IÍ]A /i, "TRAV. ")
		.replace(/^V[ií]A (V[IÍ]A )?/i, "VÍA ")
		.replace(/\B[^\d- ]+[ $]/g, function(t) {return t.toLowerCase()})
		.replace(/\b[NAE]-.+\b/, function(t) {return t.toUpperCase()})
		.replace(/\[D\]$/, "(m.d.)")
		.replace(/\[I\]$/, "(m.i.)")
		.replace(/ \[N\]$/, "")
}
function getLogo(label) {
	if (label) {
		/* Algunos errores del archivo del Ministerio */
		label = label.replace(/camspa/i, "campsa");
		logo = label.match(/\b(abycer|agla|alcampo|andamur|a\.?n\.? energeticos|avia|bonarea|b\.?p\.?|buquerin|campsa|carmoned|carrefour|cepsa|empresoil|eroski|esclatoil|galp|gasolben|iberdoex|leclerc|makro|meroil|norpetrol|petrem|petrocat|petromiralles|petronor|repostar|repsol|saras|shell|simply|staroil|tamoil|valcarce)\b/i);
		if (logo) return logo[0].replace(/\./g, "").replace(/ /g, "_").toLowerCase();	
	}
	return null;
}
function decodeName(s) {
	return decodeURI(s).replace(/_/g, " ").replace(/\|/g, "/");
}
function prettyName(s) {
	if (s.match("/")) {
		 s = s.split("/")[1]; // dos idiomas
	}
	if (s.match(/\)$/)) {
		s = s.match(/\(.+\)$/g)[0]
			.replace("(", "").replace(")", " ") + s.split(" (")[0];
	}
	return s;
}
function decodeArray(a) {
	for (var n=0; n<a.length; n++) {
		a[n] = decodeName(a[n]);
	}
	return a;
}
function encodeName(s) {
	return s.replace(/\//g, "|").replace(/ /g, "_");
}
