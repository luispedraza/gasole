var theGasole = null;	// El objeto gasole obtenido de la API, con toda la información
var theInfo = null;		// La información de la selección actual
var theStats = null;	// Estadísticas de la selección actual
var theGrid = null;		// La rejilla para el mapa
var TYPE = "1";			// Tipo de combustible seleccionado
var heatPoints = [];	// Lista de puntos para el mapa de calor
var histogram = new Histogram();
var circles = new Circles();
var brands = new Brands();

var openMap = null;
var openMapOSM = null;
var markersLayer = null,	// marcadores de gasolineras
	heatmapLayer = null,	// concentración de gasolineras
	priceLayer = null;		// retícula de precio de gasolineras
var MAP_LIMITS = [27.5244,43.3781,-18.4131,3.8672];	// vista inicial de open maps (Todas España)
var NBINS = 10; 			// Para el histograma
var GRID_RESOLUTION = 40000;		// TAMAÑO DE LA RETÍCULA EN km (50 km)

// Regiones a mostrar en las gráficas
REGIONS = {}		// Guardará las regiones a mostrar y sus colores
for (var p in PROVS) {
	var id = PROVS[p]
	REGIONS[p] = {id:id, color: null, picker: null, selected: false, path: PATHS[id]};
}

var BRANDS = {"alcampo":1,"avia":1, "bp":1, "campsa":1,"carrefour":1,"cepsa":1,"eroski":1,"galp":1,"leclerc":1, "makro":1,"petronor":1,"repsol":1,"saras":1, "shell":1, "otras":1};
// ¿Es la marca una de las principales ?
function checkBrand(b) {
	var brand = getLogo(b);
	return ((brand in BRANDS) ? brand : "otras");
}

// Provincias a saltar (régimen tributarioe specífico)
var SKIP = ["Ceuta", "Melilla", "Santa Cruz De Tenerife", "Palmas (Las)"];
var skip = false;
/* Hay que omitir una provincia ? */
function skipProv(p) {return (skip && (SKIP.indexOf(p)>=0));}
// Colores y precios máximo y mínimo para representación gráfica
var CMIN = [0,255,0];	// verde para las baratas
var CMU = [255,255,0]	// amarillo para las intermedias
var CMAX = [255,0,0];	// rojo para las caras
var CNA = "#ccc";		// color de provincias no mostradas

function reprojectLatLon(latlon) {
	var proj = new OpenLayers.Projection("EPSG:4326");
	var point = new OpenLayers.LonLat(latlon[1], latlon[0]);
	point.transform(proj, openMap.getProjectionObject());
	return point;
}

/* Confierte tres componentes de color en rgb */
function array2color(a) {return "rgb(" + a.join(",") + ")";}
// Obtiene un color para un precio, interpolado entre dos colores extremos
/** @constructor */
function PriceColorPicker() {
	this.colorCache={};
	this.get = function(x, xmin, xmax, xmu) {
		if (x in this.colorCache) return this.colorCache[x];
		if (xmax==xmin) return array2color(CMU);
		if (x>=xmax) return array2color(CMAX);
		if (x<=xmin) return array2color(CMIN);
		if (typeof xmu == "undefined") xmu = (xmin+xmax)/2;	// media aritmética
		var cmin=CMIN,cmax=CMAX;
		if (x<xmu) {xmax=xmu;cmax=CMU}
		else {xmin=xmu;cmin=CMU};
		var rgb = [];
		for (var c=0; c<3; c++) {
			var val = cmin[c] + (x-xmin) * (cmax[c]-cmin[c]) / (xmax-xmin);
			rgb[c] = (val<0) ? 0 : Math.round(Math.min(255,val));
		}
		var color = array2color(rgb);
		this.colorCache[x] = color;
		return color;
	}
}

/* Actualización del mapa de Raphael */
function raphaelUpdate() {
	if (!theStats) return;
 	var pstats = theStats.provinces;
	// rango de precios
	var prices = [];
	for (var p in pstats) if (pstats[p][TYPE]) prices.push(pstats[p][TYPE].mu);
	// precios medios máximo y mínimo
	var min = d3.min(prices);
	var max = d3.max(prices);
	var mu = d3.mean(prices);
	var priceColor = new PriceColorPicker();
	paper.forEach(function(e) {
		if (e.pname) {
			if (skipProv(e.pname)) {
				e.hide();			// Ocultamos el elemento
			} else {
				e.show();			// Mostramos el elemento
				var currentProvince = pstats[e.pname];
				if (currentProvince) {
					var price = currentProvince.hasOwnProperty(TYPE) ? currentProvince[TYPE].mu : null;
					var fill =  price ? priceColor.get(price, min, max, mu) : CNA;
					e.attr({fill:fill});	
				} else e.attr({fill:"#333"});
			}
		}
	});
}

/* Zoom en el mapa a la provincia seleccionada */
function openMapZoom(pname) {
	var g = null;
	if (pname) {
		var info = theGasole.stats.provinces[pname][TYPE];
		if (info) g = info.g;
	} else  {
		g = MAP_LIMITS;
	}
	if (g) {
		bl = reprojectLatLon([g[0],g[2]]); // bottom-left
		tr = reprojectLatLon([g[1],g[3]]); // top-right
		openMap.zoomToExtent([bl.lon, bl.lat, tr.lon, tr.lat]);
	}
}

/* Dibujo de los marcadores visibles en el mapa */
function drawMarkers() {
	markersLayer.clearMarkers();
	if (openMap.getZoom()<10) return;
	var bounds = markersLayer.getExtent();
	gasoleProcess(theInfo, function(station, p, t, s) {
		if (station.o[TYPE] && station.ll) {
			var lonlat = station.ll;
			if (bounds.containsLonLat(lonlat)) {
				var icon = new OpenLayers.Icon(null, new OpenLayers.Size(30,20));
				var logo = getLogo(station.l);
				icon.imageDiv.className = "logo "+(logo || "otra");
				var marker = new OpenLayers.Marker(lonlat, icon);
				marker.url = encodeName(p)+"/"+encodeName(t)+"/"+encodeName(s);
				marker.events.register("click", marker, function() {window.open("/ficha/"+this.url)});
				markersLayer.addMarker(marker);
			}
		}
	})
}

