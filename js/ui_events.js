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
							try {
								console.log('Clicking:' + app_request_id + ':' + app_request );
								action_btn.click();				
							} catch( e ) {
								console.log('Couldn\'t click:' + app_request_id + ':' + app_request.innerHTML );
							}
						} );
						break;
					} else {
						action_btn = document.evaluate(".//input[starts-with(@name,'actions[reject')]", app_request, null, XPathResult.ANY_TYPE, null).iterateNext();
						action_btn.click();				
					}				
				}
				
				console.log( 'i:' + i );
				console.log( 'al:' + app_requests.length );
				
				if ( i == ( app_requests.length - 1 ) ) {
				
					// There was requests but they were all skipped. So we're done!
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
	alert( 'No FarmVille requests. FVE currently only handles FV requests!' );
	console.log('ptype:' + result.ptype );
}
