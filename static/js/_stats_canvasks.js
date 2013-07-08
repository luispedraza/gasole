/* Funciones para dibujar los gráficos con la librería canvasjs */

/* Radar 
marcas en ejes del Radar
cuota de mercado de cada una por provincia */
function canvasDrawRadar(gasole) {
	var data = {
		labels: [],
		datasets: []
	};
	var sAll = gasole.stats.stats;
	var sProvs = gasole.stats.provinces;
	data.labels = BRANDS_GRAPH;
	for (var r=0,l=REGIONS_GRAPH.length; r<l; r++) {
		var p = REGIONS_GRAPH[r];
		var n = sProvs[p]["1"].n;
		var provData = sProvs[p]["1"].brands;
		var nbrand = [];		// Porcentaje de marcas
		for (var b in BRANDS_GRAPH) {
			var brand = BRANDS_GRAPH[b];
			nbrand.push(provData[brand].n*100/n);
		}
		data.datasets.push({
			fillColor : "rgba(220,220,220,0.5)",
			strokeColor : REGIONS_COLORS[r],
			pointColor : REGIONS_COLORS[r],
			pointStrokeColor : "#fff",
			data: nbrand});
	}
	var options = {
		scaleOverride: true,
		scaleSteps : 3,
		scaleStepWidth : 10,
		scaleStartValue : 0,
		scaleShowLabels : true
	}
	var ctx = document.getElementById("radar").getContext("2d");
	var radar = new Chart(ctx).Radar(data, options);
}

/* Dibuja el histograma de precios */
function canvasDrawHist(gasole) {
	var data = {
		labels: [],
		datasets: []
	};
	var sAll = gasole.stats.stats;
	var bins = sAll["1"].bins;
	for (var i=0, l=bins.length-1; i<l; i++)
		data.labels.push(bins[i].toFixed(3)+"-"+bins[i+1].toFixed(3)+" €/l");
	var sProvs = gasole.stats.provinces;
	for (var r=0, l=REGIONS_GRAPH.length; r<l; r++) {
		var p = REGIONS_GRAPH[r];
		data.datasets.push({
			fillColor: REGIONS_COLORS[r], 
			// strokeColor: "rgba(220,220,220,1)",
			data: sProvs[p]["1"].hist.map(function(x) {return x*100/sProvs[p]["1"].n;})});
	}
	var options = {
		scaleOverride: true,
		scaleSteps : 10,
		scaleStepWidth : 10,
		scaleStartValue : 0,
		scaleShowLabels : true,
		barShowStroke : false
	}
	var ctx = document.getElementById("histogram").getContext("2d");
	var histogram = new Chart(ctx).Bar(data, options);
}