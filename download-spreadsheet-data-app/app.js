var express = require('express');
var fs = require('fs');
var Tabletop = require('tabletop');
//var https = require('https');
//var Papa = require('papaparse');

var app = express();




var entities = ["english"];//, "spanish" //sheet names

var datasets = [
	{"name": "stories", "url": "1zc4p0tJv7fiPLzf6pAzbn6FjhOnUupV1fQ8hyBuaETM", "location": "../data/"},// For client-side.
	{"name": "stories", "url": "1zc4p0tJv7fiPLzf6pAzbn6FjhOnUupV1fQ8hyBuaETM", "location": "../_data/"}// For build.
];


/*
// If trying to use PapaParser
var datasets = [
	{"name": "stories", "url": "https://docs.google.com/spreadsheets/d/e/2PACX-1vSX5fI3Lmwr3Q1ttCClPNFjShPD1GBE-t6wwK6aHcDHBC_Dvrjok_jEI1n_zI54sbyLxlkRCgXSv5u8/pubhtml", "location": "../../data/"},// For client-side.
	{"name": "stories", "url": "https://docs.google.com/spreadsheets/d/e/2PACX-1vSX5fI3Lmwr3Q1ttCClPNFjShPD1GBE-t6wwK6aHcDHBC_Dvrjok_jEI1n_zI54sbyLxlkRCgXSv5u8/pubhtml", "location": "../../_data/"}// For build.
];
*/


for (var k = entities.length - 1; k >= 0; k-- ){
	var language = entities[k];
	fetchData(language);
}

//Load data from google spreadsheet and write it to JSON files.
function fetchData(lang){
	var currentLang = lang;
	var currentLanguage = lang + "/";

	for (var i = datasets.length - 1; i >= 0; i--) {
		console.log(datasets[i].name);
		loadSheetsAll(datasets[i].name, datasets[i].url, datasets[i].location);
	}

	function loadSheetsAll(name, url, location){
		/*
		var destinationFile = location + name + ".csv";

		var download = function(url, dest, cb) {
		  var file = fs.createWriteStream(dest);
		  var request = https.get(url, function(response) {
		    response.pipe(file);
		    file.on('finish', function() {
		      file.close(cb);  // close() is async, call cb after close completes.
		    });
		  }).on('error', function(err) { // Handle errors
		    fs.unlink(dest); // Delete the file async. (But we don't check the result)
		    if (cb) cb(err.message);
		  });
		};

		download(url, destinationFile, parseMe);

		var parseMe = Papa.parse(destinationFile, {
		  header: true,
		  dynamicTyping: true,
		  step: function(row) {
		    console.log("Row:", row.data);
		  },
		  complete: function() {
		    console.log("All done!");
		  }
		});
		*/


		console.log('loading spreadsheet data: ' + currentLang);

		var spreadsheet_url = url;

		var myData;


		function loadSheet(data, tabletop) {
			console.log("loading data from spreadsheet");

			loadedSectorData = data[currentLang].elements;

			//Write updated data to .JSON files and update global variables.
			var currentNumber = 0;
			function writeJSON(){
				console.log("trying to write: " + currentLang);

				var filename = location + currentLanguage + name + '.json';
				const content = JSON.stringify(loadedSectorData);

				fs.writeFileSync(filename, content);

			}

			writeJSON();
			console.log("Successfully exported .JSON files");
		};


		var options = {
			key: spreadsheet_url,
			callback: loadSheet
		};

		Tabletop.init(options);

	}

}


module.exports = app;
