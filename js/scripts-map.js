var currentLanguage = "english"; // replaced in the html
var windowSize;



// These are set in html to determine whether to merge data and geojson or not.
// false -> load merged data. true -> load json/spreadsheet and merge with geojson
//var exportMapData = false; 
//var tabletopWorking = false; 
var loadedData;
var public_spreadsheet_url = '1rsZfvYeW-p6ufp2jLvEzk64qdU2Mh2xdhxVt5l6L5oM';// Press Freedom index


var geojson;
var dataContinents = {}
var dataContinentsArray = {};
var continents = ["Africa", "Asia", "Europe", "North America", "South America", "Oceania"];

var currentMetric = "total";
var currentYear = "y2017";
var country;
var simplifiedName = "";

var currentHistory = [];
var graphicWidth = 250;




var map; //defined here for global access.
var scrollBounds = [
	[22.854, 115.735],
	[0, 91.117]
]

var defaultBounds = [
	[55, 129],
	[-46, -120]
]

var boundsRussia = [
	[77, 185],
	[34, 26]
]
var boundsUSA = [
	[50, -48],
	[24, -125]
]
var boundsFrance = [
	[53, 19.5],
	[33, -14]
]
var boundsDenmark = [
	[74, 46],
	[32, -60]
]


var marker;
var myLayerGroup;
var vectorMap


// =======================
// |  UTILITY FUNCTIONS  |
// =======================

// Basic function to replace console.log() statements so they can all be disabled as needed;
var debugMode = false;
function logger(logString){
	if (debugMode){
		console.log(logString);
	}
}

// Utility function for removing spaces and punctuation from a string
function simplifyName(name){
	//console.log("simplifying: " + name)

	var idName = name;
	idName = idName.replace(/ /g,'');
	idName = idName.replace("'",'');
	idName = idName.replace(/[.,\/#!$%\^&\;:{}=\-_`~]/g,"");

	return idName;
}


function ordinal_suffix_of(i) {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "<sup>st</sup>";
    }
    if (j == 2 && k != 12) {
        return i + "<sup>nd</sup>";
    }
    if (j == 3 && k != 13) {
        return i + "<sup>rd</sup>";
    }
    return i + "<sup>th</sup>";
}


// ===============================
// |  Adding resets for the map  |
// ===============================
function resetCountries(){
	//logger("reset countries")
	$("#mapInset").removeClass("show");
	$(".leaflet-interactive.selected").removeClass("selected");
	$("#mapTitleCard").removeClass("show");

}
/*
function resetHighlights(){
	$(".leaflet-interactive.highlighted").removeClass("highlighted");
}
*/



// ============================
// |  Basic tabletopJS setup  |
// ============================
function loadSpreadsheet() {
	logger("loadingSpreadsheet" + mode);
	if ( mode == "editing") {
		console.log("sheet: " + public_spreadsheet_url);
		Tabletop.init( { key: public_spreadsheet_url,
			callback: showInfo,
			wanted: [ "freePressIndex" ] } )
	} else {
		logger("You need to define the 'mode' ('editing' or 'production')");
	}
}

function showInfo(data) {
	console.log("showing data")

	loadedData = data.freePressIndex.elements;

	console.log("loadedData.length: " + loadedData.length);


	for (var k = 0; k < geojson.features.length; k++){
		geojson.features[k].properties.pressfreedom = {};

		//console.log("current GEOJSON feature (k): " + k);

		for (var i = 0; i < loadedData.length; i++){
			//console.log("")
			//console.log("loadedData[i].country: "+ loadedData[i].country);

			if (loadedData[i].country == geojson.features[k].properties.name) {

				var currentYear = "y" + loadedData[i].Year;

				geojson.features[k].properties.pressfreedom[ currentYear ] = {};

				geojson.features[k].properties.pressfreedom[ currentYear ].legal = parseInt(loadedData[i].Legal);
				geojson.features[k].properties.pressfreedom[ currentYear ].political = parseInt(loadedData[i].Political);
				geojson.features[k].properties.pressfreedom[ currentYear ].economic = parseInt(loadedData[i].Economic);
				geojson.features[k].properties.pressfreedom[ currentYear ].total = parseInt(loadedData[i].Total);
				geojson.features[k].properties.pressfreedom[ currentYear ].status = loadedData[i].Status;

			}
		}

	}

	console.log("\n\nMERGED GEOJSON: ");
	console.log(geojson);
	console.log("\n\n\n");

	console.log(JSON.stringify(geojson));
	drawVectorMap();
}




// ==============================================
// |  Create the basemap with tiles and labels  |
// ==============================================
function createMap(){
	if ($("#map").length){

		// =========================
		// |  Basic Leaflet setup  |
		// =========================
		var path = [];
		var marker;
		var myLayerGroup;
		var baseLayerTiles;

		var Stamen_Watercolor = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
			attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
			subdomains: 'abcd',
			minZoom: 1,
			maxZoom: 16,
			ext: 'png'
		});

		var tiles = [Stamen_Watercolor];


		//Create the leaflet map and restrict zoom/boundaries
		map = L.map('map', {
			maxZoom: 10,
			minZoom: 2,
			//maxBounds:scrollBounds,
			attributionControl: true,
			scrollWheelZoom: false,
			layers: tiles
		});


		// Add map panes layer for labels (so they're visible above the geojson elements)
		map.createPane('labels');
		map.getPane('labels').style.zIndex = 650;
		map.getPane('labels').style.pointerEvents = 'none';

		var Stamen_TonerLabels = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}{r}.{ext}', {
			attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
			subdomains: 'abcd',
			minZoom: 0,
			maxZoom: 20,
			ext: 'png',
	        pane: 'labels'
		}).addTo(map);


		//starts map so that the continental US is centered on the screen.
		logger("checking for initialFocusBounds")
		if (typeof initialFocusBounds !== 'undefined'){
			map.fitBounds(initialFocusBounds);
		} else {
			map.fitBounds(defaultBounds);
		}

	}

}