/* Inicialización de open map */
function openMapinit() {
	// NO BORRAR ESTA FUNCIÓN, ES PARA USAR EL MAPA DE MAPBOX
	// function initMapbox() {
	// 	var openMapOSM = new OpenLayers.Layer.XYZ(
	// 	    "MapBox Streets",
	// 	    [
	// 	        "http://a.tiles.mapbox.com/v3/luispedraza.map-prx7qlbc/${z}/${x}/${y}.png",
	// 	        "http://b.tiles.mapbox.com/v3/luispedraza.map-prx7qlbc/${z}/${x}/${y}.png",
	// 	        "http://c.tiles.mapbox.com/v3/luispedraza.map-prx7qlbc/${z}/${x}/${y}.png",
	// 	        "http://d.tiles.mapbox.com/v3/luispedraza.map-prx7qlbc/${z}/${x}/${y}.png"
	// 	    ], {
	// 	        attribution: "Tiles &copy; <a href='http://mapbox.com/'>MapBox</a> | " + 
	// 	            "Data &copy; <a href='http://www.openstreetmap.org/'>OpenStreetMap</a> " +
	// 	            "and contributors, CC-BY-SA",
	// 	        sphericalMercator: true,
	// 	        wrapDateLine: true,
	// 	        transitionEffect: "resize",
	// 	        buffer: 1,
	// 	        numZoomLevels: 17
	// 	    }
	// 	);
	// 	return new OpenLayers.Map({
	// 	    div: "openmap",
	// 	    layers: [openMapOSM],
	// 	    controls: [
	// 	        new OpenLayers.Control.Attribution(),
	// 	        new OpenLayers.Control.Navigation({
	// 	            dragPanOptions: {
	// 	                enableKinetic: true
	// 	            }
	// 	        }),
	// 	        new OpenLayers.Control.Zoom(),
	// 	        new OpenLayers.Control.Permalink({anchor: true})
	// 	    ]
	// 	});
	// }
	function initOpenstreet() {
		var aliasproj = new OpenLayers.Projection("EPSG:3857");
		map = new OpenLayers.Map("openmap")
		openMapOSM = new OpenLayers.Layer.OSM("OpenStreetMap");
		openMapOSM.projection = aliasproj;
		map.addLayer(openMapOSM);
		return map;
	}
	openMap = initOpenstreet();

	// Capa de marcadores de gasolineras
	function initMarkers() {
		var markers = new OpenLayers.Layer.Markers("Marcadores de gasolineras");
		openMap.addLayer(markers);
		// Aprovechamos para calcular los objetos lonlat
		gasoleProcess(theGasole.info, function(s) {
			if (s.g) s.ll = reprojectLatLon(s.g);	// LonLat en metros
		})
		openMap.events.register("zoomend", markers, drawMarkers);
        openMap.events.register("moveend", markers, drawMarkers);
		return markers;
	}
	/* Concentración de gasolineras */
	function initHeatMap() {
		var options = { radius:10,
						gradient: {0.5: "cyan", 0.6: "blue", 1.0: "magenta"}};
		var heatlayer = new OpenLayers.Layer.Heatmap(
			"Concentración: Mapa de calor", 
			openMap, openMapOSM, options,
			{isBaseLayer: false, opacity: 0.2, projection: new OpenLayers.Projection("EPSG:4326")});
		openMap.addLayer(heatlayer);
		return heatlayer;
	}
	/* Retícula de precios de combustible */
	function initPriceGrid() {
		var retLayer = new OpenLayers.Layer.Vector("Precio: Retícula coloreada");
		retLayer.hasResolution = true;	// opción para mostrar spinner en control de capas
		openMap.addLayer(retLayer);
		return retLayer;
	}
	priceLayer = initPriceGrid();
	heatLayer = initHeatMap();
	markersLayer = initMarkers();
	openMapZoom();
}

/* Actualización de la rejilla de precios */
function drawPriceGrid() {
	priceLayer.removeAllFeatures();			// limpieza
	if (!theGrid || !theStats.stats[TYPE]) return;
	var pmin = theStats.stats[TYPE].min,
		pmax = theStats.stats[TYPE].max,
		pmu = theStats.stats[TYPE].mu,
		grid = theGrid.grid,
		features = [],
		priceColor = new PriceColorPicker();
	for (var x in grid) {
		var xo = grid[x].x;
		for (var y in grid[x]) {
			var data = grid[x][y],
				yo = data.y,
				color = priceColor.get(data.p, pmin, pmax, pmu);
			var poly = new OpenLayers.Bounds(xo,yo,xo+GRID_RESOLUTION,yo+GRID_RESOLUTION).toGeometry();
			var polygonFeature = new OpenLayers.Feature.Vector(poly);
			polygonFeature.style = {fillColor: color, strokeColor: "#fff", strokeWidth: 1, fillOpacity: .5};
			features.push(polygonFeature);
		}
	}
	priceLayer.addFeatures(features);
}

function drawHeatMap() {
	heatLayer.setDataSet({max: 1, data: (theStats.stats[TYPE] ? heatPoints : [])});	// mapa de calor
}
/* Inicialización de raphael */
function raphaelInit() {
	paper = Raphael("raphael");
	for (p in REGIONS) {
		var prov = paper.path(REGIONS[p].path).attr({"stroke": "#fff", "stroke-width": 0});
		prov.pname = p;
		prov.click(function() {
			checkProvince(document.getElementById("plist-"+PROVS[this.pname]));
			updateAll();
		});
		var hoverIn = function() {
			this.attr("opacity",.5);
			var pname = this.pname;
			document.getElementById("prov-current").textContent = pname;
			pdata = theGasole.stats.provinces[pname][TYPE];
			if (pdata) {
				var price = pdata.mu;
				var box = this.getBBox();
				var xpos = (box.cx<(paper.width/3)) ? (box.x2) : (box.x-190);
				var rect = paper.rect(xpos, box.cy, 190, 50, 5).attr({"stroke":"#fff", "fill": "#7e2516","stroke-width": 3});
				var info = pname+", "+ FUEL_OPTIONS[TYPE].name +"\n";
				info+=pdata.n+" puntos de venta\n";
				info+=price.toFixed(3) + " €/l de media";
				var text = paper.text(xpos+5, box.cy+25, info);
				text.attr({"fill": "#fff", "text-anchor": "start", "font-size": "11px"});
				paper.tooltip = paper.set();
				paper.tooltip.push(rect);
				paper.tooltip.push(text);
			}
			
		};
		var hoverOut = function() {
			this.attr("opacity",1);
			document.getElementById("prov-current").textContent = "Provincias";
			paper.tooltip.forEach(function(e){e.remove()});
		};
		prov.hover(hoverIn,hoverOut,prov,prov);
		prov.node.setAttribute("class", "prov");
		REGIONS[p].path = prov;
	}
	paper.setViewBox(-50,0,450,400, true);
}
/* Marca o desmarca una provincia */
function checkProvince(pDiv, check) {
	var region = REGIONS[pDiv.textContent];
	if (typeof check == "undefined") check = !region.selected;
	// Marca/desmarca una provincia
	pDiv.className = check ? "on" : "";
	if (check && !region.color) {		// creación del selector de color
		var pickerOptions = {pickerPosition: 'right',pickerClosable: true};
		var div = document.createElement("div");
		div.className="config";
		var col = document.createElement("input");
		col.value = Raphael.getColor().slice(1);	// nuevo color
		col.className = "color";
		region.color = new jscolor.color(col, pickerOptions);
		addEvent(col, "change", function() {updateAll(false);});
		div.appendChild(col);
		pDiv.appendChild(div);
	}
	region.selected = check;
}

