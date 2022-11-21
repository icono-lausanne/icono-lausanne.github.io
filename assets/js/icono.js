// Global variables declaration
var layerControl, map;
var selectedYear = 1800;
var transparent = false;
var markersCluster = new L.MarkerClusterGroup();
var firstTransparencyActivation = true, firstVectorizedActivation = true;

var slider = document.getElementById("selectYear");
var output = document.getElementById("slider_year");
output.innerHTML = slider.value;

slider.oninput = function() {
  output.innerHTML = this.value;
}

var redIcon = new L.Icon({
	iconUrl: 'assets/img/marker-icon-2x-red.png',
	shadowUrl: 'assets/img/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});

var CartoDB_DarkMatterNoLabels = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 19
});

// Navigation
$("#about-btn").click(function() {
  $("#aboutModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

// Load Map Functions
function initRequest(requestURL){
	var request = new XMLHttpRequest();
	request.open('GET', requestURL);
	request.responseType = 'json';
	request.send();

	return request;
}


function updateMap(){

	map.removeLayer(markersCluster);
	markersCluster = new L.MarkerClusterGroup();

	selectedYear = document.getElementById("selectYear").value*10;

	var request = initRequest('https://bnf-jadis.github.io/assets/data/geocoded_MHL.json');
	request.onload = function() {

		var jsonObject = request.response;
		var subset = $.grep(jsonObject, function( n, i ) {
		  return (n.start_year >= selectedYear) && (n.end_year < (selectedYear+10));
		});
		
		for (i=0; i < subset.length; i++){
			id = subset[i].image_url.split(';id=')[1]

			var marker = new L.marker([subset[i].lat, subset[i].lon]).bindPopup(
				'<img src="' + subset[i].image_url + '" height="' + String(~~(subset[i].shape_x/1.5)) + 'px" width="' + String(
				~~(subset[i].shape_y/1.5)) + 'px"/><br><center><b>' + subset[i].titre + '<br><a href="https://museris.lausanne.ch/SGCM/Consultation.aspx?id=' + id + '">En savoir plus</b></center>');
			marker.setIcon(redIcon);
			markersCluster.addLayer(marker);
		}
		map.addLayer(markersCluster);
	}
}

function init(){

	// Initialize map
	map = L.map('map', {
	    center: [46.519653, 6.632273],
	    zoom: 14,
	    minZoom: 12,
	    layers: [CartoDB_DarkMatterNoLabels],
	    fullscreenControl: true,
	    fullscreenControlOptions: {
	        title:"Plein écran"
	    },
	    attributionControl: false
	});

	// Initialize map and year select buttons
	updateMap()

	var attributionControl = L.control({
	  position: "bottomright"
	});
	attributionControl.onAdd = function (map) {
	  var div = L.DomUtil.create("div", "leaflet-control-attribution");
	  div.innerHTML = "<a href='#' onclick='$(\"#attributionModal\").modal(\"show\"); return false;'>Attribution</a>";
	  return div;
	};
	map.addControl(attributionControl);

	// Add scale bar
	L.control.scale().addTo(map);
}

init()

// Location
map.locate({setView: true, maxZoom: 15});

function onLocationFound(e) {
    var radius = e.accuracy / 2;
    L.circle(e.latlng, {
	    color: '#ed2b3e',
	    fillColor: '#e02b3e',
	    fillOpacity: 0.5,
	    radius: radius
	}).addTo(map).bindPopup("Vous êtes ici");
    map.setView([46.519653, 6.632273], 14);
}

map.on('locationfound', onLocationFound);
function onLocationError(e) { }

map.on('locationerror', onLocationError);

