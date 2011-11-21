function get_item_name( text ) {
	
	var item_name = false;
	
	var matches = text.match( /Special Delivery/ );								
	if ( matches ) {
		item_name = "Special Delivery"
	} else {
	
		var matches = text.match( /Here is (.+) for your farm/ );
		if ( matches ) {
			item_name = matches[ 1 ]
		} else {
			
			var matches = text.match( /Give (?:a|an) (.+) and get one too/ );
			
			if ( matches ) {
				item_name = matches[ 1 ]
			} else {
				item_name = 'Help request';	
			}
		}
	}
	
	item_name = item_name.replace( /^(?:a|an) /, '' );
	
	return item_name;
}

function Process_next() {	
	
	var app_request_group = document.evaluate("//div[@id='confirm_102452128776']", document, null, XPathResult.ANY_TYPE, null).iterateNext();
	
	if ( app_request_group ) {
		
		// If FarmVille request group was found
		
		// Find the container for requests
		var requests_el = app_request_group.getElementsByClassName( 'requests' )[ 0 ];
		
		var app_requests = requests_el.childNodes;
		
		var app_request;
		var app_request_id;
		var app_request_text;
		var app_request_item_name;
		var item_name;
		
		chrome.extension.sendRequest( { "action" : "get_processed_ids" }, function( processed_ids ) {
			
			chrome.extension.sendRequest( { "action" : "get_options" }, function( options ) {
			
				chrome.extension.sendRequest( { "action" : "update_badge_text", count:  app_requests.length } );
				
				var i;
				var request_count = app_requests.length;
				
				// Optionally perform weekly test
				if ( options.weekly_test && ( request_count <= 90 ) ) {
					
					var item_count = {};
					for ( i = 0; i < app_requests.length; i++ ) {
						app_request = app_requests[ i ];
						
						// Get app request id
						try {
							app_request_text = document.evaluate(".//div[contains(@class,'appRequestBodyNewA')]", app_request, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
							
							app_request_item_name = get_item_name( app_request_text );
							
							if ( isNaN( item_count[ app_request_item_name ] ) ) {
								item_count[ app_request_item_name ] = 0;
							} 
							
							item_count[ app_request_item_name ]++;
							
						
						} catch( err ) {
							
							console.log('FAILED:' + app_request.innerHTML );
							continue;
						}
					}
					
					var stats = '';
					for ( var item_name in item_count ) {
						stats += item_count[ item_name ] + 'x\t' + item_name + '\n';						
					}
					console.log( stats );
					
					chrome.extension.sendRequest( { "action" : "stop_processing", "ptype" : 3 }, _statsLoaded );
					
					return;
				}	
				
				
				// Find request and click
				for ( i = 0; i < app_requests.length; i++ ) {
					app_request = app_requests[ i ];
					
					// Get app request id
					try {
						app_request_id = document.evaluate(".//input[contains(@id,'div_id')]", app_request, null, XPathResult.ANY_TYPE, null).iterateNext().value;
						app_request_text = document.evaluate(".//div[contains(@class,'appRequestBodyNewA')]", app_request, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
						
						app_request_item_name = get_item_name( app_request_text );
						
					
					} catch( err ) {
						
						console.log('FAILED:' + app_request.innerHTML );
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
					
					// Find the appropiate button and click it
					var action_btn;
					if ( action == 'accept' ) {
						
						// Set it as the current id in backend
						chrome.extension.sendRequest( { "action" : "set_current_id", "current_id" : app_request_id, "current_text" : app_request_text, "current_item_name" : app_request_item_name }, function( app_request_id ) {
							
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
					
					checkFinishPage( function() {
						
						// There was requests but they were all skipped or rejected. So we're done!
						chrome.extension.sendRequest( { "action" : "stop_processing", "ptype" : 1 }, _processingDone );				
					} );
				
					
				}
			} );
		} );
		
	} else {
		
		checkFinishPage( function() {
			
			// There was no request left at all!
			chrome.extension.sendRequest( { "action" : "stop_processing", "ptype" : 2 }, _processingDone );				
		} );
	}	
}

function checkFinishPage( callback ) {
	var content_el = document.evaluate("//div[@id='contentArea']/input[@id='post_form_id']", window.document, null, XPathResult.ANY_TYPE, null).iterateNext();
	if ( content_el && document.location.href.match( /reqs\.php/ ) ) {
		callback();
	} else {
		
		chrome.extension.sendRequest( { "action" : "check_for_list_reload" }, function( do_reload ) {
			if ( do_reload ) {
				window.location.replace( 'https://www.facebook.com/reqs.php' );
			}
		} );
	}
}

function _processingDone( result ) {
	
	alert( 'Processing is done.\n\nFVE currently only handles FV requests!' );
	console.log('ptype:' + result.ptype );
}

function _statsLoaded( stats ) {
	alert( 'Stats loaded');
}
