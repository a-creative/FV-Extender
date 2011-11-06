

// Check if processing is active
chrome.extension.sendRequest( { "action" : "is_processing" }, function( is_processing ) {
	
	if ( is_processing ) {
		
		// We are in processing mode
		
		// Process next app request
		Process_next();
		
	}	
});		


	
	
	
	
	
	