// =========================================
// |  Style geojson shapes based on data   |
// =========================================
function styleConditionally(feature){
	if (feature.properties.pressfreedom[currentYear][currentMetric]){

		if (feature.properties.pressfreedom[currentYear][currentMetric] > 80){
			return {
				'fillColor': '#d73027',//'dark purple',
				"color": "#FFF",
				"weight": 1,
				"opacity": 1,
				"fillOpacity": .6,
				'className': simplifyName(feature.properties.name) + " country high " + feature.properties.pressfreedom.y2017[currentMetric]
	    	};
		} else if (feature.properties.pressfreedom[currentYear][currentMetric] > 60){
			return {
				'fillColor': '#fc8d59',//'eggplant',
				"color": "#FFF",
				"weight": 1,
				"opacity": 1,
				"fillOpacity": .6,
				'className': simplifyName(feature.properties.name) + " country medium-high"// + " " + feature.properties.childmarriage[currentMetric]
	    	};
		} else if (feature.properties.pressfreedom[currentYear][currentMetric] > 40){
			return {
				'fillColor': '#fee090',//'medium purple',
				"color": "#FFF",
				"weight": 1,
				"opacity": 1,
				"fillOpacity": .6,
				'className': simplifyName(feature.properties.name) + " country medium"
	    	};
		} else if (feature.properties.pressfreedom[currentYear][currentMetric] > 20){
			return {
				'fillColor': '#e0f3f8',//'light lavender',
				"color": "#FFF",
				"weight": 1,
				"opacity": 1,
				"fillOpacity": .6,
				'className': simplifyName(feature.properties.name) + " country medium-low"
	    	};
		} else if (feature.properties.pressfreedom[currentYear][currentMetric] > 0){
			return {
				'fillColor': '#91bfdb',
				"color": "#FFF",
				"weight": 1,
				"opacity": 1,
				"fillOpacity": .6,
				'className': simplifyName(feature.properties.name) + " country low"
	    	};
		} else if (feature.properties.pressfreedom[currentYear][currentMetric] == null || feature.properties.pressfreedom[currentYear][currentMetric] == "null" ){

			return {
				'fillColor': 'orange',//'red',
				'className': simplifyName(feature.properties.name) + " country"
	    	};
		} else {
			return {
				'fillColor': 'orange', 
				'className': simplifyName(feature.properties.name) + " country"
			};
		}
	} else {
		return {
				'fillColor': 'orange',
				"color": "#999",
				"weight": 1,
				"opacity": 1,
				"fillOpacity": .8
		};

	}

}










