// https://developers.google.com/maps/documentation/javascript/layers?hl=es#JSHeatMaps


var data;
var map;

function initialize() {
  var mapOptions = {
    zoom: 10,
    center: new google.maps.LatLng(40.4000, -3.6833),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  map = new google.maps.Map(document.getElementById('map'),
      mapOptions);
}

function drawData(data) {
  var heatmapData = [];
  var latlon = data.latlon;
  for (p in latlon) {
    for (t in latlon[p]) {
      for (s in latlon[p][t]) {
        var pos = new google.maps.LatLng(latlon[p][t][s][0], latlon[p][t][s][1]);
        var magnitude = data.info[p][t][s]["options"][1] || null;
        if (magnitude) {
          magnitude = (magnitude-1.4)*100;
          console.log(magnitude);
          heatmapData.push({
            location: pos,
            weight: magnitude
          });
        }
      }
    }
  }
  var heatmap = new google.maps.visualization.HeatmapLayer({
    data: heatmapData,
    dissipating: true,
    radius: 20,
    gradient: ['transparent', "#00f", "#0f0", "#f00"],
    map: map
  });
}


window.addEventListener("load", function(){
  initialize();
  var req = new XMLHttpRequest();
  req.onload = function(r) {
    data = JSON.parse(r.target.responseText);
    console.log(data);
    drawData(data);
  }
  var url = document.URL;
  req.open("GET", document.URL.replace("stats", "api"), true)
  req.send();
})