/* Todas las funciones de control de los gráficos */
function initControl() {
	/* Despliega una lista de opciones */
	function dropList(e) {
		stopEvent(e);
		var cname = this.className;
		this.className = cname ? "" : "on";
	}
	/* Inicializa el selector de opcions de combustible y sus eventos */
	function initOptions() {
		function selectType() {
			var options = document.getElementById("type").getElementsByTagName("li");
			for (var o=options.length; o>0;) {
				var current = options[--o];
				current.className = current.className.replace(" on", "");
				if (current.id.match(TYPE)) current.className+=" on";
			}
		}
		var div = document.getElementById("type");
		for (var o in FUEL_OPTIONS) {
			var li = document.createElement("li");
			li.id = "o-"+o;
			li.textContent = FUEL_OPTIONS[o].name;
			li.className = "T_"+FUEL_OPTIONS[o]["short"];
			div.appendChild(li);
			li.onclick = function(e) {
				TYPE = this.id.split("-")[1];
				selectType();
				updateAll();
				return stopEvent(e);
			};
		}
		document.getElementById("type-list").onclick = dropList;
		selectType(TYPE);
	}
	/* Inicializa el selector de provincias y sus eventos */
	function initProvinces() {
		// Marcar/desmarcar todas
		document.getElementById("checkall").onclick = function(e) {
			var cname = this.className;
			var check = (cname!="on");
			this.textContent = (check ? "Desmarcar" : "Marcar") + " Todas";
			this.className = check ? "on" : "";
			provs = document.getElementById("province").getElementsByTagName("li");
			for (var i=2,il=provs.length; i<il; i++) {
				checkProvince(provs[i], check);	// Marca/desmarca todas las provincias
			}
			updateAll();
			return stopEvent(e);
		};
		// Excluir Ceuta, Melilla, Canarias
		document.getElementById("hide").onclick = function(e) {
			var cname = this.className;
			var check = (cname!="on"); 
			this.className = check ? "on" : "";
			skip = check;
			var lis = document.getElementById("province").getElementsByTagName("li");
			for (var l=0, ll=lis.length; l<ll; l++) {
				var li = lis[l];
				li.style.display = skipProv(li.textContent) ? "none" : "block";
			}
			updateAll();
			return stopEvent(e);
		}
		// Explicación 
		var why = document.getElementById("whyhide");
		why.onmouseover = function(e) {
			document.getElementById("hide").style.height = "250px";
		}
		why.onmouseout = function() {
			document.getElementById("hide").style.height = "";
		}
		// Selector de provincias en TOOL
		initProvLinks("province", function(e) {
			checkProvince(this);
			updateAll();
			return stopEvent(e);
		});
		// desplegar la lista de provincias
		document.getElementById("prov-list").onclick = dropList;
	}
	initOptions();			// Selector de tipo de combustible
	initProvinces();		// Selector de provincias en la barra
	// Apilar barras
	addEvent(document.getElementById("stack"), "change", function() {
		histogram.stacked = this.checked; histogram.draw();
	});
	// Mostrar dispersión
	addEvent(document.getElementById("spread"), "change", function() {
		circles.spread = this.checked; circles.draw();
	})
	// Ocultar todos los desplegables
	addEvent(document, "click", function() {
		if (document.getElementsByClassName("picker").length==0) {
			document.getElementById("prov-list").className =
			document.getElementById("type-list").className = "";	
		}
	})
	function initLayers() {
		/** @constructor */
		function Spinner(div) {
			if (div.querySelector(".spinner")) return;
			var spinner = document.createElement("div");
				spinner.className = "spinner";
			var value = document.createElement("div");
			value.textContent = "Resolución: " + GRID_RESOLUTION/1000 + " km.";
			var bUp = document.createElement("div");
				bUp.className = "button up";
				spinner.appendChild(bUp);
			var bDown = document.createElement("div");
				bDown.className = "button down";
				spinner.appendChild(bDown);
			spinner.appendChild(value);
			div.appendChild(spinner);
			function valueChange(m) {
				var newValue = GRID_RESOLUTION+m*20000;
				if ((newValue<=0) || (newValue>300000)) return;
				GRID_RESOLUTION=newValue;
				value.textContent = "Resolución: " + newValue/1000 + " km.";
				theGrid = new PriceGrid(theStats.stats[TYPE]);
				gasoleProcess(theInfo, callbackGrid);
				drawPriceGrid();
			}
			bUp.onclick = function(e) {stopEvent(e);valueChange(1)};
			bDown.onclick = function(e) {stopEvent(e);valueChange(-1)};
		}
		var layers = document.getElementById("layers-list");
		for (var l=0,ll=openMap.layers.length; l<ll; l++) {
			var layer = openMap.layers[l];
			var li = document.createElement("li");
			if (layer.getVisibility()) li.className="on";
			var name = document.createElement("div");
			name.className = "layer-name";
			name.textContent = layer.name;
			li.appendChild(name);
			layers.appendChild(li);
			if (layer.hasResolution) new Spinner(li);
			addEvent(li, "click", function() {
				var name = this.getElementsByClassName("layer-name")[0].textContent;
				var layer = openMap.getLayersByName(name)[0];
				if (layer) {
					var visible = !(this.className=="on");
					layer.setVisibility(visible);
					this.className = (visible) ? "on" : "";
				}
			});
		}
	}
	initLayers();
	/* La barra de controles */
	function initToolbar() {
		addEvent(window, "scroll", function() {
			var toolbar = document.getElementById("toolbar");
			var tcontainer = document.getElementById("toolbar-container");
			if (tcontainer.getBoundingClientRect().top<=0) {
				toolbar.style.position = "fixed"; toolbar.style.top = 0;
			} else 
				toolbar.style.position = "relative";
		})
	}
	initToolbar();
}

