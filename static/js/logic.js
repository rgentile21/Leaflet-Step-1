// Store API endpoint inside queryUrl
// var queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2014-01-01&endtime=" +
//   "2014-01-02&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";
// var queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2014-01-01&endtime=2014-01-02"
var link = "static/data/all_day.json";

// Perform a GET request to the query URL
d3.json(link, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
  console.log(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function to run once for each feature in the features array
  // Each popup describes the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup('<h4>Place: ' + feature.properties.place + 
    '</h4><h4>Date: ' + new Date(feature.properties.time) + 
    '</h4><h4>Magnitude: ' + feature.properties.mag, {maxWidth: 400})
}

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  var earthquakeLayer = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function(feature, latlng) {
        let radius = feature.properties.mag * 5;

        if (feature.properties.mag > 5) {
            fillcolor = '#d86060';
        }
        else if (feature.properties.mag >= 4) {
            fillcolor = '#d88460';
        }
        else if (feature.properties.mag >= 3) {
            fillcolor = '#daa746';
        }
        else if (feature.properties.mag >= 2) {
            fillcolor = '#dac544';
        }
        else if (feature.properties.mag >= 1) {
            fillcolor = '#cada44';
        }
        else  fillcolor = '#a4da45';

        return L.circleMarker(latlng, {
            radius: radius,
            color: 'black',
            fillColor: fillcolor,
            fillOpacity: 1,
            weight: 1
        });
    }
});  

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakeLayer);
}

function getColor(mag) {
  return mag > 5  ? '#d86060' :
         mag > 4  ? '#d88460' :
         mag > 3  ? '#daa746' :
         mag > 2  ? '#dac544' :
         mag > 1  ? '#cada44' :
                    '#a4da45';
}

var legend = L.control({ position: "bottomleft" });

legend.onAdd = function(myMap) {
var div = L.DomUtil.create("div", "legend");
magnitude = [0, 1, 2, 3, 4, 5],
labels = [];

// Worked with LA to get this correct
for (var i = 0; i < magnitude.length; i++) {
    div.innerHTML +=
        '<i style="background:' + getColor(magnitude[i] + 1) + '"></i> ' +
        magnitude[i] + (magnitude[i + 1] ? '&ndash;' + magnitude[i + 1] + '<br>' : '+');
}

return div;
};

function createMap(earthquakes) {

  // Define streetmap, darkmap and satellite map layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap,
    "Satellite Map": satellitemap
  };

  // Create map, giving streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 4,
    layers: [satellitemap, earthquakes]
  });

legend.addTo(myMap);

  // Create overlay object to hold overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create a layer control
  // Pass in baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
}