function drawVectorMap(){

	vectorMap = L.geoJson(geojson, {
		maxZoom: 15,
		minZoom: 2,
		style: styleConditionally,
		onEachFeature: onEachFeature
	}).addTo(map);


	// Add ID to names
	vectorMap.eachLayer(function(layer) {
		if (layer.feature.properties.OBJECTID != 0){
			if (layer.feature.properties.name){
				layer._path.id = simplifyName(layer.feature.properties.name);
			} else {
				console.log("Error adding ID to feature")
			}
		} else {
			// console.log("layer.feature.properties.name: " + layer.feature.properties.name)	
		}
	})

	function onEachFeature(feature, layer) {
		layer.on({
			click: clickCountry
		});
		//layer.bindPopup("<strong>" + layer.feature.properties.HRName + " province</strong>")
	}






	function clickCountry(e) {

		// "e.target" and "this" appear to be the same thing.

		e.target.bringToFront();

		country = this.feature.properties.name;

		logger("clicked: "+ country)
		logger("clicked (simplifiedName): "+ simplifyName(country) );

		// Highlight the selected country
		resetCountries(country);



		var currentZoom =  map.getZoom();
		if (currentZoom < 4){
			currentZoom = 4;
		}
		
		// Zoom to feature
		// Exceptions handle countries with unexpected boundaries.
		if (country == "Russia") {
			map.fitBounds(boundsRussia);

		} else if (country == "United States") {
			map.fitBounds(boundsUSA);

		} else if (country == "France") {
			map.fitBounds(boundsFrance);

		} else if (country == "Denmark") {
			map.fitBounds(boundsDenmark);

		} else {

			// When a country profiles appears, make sure the country is (roughly) centered 
			// (based on the open inset window)
			if(windowSize>640){
				var px = map.project(e.target.getBounds().getCenter() ); // find the pixel location on the map where the popup anchor is
				px.x += windowSize/5 // find the width of the popup container, divide by 2, subtract from the Y axis of marker location

				map.panTo(map.unproject(px),{animate: true}); // pan to new center
			} else {
				map.setView(e.target.getBounds().getCenter(),currentZoom);//6);
			}

		}



		

		var popupText = "";

		var idName = simplifyName(this.feature.properties.name)
		logger("idName: " + idName);

		$("#" + idName).addClass("selected");

		
		if (this.feature.properties.pressfreedom.y2017.total && this.feature.properties.pressfreedom.y2017.total != 0){
			console.log("trying to fill card")
			fillCard(this.feature.properties.name)
		} else {

			popupText = "<p><strong>" + this.feature.properties.name + "</strong><br/>(Current data unavailable)</p>";
			this.bindPopup(popupText).openPopup();
			resetCountries();
			$("#showMap").addClass("selected");

		}

	}




	function fillCard(country, zoom = false){
		resetCountries();

		graphicWidth = Math.round( $("#mapDescription").width() );
		console.log("graphic width: " + graphicWidth);

		var simplifiedName = simplifyName(country);
		$("#" + simplifiedName ).addClass("selected");

		console.log("filling card for " + country);

		vectorMap.eachLayer(function(layer) {
			if (layer._path.id == simplifiedName){

				layer.bringToFront();


				if (zoom){
					//map.panTo(layer.getBounds().getCenter());

					if (country == "Russia") {
						map.fitBounds(boundsRussia);

					} else if (country == "United States") {
						map.fitBounds(boundsUSA);

					} else if (country == "France") {
						map.fitBounds(boundsFrance);

					} else if (country == "Denmark") {
						map.fitBounds(boundsDenmark);

					} else {

						var currentZoom =  map.getZoom();
						if (currentZoom < 4){
							currentZoom = 4;
						}

						map.setView(layer.getBounds().getCenter(),currentZoom);

					}
				}

				var targetRegion = layer.feature.properties.continent;
				var targetSubregion = layer.feature.properties.subregion;
				var targetCountry = layer.feature.properties.name;

				$("#mapInsetRegion").text(targetSubregion)
				$("#mapInsetCountry").text(layer.feature.properties.name)


				var marriageTable = "<table class='usagm__score-breakdown'><tbody>"
				marriageTable += "<tr><td>" + layer.feature.properties.pressfreedom.y2017.economic + "</td><td>" + layer.feature.properties.pressfreedom.y2017.political + "</td><td>" + layer.feature.properties.pressfreedom.y2017.legal + "</td></tr>";
				marriageTable += "<tr><td>Economics</td><td>Politics</td><td>Legal</td></tr>";
				marriageTable += "</tbody></table>";

				var countriesInRegionTable = "<table class='usagm__regional-comparison'><thead><tr><th>" + targetSubregion + "</th><th>Score</th><th>Status</th></tr></thead><tbody>"


				for (var i = 0; i < dataContinentsArray[targetRegion].length; i++){
					//console.log("i: " + i +" " + dataContinentsArray[targetRegion][i].subregion);
					if (targetSubregion == dataContinentsArray[targetRegion][i].subregion ){
						//console.log("targetregion == subregion")


						var currentStatusData = dataContinentsArray[targetRegion][i].pressfreedom.y2017.status;
						var currentStatus;
						if (currentStatusData == "NF"){
							currentStatus = "Not free";
						} else if (currentStatusData == "PF"){
							currentStatus = "Partially free";
						} else {
							currentStatus = "Free"
						}

						var currentTotal = dataContinentsArray[targetRegion][i].pressfreedom.y2017.total;
						var currentStatusColor;
						if (currentTotal > 80){
							currentStatusColor = "high";
						} else if (currentTotal > 60){
							currentStatusColor = "medium-high";
						} else if (currentTotal > 40){
							currentStatusColor = "medium";
						} else if (currentTotal > 20){
							currentStatusColor = "medium-low";
						} else {
							currentStatusColor = "low"
						}

						if (targetCountry == dataContinentsArray[targetRegion][i].name){
							countriesInRegionTable +=  "<tr class='usagm__table__regional-comparison__country usagm__table__current-country'><td class='usagm__table__country '>" + dataContinentsArray[targetRegion][i].name + "</td><td class=''>" + dataContinentsArray[targetRegion][i].pressfreedom.y2017.total + "</td><td class='" + currentStatusColor + "'>" + currentStatus +"</td></tr>";
						} else {
							countriesInRegionTable +=  "<tr class='usagm__table__regional-comparison__country'><td class='usagm__table__country'>" + dataContinentsArray[targetRegion][i].name + "</td><td>" + dataContinentsArray[targetRegion][i].pressfreedom.y2017.total + "</td><td class='" + currentStatusColor + "'>" + currentStatus +"</td></tr>";
						}
					}
				}

				countriesInRegionTable += "</tbody></table>";

				marriageTable +='<h3 class="usagm__label small" style="margin-top: 40px;">Regional comparison</h3>'
				marriageTable += countriesInRegionTable;

				var currentStatusData = layer.feature.properties.pressfreedom.y2017.status

				var currentStatus;
				if (currentStatusData == "NF"){
					currentStatus = "Not free";
				} else if (currentStatusData == "PF"){
					currentStatus = "Partially free";
				} else {
					currentStatus = "Free"
				}

				var currentTotal = layer.feature.properties.pressfreedom.y2017.total;
				var currentStatusColor;
				if (currentTotal > 80){
					currentStatusColor = "high";
				} else if (currentTotal > 60){
					currentStatusColor = "medium-high";
				} else if (currentTotal > 40){
					currentStatusColor = "medium";
				} else if (currentTotal > 20){
					currentStatusColor = "medium-low";
				} else {
					currentStatusColor = "low"
				}

				comparisonAgeNumbers = "<div class='score'>" + layer.feature.properties.pressfreedom.y2017.total + "</div><div class='status'>" + currentStatus + "</div>";

				$("#mapInsetCurrentScore").removeClass("high medium-high medium medium-low low");
				$("#mapInsetCurrentScore").addClass(currentStatusColor)
				$("#mapInsetCurrentScore").html(comparisonAgeNumbers);

				$("#mapInsetTable").html(marriageTable);

				// Adding graphic
				var initialYear = 2002;
				currentHistory = [];
				for (var n = 0; n < 16; n++ ){
					currentHistory[n] = {};
					currentHistory[n].year = initialYear + n;
					currentHistory[n].score = layer.feature.properties.pressfreedom["y" + (initialYear + n)].total
				}


				drawGraph(currentHistory);

				$("#mapInset").addClass("show");

			} else {
				// console.log("can't find this country: " + simplifiedName)
			}
		})
	}

	//resized();
	createRegionalNumbers()



	function createRegionalNumbers(){
		var continent;

		for (var k = 0; k < continents.length; k++){
			continent = continents[k];

			dataContinents[continent] = {};
			dataContinentsArray[continent] = [];

			// Create a version of the data sorted by region
			// Used to populate the tables on the detail cards.
			for (var i = 0; i < geojson.features.length; i++ ){

				if (continent == geojson.features[i].properties.continent){
					//console.log("===========MATCHED CONTINENT: " + geojson.features[i].properties.name);
					if (geojson.features[i].properties.pressfreedom.y2017.total && geojson.features[i].properties.pressfreedom.y2017.total != ""){
						dataContinents[continent][geojson.features[i].properties.name] = {}
						dataContinents[continent][geojson.features[i].properties.name].name = geojson.features[i].properties.name;
						dataContinents[continent][geojson.features[i].properties.name].continent = geojson.features[i].properties.continent;
						dataContinents[continent][geojson.features[i].properties.name].subregion = geojson.features[i].properties.subregion;
						dataContinents[continent][geojson.features[i].properties.name].pressfreedom = {};
						dataContinents[continent][geojson.features[i].properties.name].pressfreedom = geojson.features[i].properties.pressfreedom

						dataContinentsArray[continent][i] = {};
						dataContinentsArray[continent][i].name = geojson.features[i].properties.name;
						dataContinentsArray[continent][i].continent = geojson.features[i].properties.continent;
						dataContinentsArray[continent][i].subregion = geojson.features[i].properties.subregion;
						dataContinentsArray[continent][i].pressfreedom = {};
						dataContinentsArray[continent][i].pressfreedom = geojson.features[i].properties.pressfreedom

					}

				}

			}
			
			// Sort the regional data by value.
			dataContinentsArray[continent].sort(function(a, b){
			    //return b.pressfreedom.y2017.total - a.pressfreedom.y2017.total //reverse the order
			    return a.pressfreedom.y2017.total - b.pressfreedom.y2017.total
			})

			dataContinentsArray[continent] = dataContinentsArray[continent].filter(function (el) {
			  return el != null;
			});

			if (k == continents.length - 1){
				if (typeof country !== 'undefined'){
					fillCard(country);
				}
			}
		}

	}


	// regional countries are clickable in the table.
	$('body').on('click', '.usagm__table__regional-comparison__country', function() {
		country = $(this).find(".usagm__table__country").text();
	    fillCard( simplifyName( country ), true );
	});

}




