var currentLanguage = "english"; // replaced in the html
var mapData;
var iconDefault;
var layerGroup;


// =======================
// |  UTILITY FUNCTIONS  |
// =======================

// Basic function to replace console.log() statements so they can all be disabled as needed;
var debugMode = true;
function logger(logString){
	if (debugMode){
		console.log(logString);
	}
}




// ====================================================================================================
// |                                        DOCUMENT READY                                            |
// ====================================================================================================

$(document).ready(function(){

	// ===================
	// |  Dropdown menu  |
	// ===================

	$(function() {
		$('#main-menu').smartmenus({
			subMenusSubOffsetX: 1,
			subMenusSubOffsetY: -8
		});
	});

	$( "#menuButton" ).click(function() {
		logger("clicked menu toggle")
	  $( ".main-menu-nav").toggle();
	});

	$( ".main-menu-nav a").not(".has-submenu").click(function() {
	  $( ".main-menu-nav").hide();
	});

	$( ".usagm__section__full-width" ).click(function() {
	  $( ".main-menu-nav").hide();
	});



	// =================
	// |  Create map   |
	// =================

	if ($("#map").length){

		// Tile layers
		var Stamen_Watercolor = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
			attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
			subdomains: 'abcd',
			minZoom: 1,
			maxZoom: 16,
			ext: 'png'
		});

		var Stamen_TonerLabels = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}.{ext}', {
			attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
			subdomains: 'abcd',
			minZoom: 0,
			maxZoom: 20,
			ext: 'png'
		});

		var Stamen_TonerLines = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lines/{z}/{x}/{y}.{ext}', {
			attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
			subdomains: 'abcd',
			minZoom: 0,
			maxZoom: 20,
			ext: 'png'
		});

		var tiles = [Stamen_Watercolor, Stamen_TonerLines, Stamen_TonerLabels];


		// Define icons.
		iconRedDotSmall = L.icon({
			iconUrl: projectPrefix + '/img/icons/icon-larger_dot--red.png',
			iconSize: [16, 16],
			iconAnchor: [8, 8],
			popupAnchor: [0, -4]
		})

		iconRedDotSmallOutlined = L.icon({
			iconUrl: projectPrefix + '/img/icons/icon-larger_dot--red-outlined.png',
			iconSize: [16, 16],
			iconAnchor: [8, 8],
			popupAnchor: [0, -4]
		})

		iconFocused = L.icon({
			iconUrl: projectPrefix + '/img/icons/icon-larger_dot--red-outlined.png',
			iconSize: [32, 32],
			iconAnchor: [16, 16],
			popupAnchor: [0, -8]
		})

		iconDefault = iconRedDotSmall;




		// =====================
		// |  Define the map   |
		// =====================

		mapData = L.map('map', {
			maxZoom: 15,
			minZoom: 4,
			scrollWheelZoom: false,
			layers: tiles
		});

		//Define the layer with all of the markers
		layerGroup = L.featureGroup().addTo(mapData);

		mapData.setView([coordinates[0], coordinates[1]], zoom);//14




		// ===============================
		// |  Loop through the markers   |
		// ===============================

		for (var i = 0; i < mapMarkerData.length; i++){

			var data = mapMarkerData;

			var currentCoordinatesArray = data[i].coordinates;

			if (data[i].nameShort == journalistName){
				popupWindowMarkup = "<h3>" + data[i].name + "</h3><p>" + data[i].type + " " + data[i].date + "</p>";
			} else {
				popupWindowMarkup = "<a href='" + data[i].link +"'><img src='" + data[i].mugshot +"' style='max-width: 100%;'/><h3>" + data[i].name + "</h3></a><p>" + data[i].type + " " + data[i].date +"<br/>" + data[i].entity + "</p>";;
			}

			// Define the marker
			marker = new L.marker([currentCoordinatesArray[0],currentCoordinatesArray[1]], {
					icon: iconDefault,//custom icon could go here
					title: data[i].nameShort,
					name: data[i].name,
					nameShort: data[i].nameShort,
					currentNumber: i,
				})
				.bindPopup(popupWindowMarkup)

			marker.on('click', onClick);

			layerGroup.addLayer(marker)

		}

		// Add click event to center on the clicked marker.
		function onClick(e){
			var currentZoom =  mapData.getZoom();
			mapData.setView(e.target.getLatLng(),currentZoom);//6);
		}

		//Reset the markers to the default icon;
		function resetIcons(){
			layerGroup.eachLayer(function(marker) {
				marker.setIcon(iconDefault);
			});
		}

		// Change the icon of the current marker
		function showCurrent(nameShort){
			resetIcons();
			var target = "#" + nameShort;

			layerGroup.eachLayer(function(marker) {

				currentMarkerTarget = "#" + marker.options.nameShort;

				if (currentMarkerTarget == target){
					marker.setIcon(iconFocused);
					marker.openPopup();
				} 

			});
		}

		showCurrent(journalistName);

	}

});
