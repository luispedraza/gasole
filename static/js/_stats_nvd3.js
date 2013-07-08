
/* Gráficas con la librería nv.d3.js, basada en d3.js */

function drawHistNVD3() {
	var stats = theStats.stats;
	if (!stats[TYPE]) return;
	var bins = theStats.stats[TYPE].bins;
	sProvs = theStats.provinces;
	var data = [];
	for (p in sProvs) {
		var hist = [];
		for (var h=0, hl=sProvs[p][TYPE].hist.length; h<hl; h++) {
			// hist.push({series:0, x:h, y:sProvs[p][TYPE].hist[h]/sProvs[p][TYPE].n});
			hist.push({x:bins[h], y:sProvs[p][TYPE].hist[h]});
		}
		data.push({key: p, values: hist});
	}
	nv.addGraph(function() {
		var chart = nv.models.multiBarChart();
		chart.xAxis
			.tickFormat(d3.format(',.3f'));
		chart.yAxis
			.tickFormat(d3.format(',.0f'));

		d3.select('#histD3')
			.datum(data)
			.transition().duration(200).call(chart);
		nv.utils.windowResize(chart.update);
		return chart;
	});
}