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
		.replace(/\b[NAE]-.+\b/, function(t) {return t.toUpperCase()});
}
function decodeName(s) {
	return decodeURI(s).replace(/_/g, " ").replace(/\|/g, "/");
}
function prettyName(s) {
	if (s.match("/")) {
		 s = s.split("/")[1];
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
