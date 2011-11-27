function locatePageletContent( data, pagelet_name ) {
	
	var input_err_code = 0;
	var html_data = '';
	
	var begin2_search = '"content":{"pagelet_' + pagelet_name + '":{"container_id":"';
	
	console.log( 'Find a:' +  begin2_search );
	
	var begin2 = data.indexOf( begin2_search )
	if ( begin2 != -1 ) {
		
		alert('found a');
		
		// Request data is inside hidden element
		
		// Find the container id for the element
		var container_id_cand = data.substr( begin2 + begin2_search.length, begin2 + begin2_search.length + 100 );
		
		var end2 = container_id_cand.indexOf('"');
		var container_id = container_id_cand.slice(0,end2);
		
		// Find container value with html for requests
		var hidden_el_begin_str = '<code class="hidden_elem" id="' + container_id + '"><!-- ';
		
		var hidden_el_begin = data.indexOf( hidden_el_begin_str );
		if ( hidden_el_begin != -1 ) {
			
			var hidden_el_content_cand = data.substr( hidden_el_begin + hidden_el_begin_str.length );
			var hidden_el_end = hidden_el_content_cand.indexOf(" --></code>");
			html_data = hidden_el_content_cand.slice(0,hidden_el_end);
		
		} else {
			input_err_code = 1;
		}
	} else {
		
		alert('not found a');
		
		console.log( 'Find b:' +  '"content":{"pagelet_' + pagelet_name + '":"' );
		
		var begin3 = data.indexOf( '"content":{"pagelet_' + pagelet_name + '":"' );
		if ( begin3 != -1 ) {
			
			alert('found b');
			
			var end = data.indexOf( '"}', ( begin3 + 10 ) ) + 2;
			var json_str_data = data.slice( ( begin3 + 10 ), end );
		
			var json_data = {};
			try {
				json_data = JSON.parse( json_str_data );
			} catch( e ) {
				input_err_code = 2
			}
			
			html_data = json_data[ 'pagelet_' + pagelet_name ];
		} else {
			
			alert('not found b');
			
			input_err_code = -1;
		}
		
	}
	
	return ( { error: input_err_code, content: html_data } ); 		
}

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
	
	var app_request_group = jQuery('#confirm_102452128776');
	if( ! ( app_request_group && app_request_group.length ) ) {
	
		var result = locatePageletContent( document.body.innerHTML, 'requests' );
		
		if ( result.error == 0 ) {
			
			var html = "<div>" + result.content + "</div>";
			
			var document_el = jQuery( html );
			
			app_request_group = document_el.find( '#confirm_102452128776');
			
		} else {
			alert( 'error:' + result.error );
		}
	}
	
	if ( app_request_group && app_request_group.length ) {
		
		// If FarmVille request group was found
		
		// Find the container for requests
		var requests_el = app_request_group[ 0 ].getElementsByClassName( 'requests' )[ 0 ];
		
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
	var content_el_2 = document.evaluate("//div[@id='pagelet_requests']", window.document, null, XPathResult.ANY_TYPE, null).iterateNext();
	
	var right_url = document.location.href.match( /reqs\.php/ );
	var right_url_2 = document.location.href.match( /\/games/ );
	
	var page_1 = ( right_url && content_el );
	var page_2 = ( right_url_2 && content_el_2 );
	
	if ( page_1 || page_2 ) {
		callback();
	} else {
		
		var reason = '';
		
		if ( !content_el ) {
			reason += ' "no post form id el" '
		}
		
		if (!right_url) {
			reason += ' "not right url: \'' + document.location.href + '\'" ';
		}
		
		chrome.extension.sendRequest( { "action" : "check_for_list_reload", "reason" : reason }, function( do_reload ) {
			if ( do_reload ) {
				
				// Reload in 5 seconds
				setTimeout( function() {
					window.location.replace( 'http://www.facebook.com/games' );
				}, 5000 );
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
