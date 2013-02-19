function toTitle(s) {
	return s.replace(" [N]", "")
		.replace(/^CARRETERA ?|^CR\.? ?/, "CTRA. ")
		.replace(/(CTRA. )+/, "CTRA. ")
		.replace(/^AVENIDA ?|^AV. ?/, "AVDA. ")
		.replace(/^POLIGONO INDUSTRIAL ?|POLIGONO ?|P\.I\. ?/, "POL. IND. ")
		.replace(/^CALLE |^CL\.? ?|C\/ ?/, "C/ ")
		.replace(/^RONDA |^RD /, "RDA. ")
		.replace(/^AUTOPISTA ?(AUTOPISTA ?)?/, "AU. ")
		.replace(/^PLAZA ?/, "PZA. ")
		.replace(/^PASEO (PASEO ?)?/, "Pº ")
		.replace(/^TRAVESS?[IÍ]A /, "TRAV. ")
		.replace(/\B[^\d- ]+[ $]/g, function(t) {return t.toLowerCase()})
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
