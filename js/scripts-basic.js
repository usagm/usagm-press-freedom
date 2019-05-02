var currentLanguage = "english"; // replaced in the html


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