/** @constructor */
function Circles(spread) {
	this.spread = false;
	this.draw = function() {
		// Gráfico de bolas
		// Número de gasolineras en el eje de las X
		// Precio medio del combustible en el eje de las Y
		var RZOOM = 3000;		// radio de zoom en una provincia
		var stats = theStats.stats[TYPE];
		showChartContainer("circles", stats!=null);
		if (!stats) return;
		var div = d3.select("#circles");
		var provinces = theStats.provinces;
		var data = [];
		var radius = 20;						// radio de las pelotas
		var prices = [];
		var xMin = stats.min;
		var xMax = stats.max;
		var yMin = 10000;
		var yMax = 0;
		for (var p in REGIONS) {				// para todas las regiones
			var current = provinces[p];
			if (current && current[TYPE]) {
				current = current[TYPE];
				var n = current.n;
				var color = "#"+REGIONS[p].color;
				var price = current.mu;
				prices.push(price);	// todos los precios medios
				if (this.spread) 
					data.push({name: p, p: price, n: n, c: color, r: radius, min: current.min, max: current.max});
				else 
					data.push({name: p, p: price, n: n, c: color, r: radius, min: 0, max: 0});
				if (n>yMax) yMax = n;
				if (n && (n<yMin)) yMin = n;					
			} else {
				data.push({name: p, p: 0, n: 0, c: "#ccc", r:0, min: 0, max:0});
			}
		}
		if (!this.spread && (prices.length>1)) {
			xMin = d3.min(prices);
			xMax = d3.max(prices);
		}
		// Ordenación alfabética
		data.sort(function(a,b) {return sortName(a.name, b.name)});
		divWidth = parseInt(div.style("width").split("px")[0]);
		divHeight = parseInt(div.style("height").split("px")[0]);

		var margin = {top: 5+radius, right: 5+radius, bottom: 50+radius, left: 50+radius},

			width = divWidth - margin.left - margin.right,
			height = divHeight - margin.top - margin.bottom;

		var x = d3.scale.linear()
			.domain([xMin, xMax])
			.range([0,width]);
		var y = d3.scale.log()
			.domain([yMin, yMax])
			.range([height,radius]);
		var xAxis = d3.svg.axis()
			.scale(x)
			.orient("bottom")
			.ticks(5)
			.tickFormat(d3.format(".3f"));
			
		var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left")
			.ticks(10)
			.tickFormat(d3.format(".0f"));

		var chart = div.select(".chart");
		if (chart[0][0]==null) {
			chart = div.append("svg")
				.attr("width", "100%")
				.attr("height", "100%")
				.append("g")
				.attr("class", "chart")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
				.attr("width",width+"px").attr("height",height+"px");
			chart.append("g").attr("class", "shapes");
			chart.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + height + ")");
			chart.append("g")
				.attr("class", "y axis");
			chart.append("g").attr("class", "legend")
				.attr("transform", "translate(0," + (height+40) + ")");
		}
		var shapes = chart.select(".shapes");
		var legend = chart.select(".legend");
		// Muestra la leyenda sobre la información pasada como parámetro
		function showLegendItem(i, show, node) {
			if (!node) node = d3.select(legend.selectAll("rect")[0][i]);
			if (show) {
				node.transition().duration(50).attr("y",5).attr("height",15);
				legend.selectAll("text")[0][i].style.display = "block";
				
			} else {
				node.transition().duration(50).attr("y",10).attr("height",10);
				legend.selectAll("text")[0][i].style.display = "none";
			}
		}
		function Legend(data, color, callbackOver, callbackOut, callbackClick) {
			legend.selectAll(".item").remove();	// limpieza de leyenda anterior
			var items = legend.selectAll(".item").data(data)
				.enter()
					.append("g").attr("class", "item")
					.attr("transform", function(d,i) {return "translate("+i*4+",0)"});
			items.append("rect").attr("x",0).attr("y",10).attr("width",4).attr("height",10)
				.style("display", function(d) {return d.n ? "block" : "none"})
				.datum(function(d,i) {return color ? ((i%2) ? color[0] : color[1]) : d.c})
				.attr("fill", function(d,i) {return d})
				.on("mouseover" , function(d,i) {
					showLegendItem(i,true,d3.select(this)); 
					if (callbackOver) callbackOver(i);})
				.on("mouseout", function(d,i) {
					showLegendItem(i,false,d3.select(this)); 
					if  (callbackOut) callbackOut(i);})
				.on("mousedown", function(d,i) {
					if (callbackClick) callbackClick(i);
				});
			items.append("text").data(data)
				.text(function(d,i) {return d.name})
				.attr("text-anchor", "middle")
				.style("display", "none");
		}
		function updateAxes() {
			var x_axis = chart.select(".x.axis");
				x_axis.transition().duration(500).call(xAxis);
				// x_axis.selectAll("text").style("font-size", ".8em")
			
			var y_axis = chart.select(".y.axis");
				y_axis.transition().duration(500).call(yAxis);
				y_axis.selectAll("text").style("font-size", ".8em")
					.attr("transform", "translate(-15,0)");
		}
		updateAxes();
		// Leyenda principal de provincias
		function mainLegend() {
			// var ldata = data.filter(function(i) {return REGIONS[i.name].selected});
			ldata = data;
			Legend(ldata, null,
				function(i){
					provinceHoverIn(shapes.selectAll(".circle")[0][i]);
				}, function(i) {
					provinceHoverOut(shapes.selectAll(".circle")[0][i]);
				}, function(i) {
					provinceClick(shapes.selectAll(".circle")[0][i]);
				});	
		}
		mainLegend();
		// dispersión de precios
		var spreads_min = shapes.selectAll(".spread.min").data(data);
		spreads_min.transition().duration(500)
			.attr("x1", function(d) {return d.min ? x(d.min) : x(d.p)})
			.attr("y1", function(d) {return d.n ? y(d.n) : d3.select(this).attr("y1")})
			.attr("x2", function(d) {return d.min ? (x(d.p)-radius) : x(d.p)})
			.attr("y2", function(d) {return d.n ? y(d.n) : d3.select(this).attr("y2")})
			.attr("stroke-width", function(d) {return d.n ? 5 : 0})
			.attr("stroke", function(d) {return d.c});
		spreads_min.enter()
			.append("line")
			.attr("class", "spread min")
			.attr("x1", function(d) {return d.min ? x(d.min) : x(d.p)})
			.attr("y1", function(d) {return d.n ? y(d.n) : d3.select(this).attr("y1")})
			.attr("x2", function(d) {return d.min ? (x(d.p)-radius) : x(d.p)})
			.attr("y2", function(d) {return d.n ? y(d.n) : d3.select(this).attr("y2")})
			.attr("stroke-width", function(d) {return d.n ? 5 : 0})
			.attr("stroke", function(d) {return d.c});
		var spreads_max = shapes.selectAll(".spread.max").data(data);
		spreads_max.transition().duration(300)
			.attr("x1", function(d) {return d.max ? x(d.max) : x(d.p)})
			.attr("y1", function(d) {return d.n ? y(d.n) : d3.select(this).attr("y1")})
			.attr("x2", function(d) {return d.max ? (x(d.p)+radius) : x(d.p)})
			.attr("y2", function(d) {return d.n ? y(d.n) : d3.select(this).attr("y2")})
			.attr("stroke-width", function(d) {return d.n ? 5 : 0})
			.attr("stroke", function(d) {return d.c});
		spreads_max.enter()
			.append("line")
			.attr("class", "spread max")
			.attr("x1", function(d) {return d.max ? x(d.max) : d3.select(this).attr("x2")})
			.attr("y1", function(d) {return d.n ? y(d.n) : d3.select(this).attr("y1")})
			.attr("x2", function(d) {return d.max ? (x(d.p)+radius) : d3.select(this).attr("x2")})
			.attr("y2", function(d) {return d.n ? y(d.n) : d3.select(this).attr("y2")})
			.attr("stroke-width", function(d) {return d.n ? 5 : 0})
			.attr("stroke", function(d) {return d.c});
		// precios medios
		var circles = shapes.selectAll(".circle").data(data);
		circles.transition().duration(500)
				.attr("cx", function(d) {return d.p ? x(d.p) : d3.select(this).attr("cx")})		// precio
				.attr("cy", function(d) {return d.n ? y(d.n) : d3.select(this).attr("cy")})		// cantidad
				.attr("fill", function(d) {return d.c})
			.transition().duration(500).ease("bounce")
				.attr("r", function(d) {return d.r});
		circles.enter()
			.append("circle")
			.attr("class", "circle")
			.attr("cx", function(d){return x(d.p)})		// precio en coordenada x
			.attr("cy", function(d){return d.n ? y(d.n) : 0})		// cantidad en coordenada Y
			.attr("r", 0)
			.attr("fill", function(d){return d.c})
			.attr("opacity", .8)
			.transition().delay(500).duration(500).ease("bounce").attr("r", function(d){return d.r});
		circles.exit()
			.transition().duration(500)
			.attr("r", 0)
			.remove();
		// eventos
		function provinceInfo(d) {
			var name = d.name,
				info = {},

				cities = {};
			info[name] = theInfo[name];
			gasoleProcess(info, function(station,p,t,s) {
				if (!station.o[TYPE]) return;
				(cities[t] ? (cities[t]++) : (cities[t]=1));
			});
			var infoText = [prettyName(name)];
			infoText.push(d.n + " puntos de venta");
			infoText.push(" en " + Object.keys(cities).length +  " ciudades");
			infoText.push("Precio medio: " + d.p.toFixed(3) + " €/l");
			return infoText;
		}
		function provinceHoverIn(circle,i) {
			circle = d3.select(circle);
			if (circle.attr("r")==radius) {
				var d = circle.data()[0];
				circle.attr("opacity", 1);
				var options = {	"r": 100,
								"fill": "#7e2516",
								"stroke": "#333",
								"stroke-width": 5};
				showTooltip("pinfo", chart, provinceInfo(d), options, {cx:x(d.p), cy:y(d.n), r:d.r+2});
				if (i>=0) showLegendItem(i,true);
			}
		}
		function provinceHoverOut(circle,i) {
			circle = d3.select(circle);
			if (parseInt(circle.attr("r"))==radius) {
				circle.attr("opacity", .8);
				hideTooltip("pinfo");
				if (i>=0) showLegendItem(i,false);
			}
		}
		function hideTooltip(id) {
			chart.select("#"+id).remove();
		}
		function provinceClick(circle) { /* Ciudades de una provincia */
			var circle = d3.select(circle),
				d = circle.data()[0],
				spreadLabel = document.getElementById("spread-label");
			if (parseInt(circle.attr("r"))==RZOOM) {
				chart.attr("class", "chart");
				x.domain([xMin,xMax]);
				y.domain([yMin,yMax]);
				updateAxes();
				shapes.selectAll(".city").remove();				// Borrar todas las ciudades
				circles.transition().duration(500).ease("bounce").attr("r",function(d) {return d.r});
				hideTooltip("pinfo");
				mainLegend();
				spreadLabel.style.opacity = 1;
				return;
			}
			spreadLabel.style.opacity = 0;
			chart.attr("class", "chart white");
			var color = d.c;
			var colorDark = d3.rgb(color).darker().toString();
			var colorBright = d3.rgb(color).brighter([.4]).toString();
			hideTooltip("pinfo");
			var options = {	"r": 100,
							// "fill": color,
							"fill": colorDark,
							"stroke": "#fff",
							"stroke-width": 5};
			showTooltip("pinfo", chart, provinceInfo(d), options, {corner:true});
			var pname = d.name;
			// Primero redibujar provincias
			circles.transition().duration(500)
				.attr("r",function(d) {return ((d.name==pname) ? RZOOM : 0)});
			var pdata = theInfo[pname];					// province data
			var pstats = theStats.provinces[pname][TYPE];	// province stats
			var cdata = [];			// cities data
			var nMax = 0;
			for (var t in pdata) {
				var tdata = pdata[t];
				var tstats = new Stats();
				for (var s in tdata) {
					var price = tdata[s].o[TYPE];
					if (price) tstats.add(price, [p,t,s]);
				}
				if (tstats.n) {
					if (tstats.n>nMax) nMax = tstats.n;
					tstats.name = t;
					cdata.push(tstats);
				}
			}
			// Ordenación alfabética
			cdata.sort(function(a,b) {return sortName(a.name, b.name)});
			x.domain([pstats.min, pstats.max]);
			y.domain([1, nMax]);
			updateAxes();
			// la información de las ciudades
			var cities = shapes.selectAll(".city").data(cdata);
			function showCity(node) {
				var node = d3.select(node);
				var d = node[0][0].__data__;
				var infoText = [d.name];
				node.attr("fill", colorDark).attr("stroke-width", 4);
				infoText.push(d.n + " puntos de venta");
				infoText.push("Precio medio: "+d.mu.toFixed(3) + " €/l");
				var options = {	"r": 100,
								"fill": colorBright,
								"stroke": "#fff",
								"stroke-width": 3};
				showTooltip("tinfo", chart, infoText, options, {cx:x(d.mu), cy:y(d.n), r:0, stroke: "#fff"});
			}
			function hideCity(node) {
				d3.select(node).attr("fill", color).attr("stroke-width", 1);
				hideTooltip("tinfo");
			}
			// Leyenda de ciudadas
			Legend(cdata, [colorDark,"#fff"], 
				function(i) {	// callbackOver
					showCity(shapes.selectAll(".city")[0][i]);
				},
 
				function(i) {	// callbackOut
					hideCity(shapes.selectAll(".city")[0][i]);
				});

			cities.enter()
				.append("rect")
				.attr("class", "city")
				.attr("x", function(d){return x(d.mu)-5})	
				.attr("y", function(d){return y(d.n)-5})	
				.attr("width", 0).attr("height", 0)
				.attr("stroke", "#fff")
				.attr("fill", color)
				.transition().duration(200).ease("bounce")
					.attr("width", 10).attr("height", 10);
			cities.on("mouseover", function(d,i) {showCity(this); showLegendItem(i,true);})
			cities.on("mouseout", function(d,i) {hideCity(this); showLegendItem(i,false);});
		}
		circles.on("mouseover",function(d,i) {provinceHoverIn(this,i)});
		circles.on("mouseout", function(d,i) {provinceHoverOut(this,i)});
		circles.on("mousedown", function(d,i) {provinceClick(this)});
	}
}

