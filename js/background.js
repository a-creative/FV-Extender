var processing = false;
var processed_ids = [];
var current_id = -1;

// Reaction to events
chrome.extension.onRequest.addListener( function( request, sender, sendResponse) {
	
	console.log( 'Action requested:' + request.action );
		
	if ( request.action == 'init_process_requests' ) {
		processing = true;
		sendResponse( processing );
	} else if ( request.action == 'is_processing' ) {
		sendResponse( processing );	
	} else if ( request.action == 'stop_processing' ) {
		processing = false;
		sendResponse( request );		
	} else if ( request.action == 'get_processed_ids' ) {
		sendResponse( processed_ids );
	} else if ( request.action == 'add_processed_id' ) {
		
		processed_ids.push( request.processed_id );
		if ( processed_ids.length > 20 ) {
			processed_ids.shift();
		}
		
		sendResponse( request.processed_id );
	} else if ( request.action == 'finish_current_id' ) {
		processed_ids.push( current_id );
		if ( processed_ids.length > 20 ) {
			processed_ids.shift();
		}
		
		sendResponse( current_id );
	} else if ( request.action == 'set_current_id' ) {
		current_id = request.current_id;
		sendResponse( current_id );
	}
} );