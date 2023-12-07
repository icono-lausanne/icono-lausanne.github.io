// Global variables declaration
var layerControl, map;
var selectedYear = 1800;
var transparent = false;
var markersCluster = new L.MarkerClusterGroup();
var firstTransparencyActivation = true, firstVectorizedActivation = true;

var CartoDB_LightMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
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

// Link from the Museris database
function getQueryParam(param) {
    var urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

init();

var slider = document.getElementById('yearRange');

noUiSlider.create(slider, {
    start: [1830, 1870], // starting values
    connect: true, // shades the area between handles
    range: {
        'min': 1740,
        'max': 2010
    },
    margin: 1
});

var selectedStartYear = 1830;
var selectedEndYear = 1870;

slider.noUiSlider.on('set', function (values, handle) {

    selectedStartYear = parseInt(values[0]);
    selectedEndYear = parseInt(values[1]);

    updateMap(selectedStartYear, selectedEndYear);
});

slider.noUiSlider.on('update', function (values, handle) {
    selectedStartYear = parseInt(values[0]);
    selectedEndYear = parseInt(values[1]);
    document.getElementById("slider_year").textContent = String(selectedStartYear) + ' – ' + String(selectedEndYear);
});

function updateMap(selectedStartYear=1740, selectedEndYear=2010, imageIdParam=null){

    var request = initRequest('https://bnf-jadis.github.io/assets/data/geocoded_MHL.json');
    request.onload = function() {

        var jsonObject = request.response;

        if (imageIdParam) {

        	jsonObject.forEach(function(item) {
        		let id = item.image_url.split(';id=')[1];
		        if (id === imageIdParam) {
		            map.setView([item.lat, item.lon], 18); // Center and zoom
					selectedStartYear = Math.max(1740, item.start_year - 5);
					selectedEndYear = Math.min(2010, item.end_year + 5);
		            slider.noUiSlider.set([selectedStartYear, selectedEndYear]); // Adjust the slider
		        }
		    });
		}

		map.removeLayer(markersCluster);
    	markersCluster = new L.MarkerClusterGroup();

        var subset = $.grep(jsonObject, function( n, i ) {
          return (n.start_year >= selectedStartYear) && (n.end_year <= selectedEndYear);
        });

        console.log(subset.length);
		
		for (i=0; i < subset.length; i++){
			var redIcon = new L.Icon({
			  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
			  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
			  iconSize: [25, 41],
			  iconAnchor: [12, 41],
			  popupAnchor: [1, -34],
			  shadowSize: [41, 41]
			});
			let id = subset[i].image_url.split('amp;id=')[1];
			let title = subset[i].titre;
			if (title.length > 150) {
				title = title.slice(0, 150) + '...';
			}

			let height = String(~~(subset[i].shape_x/1.5));
			let width = String(~~(subset[i].shape_y/1.5));
			let htmlContent = '<img src="' + subset[i].image_url + '" height="' + String(~~(subset[i].shape_x/1.5)) + 'px" width="' + String(
				~~(subset[i].shape_y/1.5)) + 'px"/><br><center><b>' + title + '<br><a href="https://museris.lausanne.ch/SGCM/Consultation.aspx?id=' + id + '">En savoir plus</b></center>';
			var marker = new L.marker([subset[i].lat, subset[i].lon], {icon: redIcon}).bindPopup(
				htmlContent, {maxWidth: width, minWidth: width});
			markersCluster.addLayer(marker);

			/*if (id === imageIdParam) {
				marker.openPopup();
			}*/
		}
		map.addLayer(markersCluster);

		/*if (imageIdParam) {
        	markersCluster.eachLayer(function(layer) {
                if (layer.getPopup().getContent().includes('amp;id=' + imageIdParam)) {
                	console.log('found', layer.getPopup().getContent());
                    layer.openPopup();
            	}
			});
		}*/
	}
}

function init(){

	// Initialize map
	map = L.map('map', {
	    center: [46.519653, 6.632273],
	    zoom: 14,
	    minZoom: 12,
	    layers: [CartoDB_LightMatter],
	    fullscreenControl: true,
	    fullscreenControlOptions: {
	        title:"Plein écran"
	    },
	    attributionControl: false
	});

	// Initialize map and year select buttons
	//updateMap()

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

	var imageIdParam = getQueryParam('id');
	if (imageIdParam) {
	    updateMap(null, null, imageIdParam);
	} else {
	    updateMap(); // Call without parameters for default behavior
	}

}

/*
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

map.on('locationerror', onLocationError);*/