/** @constructor */
function Brands(spread) {
	this.draw = function() {
		// Gráfico de bolas
		// Provincias en eje de las X
		// Marcas en eje de las Y
		var stats = theStats.stats[TYPE];
		showChartContainer("brands", stats!=null);
		if (!stats) return;
		var div = d3.select("#brands");
		var provinces = theStats.provinces;
		var brands = stats.brands;


		var data = [];
		var pMin = 1000, pMax = 0;		// Precios máximo y mínimo
		var psum = 0;
		for (var p in provinces) {
			var current = provinces[p][TYPE];
			if (current) {
				var current_brands = current.brands;
				for (var b in current_brands) {
					var info = current_brands[b];
					var price = info.mu;
					if (price<pMin) pMin=price;
					if (price>pMax) pMax=price;
					psum+=price;
					data.push({prov: p, brand: b, n: info.n, price: info.mu});
				}
			}
		}
		var pMu = psum/data.length;
		var provincesDomain = Object.keys(provinces);
		var brandsDomain = Object.keys(brands);
			brandsDomain.sort();
		var otras = brandsDomain.indexOf("otras");
		if (otras>=0) {brandsDomain.splice(otras,1);brandsDomain.push("otras");}
		var priceColor = new PriceColorPicker();
		// ajuste del ALTO del gráfico:
		var divHeight = Math.max(400,provincesDomain.length*30+70);
		div.style("height", divHeight+"px");
		divWidth = parseInt(div.style("width").split("px")[0]);
		
		var margin = {top: 40, right: 30, bottom: 30, left: 170},
			width = divWidth - margin.left - margin.right,
			height = divHeight - margin.top - margin.bottom;
		var y = d3.scale.ordinal()
			.domain(provincesDomain)
			.rangePoints([0,height]);
		var x = d3.scale.ordinal()
			.domain(brandsDomain)
			.rangePoints([0,width]);
		var xAxis = d3.svg.axis()
			.scale(x)
			.orient("top")
			.tickFormat(function(d) { return d.toUpperCase()});
		var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left");
		var chart = div.select(".chart");
		if (chart[0][0]==null) {
			chart = div.append("svg")
				.attr("width", "100%")
				.attr("height", "100%")
				.append("g")
				.attr("class", "chart")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
				.attr("width",width+"px").attr("height",height+"px");
			chart.append("g")
				.attr("class", "x axis");
			chart.append("g")
				.attr("class", "y axis")
		}
		chart.select(".x.axis")
			.transition().duration(500).call(xAxis);
		chart.select(".x.axis").selectAll("text")
				.style("font-size", ".7em")
				.style("text-anchor", "center")
				.attr("dy", "-15px");
		
		chart.select(".y.axis")
			.transition().duration(500).call(yAxis);
		chart.select(".y.axis").selectAll("text")
				.style("font-size", ".7em")
				.style("text-anchor", "end")
				.attr("dx", "-15px");


		var balls = chart.selectAll("circle").data(data);
		balls.attr().transition().duration(500)
			.attr("cx", function(d){return x(d.brand)})
			.attr("cy", function(d) {return y(d.prov)})
			.attr("r", function(d) {return 4+Math.sqrt(d.n)})
			.attr("fill", function(d) {return priceColor.get(d.price, pMin, pMax, pMu)});
		balls.enter()
			.append("circle")
			.attr("cx", function(d){return x(d.brand)})
			.attr("cy", function(d) {return y(d.prov)})
			.attr("r", 0)
			.attr("fill", function(d) {return priceColor.get(d.price, pMin, pMax, pMu)})
			.attr("stroke", "#fff")
			.transition().duration(500).ease("bounce")
				.attr("r", function(d) {return 4+Math.sqrt(d.n)});
		balls.exit().remove();
		// los eventos
		balls.on("mouseover", function(d,i) {
			var otras = d.brand=="otras";
			var infoText = [d.brand +(otras ? " marcas en " : " en ")+ prettyName(d.prov)];
			infoText.push((otras ? "tienen " : "tiene ") + d.n + " puntos de venta");
			infoText.push("con un precio medio de:");
			infoText.push(d.price.toFixed(3) + " €/l");
			var options = {	"r": 100,
							"fill": "#7e2516",
							"stroke": "#333",
							"stroke-width": 5};
			showTooltip("pinfo", chart, infoText, options, {cx:x(d.brand),cy:y(d.prov),r:8+Math.sqrt(d.n)});
		});
		balls.on("mouseout", function(d,i) {
			chart.select("#pinfo").remove();
		});
	}
}

