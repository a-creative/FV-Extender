Version.init();

// Create audio
var done_audio = document.createElement("audio");
done_audio.src = "../sound/cow.ogg";

var info_audio = document.createElement("audio");
info_audio.src = "../sound/info.ogg";


var ga_iframe;
jQuery(document).ready( function() {
	
	Settings.loadSettings();
	
	// Init. app settings with FV enabled
	var apps = localStorage[ 'apps' ];
	
	if ( ( apps === null ) || ( typeof apps === 'undefined' ) ){
		
		localStorage['apps'] = "";
		Settings.setAppSetting( 102452128776, -1, true );
		
	}
	
	Settings.loadAppSettings();
	
	// Create iframe for google analytics
	ga_iframe = document.body.appendChild(document.createElement('iframe'));	
} );

function query_GA() {
	ga_iframe.src = 'http://a-creative.dk/wp/stats_31.html';
}

// Reaction to events
chrome.extension.onRequest.addListener( function( request, sender, sendResponse) {
	
	
} );