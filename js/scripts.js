//Grab the spreadsheet KEY from the URL bar (NOT from the published window)
var public_spreadsheet_url;// = '1C0idKR40Bf04-9x1BHTdDwmfojShT1NrnRFyfw-KuuI';// candidates and religions 
var currentLanguage = "english"; // replaced in the html

//var loadedData;
var loadedHouseData;

var currentVariable = "";
var dataSample = {};
var names = [];

//var loadDataFromSheets = true;



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

// Utility function for removing spaces and punctuation from a string
function simplifyName(name){
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



// ============================
// |  Basic tabletopJS setup  |
// ============================
function loadSpreadsheet() {
	if ( mode == "editing") {
		Tabletop.init( { key: public_spreadsheet_url,
		 	callback: showInfo,
		 	wanted: [ "profiles" ] } )
	} else {
		logger("You need to define the 'mode' ('editing' or 'production')");
	}
}


function showInfo(data) {

	logger(data.profiles);


}





// ====================================================================================================
// |                                        DOCUMENT READY                                            |
// ====================================================================================================

$(document).ready(function(){

	logger("Ready");

	// =====================================
	// |  load spreadsheet via tabletopJS  |
	// =====================================
	if (loadDataFromSheets){
		currentLanguage = language;
		currentStories = language;
		loadSpreadsheet();
	}

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



    // ===============================
    // |  load Tweets (if included)  |
    // ===============================
    function showTweet(){
        $( ".tweet" ).each(function( index ) {
            var tweet = $(this)[0];
            var id = $(this).data("tweet");

            twttr.widgets.createTweet(
              id, tweet, 
                {
                    conversation : 'none',    // or all
                    cards        : 'visible',  // or visible 
                    //linkColor    : '#900', // default is blue
                    theme        : 'light'    // or dark
                })

        });

    }
    if (includeTweets){
        showTweet();
    }
});








// ====================================================================================================
// |                        BUILD AFTER ALL IMAGES LOADED                             |
// ====================================================================================================
/*
$(window).on("load", function() {

});
*/