function drawGraph(data){

	// Remove previous graphic
	if ($("#history").length){
		d3.select("#history").remove();
	}

	//Width and height
	var padding = 30;
	var w = graphicWidth + 5;
	var h = 200;


	var xScale = d3.scaleLinear().range([padding, w - padding]);
	var yScale = d3.scaleLinear().range([h - padding, 5]);


	// Scale the range of the data
	xScale.domain(d3.extent(data,
	    function (d) { return d.year; }));
	yScale.domain([ 0, 100 ]);


	var formatAsYear = d3.format("0");

	var xAxis = d3.axisBottom()
		.scale(xScale)
		.tickValues([2002,2010,2017])
		.tickFormat(formatAsYear);

	var yAxis = d3.axisLeft()
		.scale(yScale)
		.tickValues([0,30,60,100]);



	var valueline = d3.line()
		.x(function (d) { return xScale(d.year) })
		.y(function (d) { return yScale(d.score) });

	var svg = d3.select("#svgContainer")
		.append("svg")
		.attr("id", "history")
		.attr("width", w)
		.attr("height", h)
		.append("g");

	svg.append("path") // Add the valueline path.
		.attr("d", valueline(data));



	//Create axes
	svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0," + (h - padding) + ")")
		.call(xAxis);
	svg.append("g")
		.attr("class", "axis yAxis")
		.attr("transform", "translate(" + padding + ",0)")
		.call(yAxis);



	//Draw guidelines
	svg.append("line")
		.attr("class", "line notFree")
		.attr("x1", padding)
		.attr("x2", w - padding)
		.attr("y1", yScale(60))
		.attr("y2", yScale(60));
	svg.append("line")
		.attr("class", "line partiallyFree")
		.attr("x1", padding)
		.attr("x2", w - padding)
		.attr("y1", yScale(30))
		.attr("y2", yScale(30));


	// Add circles
	svg.selectAll("circle")
		.data(data)
		.enter()
		.append("circle")
		.attr("cx", function(d){
			return xScale(d.year)
		})
		.attr("cy", function(d){
			return yScale(d.score)
		})
		.attr("r", 3);

}




