var handled = false;

function changes_detected() {
	
	// If changes detected
	Find_requets();
}

// Check if processing is active
chrome.extension.sendRequest( { "action" : "is_processing", "time:" : ( new Date().getTime() ) }, function( is_processing ) {
	
	if ( is_processing ) {
		
		// We are in processing mode
		
		// Start timeout in case or malformed list
		setTimeout(
			function() {
			
				if ( !handled ) {
					checkFinishPage( function() {
						
						// There was no request left at all!
						chrome.extension.sendRequest( { "action" : "stop_processing", "ptype" : 2 }, _processingDone );				
					} );
				}
			}
			, 20000
		);
		
		
		// Start detecting changes		
		run_detect_changes();
		
	}	
});		


	
	
	
	
	
	