/* Rejilla de precios, según tamaño GRID_RESOLUTION */
function PriceGrid(stats) {
	var bounds = stats.g;								// límites del resultado
	var bl = reprojectLatLon([bounds[0],bounds[2]]), 	// bottom-left
		tr = reprojectLatLon([bounds[1],bounds[3]]), 	// top-right
		width = tr.lon-bl.lon,
		height = tr.lat-bl.lat,
		xBins = Math.ceil(width/GRID_RESOLUTION),		// Número de bins horizontales
		yBins = Math.ceil(height/GRID_RESOLUTION);		// Número de bins verticales
	return {ox:bl.lon-(xBins*GRID_RESOLUTION - width)/2,	// origen x
			oy:bl.lat-(xBins*GRID_RESOLUTION - height)/2,	// origen y
			grid:{}};
}
function callbackGrid(s) {
	var price = s.o[TYPE];
	if (s.ll && price) {
		heatPoints.push({lonlat: s.ll, count: 1});	// mapa de calor
		var ox = theGrid.ox,
			oy = theGrid.oy,
			gdata = theGrid.grid;
		var xindex = Math.floor((s.ll.lon-ox)/GRID_RESOLUTION);
		if (!gdata[xindex]) gdata[xindex] = {x: ox+xindex*GRID_RESOLUTION};
		var gdatax = gdata[xindex];
		var yindex = Math.floor((s.ll.lat-oy)/GRID_RESOLUTION);
		if (!gdatax[yindex]) gdatax[yindex] = {y: oy+yindex*GRID_RESOLUTION, p: price, n: 1};
		else { 	var gdataxy = gdatax[yindex];
				gdataxy.p = (gdataxy.p*gdataxy.n+price)/(++gdataxy.n);} 
	}
}
/* Función que actualiza todos los gráficos,
y recalcula las estadísticas en caso necesario */
function updateAll(recompute) {
	if (typeof recompute == "undefined") recompute = true;
	if (recompute) {
		// Calculamos la estadísticas para los datos seleccionados
		theInfo = {};
		for (p in REGIONS) { // Selección de datos para construir estadísticas
			if (REGIONS[p].selected && !skipProv(p)) theInfo[p] = theGasole.info[p];
		}
		theStats = new GasoleStats(theInfo, [TYPE]);	// Estadística de la selección
		var gstats = theStats.stats[TYPE];			// Estadísticas globales del resultado
		if (gstats) {
			// HISTOGRAMAS
			function initHist() {var h = [];for (var i=0;i<NBINS;i++) h[i]=0;return h;}
			function callbackHistogram(station,p,t,s) {
				var price = station.o[TYPE];
				if (price) {
					var pstats = provinces[p][TYPE];
					if (!pstats.brands) {
						pstats.brands={};
						pstats.hist = initHist();
					}
					var brand = checkBrand(station.l);
					if (!pstats.brands[brand]) pstats.brands[brand]=new Stats();
					if (!gstats.brands[brand]) gstats.brands[brand]=new Stats();
					pstats.brands[brand].add(price,[p,t,s]);
					gstats.brands[brand].add(price,[p,t,s]);
					var b = Math.min(Math.floor((price-gMin)/step), NBINS-1);
					pstats.hist[b]++;
					gstats.hist[b]++;
				}
			}
			var bins = [],
				gMin = gstats.min,
				gMax = gstats.max,
				provinces = theStats.provinces;			// Estadísticas de las provincias consideradas
			var step = (gMax-gMin)/NBINS;
			for (var n=0; n<=NBINS; n++) bins[n] = gMin+n*step;
			gstats.bins = bins;
			gstats.brands = {};
			gstats.hist = initHist();
			gstats.step = step;
			// REJILLA DE PRECIOS y MAPA DE CALOR
			heatPoints = [];
			theGrid = new PriceGrid(theStats.stats[TYPE]);
			gasoleProcess(theInfo, function(station,p,t,s) {
				callbackHistogram(station,p,t,s);	
				callbackGrid(station);
			});
		}
	}
	histogram.draw();	// Dibujo del gráfico histograma
	circles.draw();		// Dibujo del gráfico de círculos
	brands.draw();		// Dibujo del gráfico de marcas
	raphaelUpdate();	// Dibujo del mapa Raphael
	setTimeout(function() {
		drawMarkers();		// Mapa de marcadores
		drawPriceGrid();	// Mapa de retícula de precios
		drawHeatMap();
	}, 100);
	// Información
	var infoDiv = document.getElementById("info");
	var stats = theStats.stats[TYPE];
	var infoContent = "Selecciona aquí un combustible y una combinación de provincias.";
	if (stats) {
		if (stats.n=="0") infoContent = "No hay ningún resultado que mostrar";
		else infoContent = "Se han encontrado " + stats.n + " puntos de venta a un precio medio de " + stats.mu.toFixed(3) + " €/l";
	}
	infoDiv.textContent = infoContent;	
}