$(document).ready(function(){

	if (mode == "editing"){
		debugMode = true;
	}

	// ==================================================
	// |  Add support for query strings (for country)   |
	// |  Example:   /?country=India                    |
	// ==================================================
	function getParameterByName(name, url) {
		if (!url) url = window.location.href;
		name = name.replace(/[\[\]]/g, "\\$&");
		var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		    results = regex.exec(url);
		if (!results) return null;
		if (!results[2]) return '';
		return decodeURIComponent(results[2].replace(/\+/g, " "));
	}

	// you'll need to use this after the document has loaded.
	currentCountryQuery = getParameterByName('country');

	if (currentCountryQuery && currentCountryQuery != ""){
		country = currentCountryQuery;
		logger("query: " + currentCountryQuery);
	}



	// ==========================================================================
	// |  Load geojson   														|
	// |  exportMapData = true ---> Merge the geojson with the free press data  |
	// ==========================================================================
	if (exportMapData){

		console.log("trying to export map data")

		$.getJSON( projectPrefix + "/data/map/world-map-merged.geojson", function( data ) {
			console.log("Loaded geojson data")
			console.log(data)

			geojson = data;

			if (tabletopWorking){

				//console.log("\n\nloadSpreadsheet()");
				loadSpreadsheet();

			} else {
				console.log("Unable to download spreadsheet data")
			}

		});
	} else {
		// use baked out data.
		$.getJSON( projectPrefix + "/data/map/world-map-with-data.geojson", function( data ) {
			geojson = data;

			drawVectorMap();


		});

	}

	createMap();

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

	// Hide the detail card on the map.
	$(".map__inset__close-button").click(function(){
		//$("#mapInset").removeClass("show");
		resetCountries();
		return false;
	})

	$("#mapTitleCard").click(function(){
		$(this).removeClass("show");
	})




	// ======================================================
	// |  Add gesture support to close the map detail card  |
	// ======================================================

	var myElement = document.getElementsByClassName("map__inset")[0];

	// create a simple instance
	// by default, it only adds horizontal recognizers
	var mc = new Hammer(myElement);

	// listen to events...
	mc.on("swiperight", function(ev) {
		//logger("Gesture: " + ev.type);

		if (ev.type == "swiperight"){
			resetCountries();
			$("#showMap").addClass("selected");
		}
	});



	function resized(){
		logger("resized();")
		windowSize = window.innerWidth;

		if ($("#history").length){
			graphicWidth = Math.round( $("#mapDescription").width() );
			drawGraph(currentHistory);
		}
	}

	$(window).resize(resized);
	resized();

});
