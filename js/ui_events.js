function Process_next() {	
	
	var app_request_group = document.evaluate("//div[@id='confirm_102452128776']", document, null, XPathResult.ANY_TYPE, null).iterateNext();
	
	if ( app_request_group ) {
		
		// If FarmVille request group was found
		
		// Find the container for requests
		var requests_el = app_request_group.getElementsByClassName( 'requests' )[ 0 ];
		
		var app_requests = requests_el.childNodes;
		
		var app_request;
		var app_request_id;
		
		chrome.extension.sendRequest( { "action" : "get_processed_ids" }, function( processed_ids ) {
			
			chrome.extension.sendRequest( { "action" : "get_options" }, function( options ) {
			
				chrome.extension.sendRequest( { "action" : "update_badge_text", count:  app_requests.length } );
				
				var i;
				var request_count = app_requests.length;
				for ( i = 0; i < app_requests.length; i++ ) {
					app_request = app_requests[ i ];
					
					// Get app request id
					try {
						app_request_id = document.evaluate(".//input[contains(@id,'div_id')]", app_request, null, XPathResult.ANY_TYPE, null).iterateNext().value;
					} catch( e ) {
						
						console.log ('failed:' + app_request.innerHTML );
						continue;
					}
					
					// Set to accept as default
					var action = 'accept';
					for ( var j = 0; j < processed_ids.length; j++ ) {
						if ( processed_ids[ j ] == app_request_id ) {
							
							// Set to reject if has already been processed once, but is still on the list
							action = 'reject';
							break;
						}
					}
					
					console.log( i + ':' + app_request_id + ':' + action );
					
					// Find the appropiate button and click it
					var action_btn;
					if ( action == 'accept' ) {
						
						// Set it as the current id in backend
						chrome.extension.sendRequest( { "action" : "set_current_id", "current_id" : app_request_id }, function( app_request_id ) {
							
							action_btn = document.evaluate(".//input[starts-with(@name,'actions[accept') or starts-with(@name,'actions[http')]", app_request, null, XPathResult.ANY_TYPE, null).iterateNext();
								console.log('Clicking:' + app_request_id + ':' + app_request );
								
								// Check for hang
								chrome.extension.sendRequest( { "action" : "check_for_hang", "app_request_id" : app_request_id } );	
								
								action_btn.click();				
							
						} );
						break;
					} else {
						request_count--;
						chrome.extension.sendRequest( { "action" : "update_badge_text", count:  request_count } );
						action_btn = document.evaluate(".//input[starts-with(@name,'actions[reject')]", app_request, null, XPathResult.ANY_TYPE, null).iterateNext();
						action_btn.click();				
					}				
				}				
				
				if ( request_count == 0 ) {
				
					// There was requests but they were all skipped or rejected. So we're done!
					chrome.extension.sendRequest( { "action" : "stop_processing", "ptype" : 1 }, _processingDone );
				}
			} );
		} );
		
	} else {
		
		// There was no request left at all!
		chrome.extension.sendRequest( { "action" : "stop_processing", "ptype" : 2 }, _processingDone );			
	}	
}

function _processingDone( result ) {
	
	alert( 'Processing is done.\n\nFVE currently only handles FV requests!' );
	console.log('ptype:' + result.ptype );
}