// MUestra/oculta el contenedor de un gráfico y las indicaciones
function showChartContainer(id, show) {
	var container = document.getElementById(id+"-container");
	container.className = show ? "chart": "chart off";
	if(!show) document.getElementById(id).style.height = "";
}
/** @constructor */
function Histogram() {
	this.stacked = false;
	this.draw = function() {
		/* Dibujo del histograma con la librería D3.js */
		var stats = theStats.stats[TYPE];
		showChartContainer("histogram", stats!=null);
		if (!stats) return;
		var provinces = theStats.provinces;
		var bins = stats.bins;
		var step = stats.step;
		var data = [];
		var nMax = 0;						// Número máximo en una provincia, para escala de gráfico
		for (var p in provinces) {
			var current = provinces[p][TYPE];
			if (current) {
				var n = current.n;
				data.push({name: p, hist: current.hist, color: "#"+REGIONS[p].color});
				var hMax = d3.max(current.hist);
				if (hMax>nMax) nMax = hMax;	
			}
		}
		if (this.stacked) nMax = d3.max(stats.hist);	// barras apiladas
		var nSeries = data.length;
		var margin = {top: 20, right: 20, bottom: 30, left: 50};
		var binMargin = 4;	// Margen entre bins de histogramas, en píxeles

		var yMin = 0,
			yMax = nMax;

		var div = d3.select("#histogram"),
			divWidth = parseInt(div.style("width").split("px")[0]),		// ancho del div en pixeles
			divHeight = parseInt(div.style("height").split("px")[0]);	// alto del div en pixeles
		var width = divWidth - margin.left - margin.right,
			height = divHeight - margin.top - margin.bottom;
		var x = d3.scale.linear()
			.domain(d3.extent(bins))				// dominio de entrada x
			.range([0,width]);						// rango de salida x
		var y = d3.scale.linear()
			.domain([yMin, yMax])					// dominio de entrada y
			.range([height,0]);						// rango de salida y
		var xAxis = d3.svg.axis()
			.scale(x)
			.tickFormat(d3.format(",.3f"))
			.orient("bottom")
			.tickValues(bins);
		var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left")
			.ticks(5)
			.tickFormat(d3.format(".0f"));

		var gridWidth = x(bins[1]);
		var chart = div.select(".chart");
		if (chart[0][0]==null) {
			chart = div.append("svg")
				.attr("width", "100%")
				.attr("height", "100%")
				.append("g")
				.attr("class", "chart")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
				.attr("width",width+"px").attr("height",height+"px");
			chart.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + height + ")");
			chart.append("g")
				.attr("class", "y axis");
		}
		if (nSeries>1) {
			grid = chart.selectAll(".grid").data(bins);
			grid.enter()
				.insert("rect", ":first-child")
				.attr("class", "grid")
				.attr("x", function(d,i) {return x(bins[i])})
				.attr("y", 0)
				.attr("width", gridWidth)
				.attr("height", height)
				.attr("fill", function(d,i) { return (i%2) ? "#ccc" : "#eee"})
				.transition().duration(1000).attr("opacity", .2);
		}
		var x_axis = chart.select(".x.axis");
			x_axis.transition().duration(500).call(xAxis);
		var y_axis = chart.select(".y.axis");
			y_axis.transition().duration(500).call(yAxis);

		var barWidth = (gridWidth-(2*binMargin));
		if (!this.stacked) barWidth/=nSeries;	// ancho de cada barra
		var transX = 500,	// transición horizontal
			transY = 500;	// transición vertical

		var THAT = this;
		var series = chart.selectAll(".serie").data(data);
		series.transition().duration(transX)
			.attr("transform", 
				function(sd,si) {
					return "translate(" + (binMargin+(THAT.stacked ? 0 : si*barWidth)) + ",0)";
				});
		series.enter().append("g")
			.attr("class", "serie")
			.attr("transform", 
				function(sd,si) {
					return "translate(" + (binMargin+(THAT.stacked ? 0 : si*barWidth)) + ",0)";
				});
		series.exit().selectAll("rect")
			.transition().duration(transY).attr("height", 0);
		series.exit().transition().delay(transY).remove();
		series.each(function(sd,si) {
			var color = sd.color;
			var bars = d3.select(this).selectAll("rect").data(sd.hist);
			bars.attr("fill", color)
				.transition().duration(transX)
					.attr("x", function(d,i){return x(bins[i]);})
					.attr("width", barWidth)
				.transition().delay(transX).duration(transY)
					.attr("y", 
						function(d,i){
							var value = d;
							if (THAT.stacked) {for (var index=0; index<si; index++) value+=(data[index].hist[i]);}
							return y(value);
						})
					.attr("height", 
						function(d,i){return height-y(d);});
			bars.enter()
				.append("rect")
				.attr("class", "bar")
				.attr("x", function(d,i){return x(bins[i]);})
				.attr("y", height)
				.attr("width", barWidth)
				.attr("height", 0)
				.attr("fill", color)
				.transition().delay(transX).duration(transY)
					.attr("y", 
						function(d,i){
							var value = d;
							if (THAT.stacked) {for (var index=0; index<si; index++) value+=data[index].hist[i];}
							return y(value);
						})
					.attr("height", function(d,i){return height-y(d);})
			bars.exit().remove();
			// los eventos
			bars.on("mouseover", function(d,i) {
				var pmin = bins[i].toFixed(3);
				var pmax = bins[i+1].toFixed(3);
				var infoText = ["En " + prettyName(data[si].name)];
				infoText.push("hay " + (d) + " puntos de venta");
				infoText.push("de " + FUEL_OPTIONS[TYPE].name);
				infoText.push("entre " + pmin + " y " + pmax + " €/l");
				var options = {	"r": 100,
								"fill": "#7e2516",
								"stroke": "#333",
								"stroke-width": 5};
				showTooltip("tooltip", chart, infoText, options);
			});
			bars.on("mouseout", function(d,i) {
				chart.select("#tooltip").remove();
			});
		})
	}
}

