console.log( 'Loading content.min...:' + document.location.href );
var script_injected = false;

// Check if processing is running
chrome.extension.sendRequest( { "action" : "inject_scripts" }, function( granted ) {
	if ( granted ) {
		script_injected = true;
	}
});