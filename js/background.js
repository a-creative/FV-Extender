var processing = false;


// Reaction to events
chrome.extension.onRequest.addListener( function( request, sender, sendResponse) {
		
	if ( request.action == 'init_process_requests' ) {
		processing = true;
		sendResponse( processing );
	} else if ( request.action == 'is_processing' ) {
		sendResponse( processing );	
	} else if ( request.action == 'stop_processing' ) {
		processing = false;
		sendResponse( true );		
	}		
} );