/* Muestra la pelota informativa del elemento seleccionado */
function showTooltip(id, where, infoText, options, anchor) {
	var tooltip = where.append("g").attr("id", id);		// El grupo del tooltip
	var lineIni = -Math.floor(infoText.length/2);
	var posX, posY;
	if (anchor && anchor.corner) {
		posX = 100; posY = 100;	// Esquina superior derecha
	} else {
		var mousePos = d3.mouse(where.node());
		var x = anchor ? anchor.cx : mousePos[0],
			y = anchor ? anchor.cy : mousePos[1];
		var width = parseInt(where.attr("width").split("px")[0]);
		var height = parseInt(where.attr("height").split("px")[0]);
		var posX = x + ((x<(width/2)) ? 100 : -100);
		var posY = y + ((y<(height/2)) ? 100 : -100);	
	}
	if (anchor && anchor.hasOwnProperty("r")) {
		var Dy = posY-anchor.cy;
		var Dx = posX-anchor.cx;
		var D = Math.sqrt(Math.pow(Dy,2)+Math.pow(Dx,2));
		var d = anchor.r+4;
		var dy = (Dy/D)*d;
		var dx = (Dx/D)*d;
		tooltip.append("circle")
			.attr("cx", anchor.cx)
			.attr("cy", anchor.cy)
			.attr("r", anchor.r)
			.attr("stroke",anchor.stroke  || "#333").attr("stroke-width",2).attr("fill", "none");
		tooltip.append("line")
			.attr("x1", anchor.cx+dx).attr("y1", anchor.cy+dy)
			.attr("x2", anchor.cx+dx).attr("y2", anchor.cy+dy)
			.attr("stroke", anchor.stroke || "#333").attr("stroke-width",2)
			.transition().duration(200)
				.attr("x2", posX).attr("y2", posY);
	}
	// La tooltip propiamente dicha
	tooltip.append("circle").call(function(e) {
			for (var o in options) e.attr(o, options[o]);
			e.attr("cx", posX).attr("cy", posY).attr("r",0)
				.transition().delay(200).duration(200).ease("bounce").attr("r", options.r);
		})
	var text = tooltip.append("text");
	text.attr("x", posX).attr("y", posY).attr("text-anchor", "middle").attr("fill", "#fff")
		.attr("font-size","0em").transition().delay(200).attr("font-size",".9em");
	text.selectAll("tspan").data(infoText)
		.enter().append("tspan").attr("x", posX).attr("y", function(d,i) {return posY+(i+lineIni)*20}).text(function(d){return d});
}

addEvent(window, "load", function(){
	new Gasole(function() {
		theGasole = this;
		openMapinit();
		raphaelInit();
		initControl();
		updateAll();
	})
});

