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

function Process_requests( app_requests ) {
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
			if ( ( options.weekly_test === 1 ) && ( options.weekly_test_stop_at === '' ) ) {
				
				var item_count = {};
				for ( i = 0; i < 50; i++ ) {
					app_request = app_requests[ i ] ;
					
					// Get app request id
					try {
						app_request_text = document.evaluate(".//div[contains(@class,'appRequestBodyNewA')]", app_request, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
						
						app_request_item_name = get_item_name( app_request_text );
						
						if ( isNaN( item_count[ app_request_item_name ] ) ) {
							item_count[ app_request_item_name ] = 0;
						} 
						
						item_count[ app_request_item_name ]++;
						
					
					} catch( err ) {
						
						console.log('FAILED at index:' + i + ' - ' + app_requests[ i ] );
						continue;
					}
				}
				
				var stats = '';
				for ( var item_name in item_count ) {
					stats += item_count[ item_name ] + 'x\t' + item_name + '\n';						
				}
				console.log( stats );
				
				handled = true;
				
				var last_request = app_requests[50];
				var last_id = document.evaluate(".//input[contains(@id,'div_id')]", last_request, null, XPathResult.ANY_TYPE, null).iterateNext().value;
				
				chrome.extension.sendRequest( { "action" : "stop_processing", "ptype" : 3, "last_id": last_id }, _statsLoaded );
				
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
				
				if ( ( options.weekly_test === 1 ) && ( options.weekly_test_stop_at !== '' ) ) {
				
					if ( options.weekly_test_stop_at === app_request_id ) {
						handled = true;
						chrome.extension.sendRequest( { "action" : "stop_processing", "ptype" : 4 }, _testDone );
						return;	
					}						
				}
				
				
				
				// Set to accept as default
				var action = 'accept';
				var delay = 0;
				if ( typeof processed_ids[ app_request_id ] != 'undefined' ) {
					
					// If request has already been processed
					
					if ( processed_ids[ app_request_id ] == 1 ) {
						
						// If it has only been processed one time				
						action = 'reject';
						delay = 10000;
						
					} else if ( processed_ids[ app_request_id ] > 2 ) {
						
						// If it has been processed several times
						
						// Then stop processing due to problems with rejecting requests
						action = 'reject';	
						delay = 10000 + ( 500 * processed_ids[ app_request_id ] );
					}
				}
				
				if ( action == 'accept' ) {
					if ( ( ( options.settings.rejectGifts === 'true' ) || ( options.settings.rejectGifts === true ) ) && ( app_request_item_name != 'Help request' ) ) {
						action = 'reject';
						delay = 10000;
					} else if ( ( ( options.settings.rejectNeighbors === 'true' ) || ( options.settings.rejectNeighbors === true ) ) && ( app_request_text.match( /Howdy friend\! How'd you like to be neighbors/ ) ) ) {
						action = 'reject';
						delay = 10000;
					}	
				}
				
				console.log(action + ':' + app_request_item_name + ' : "' + app_request_text + '"' );
				
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
				} else if ( action == 'reject' ) {
					request_count--;
					chrome.extension.sendRequest( { "action" : "update_badge_text", count:  request_count } );
					action_btn = document.evaluate(".//input[starts-with(@name,'actions[reject')]", app_request, null, XPathResult.ANY_TYPE, null).iterateNext();
					
					action_btn.click();
					setTimeout( function() {
						chrome.extension.sendRequest( { "action" : "finish_reject", "processed_id" : app_request_id }, function() {
							window.location.reload();
						});	
					}, delay );
					break;
				}
				
			}				
			
			// Check if all shown requests were rejected
			if ( request_count == 0 ) {				
				
				// There was requests but they were all skipped or rejected. So we're done!
				handled = true;				
				chrome.extension.sendRequest( { "action" : "stop_processing", "ptype" : 1 }, _processingDone );				
			}
		} );
	} );	
}

function Find_requets() {	
	
	var ignored_el = jQuery('.pas.uiBoxYellow');
	if ( ignored_el && ignored_el.length ) {
		if_not_detected( ignored_el, function( ignored_el ) {
			
			var parent = ignored_el.parent();
			if( parent && parent.length ) {
				
				var app_request_id = parent.attr( 'id' );
				
				chrome.extension.sendRequest( { "action" : "finish_reject", "processed_id" : app_request_id }, function() {
					window.location.reload();
				});	
				return;
			}	
		} );
	}	
	
	// Find app request group
	var app_request_group = jQuery('#confirm_102452128776');
	
	if ( app_request_group && app_request_group.length ) {
		
		var app_requests = app_request_group.find( "li.requestStatus" );
		
		if ( app_requests && app_requests.length ) {
		
			if_not_detected( app_requests, function() {
				
				// Requets found
				
				// Process requests found
				Process_requests( app_requests );
				
			});
		}
	}
}

function checkFinishPage( callback ) {
	
	var content_el = document.evaluate("//div[@id='pagelet_requests']", window.document, null, XPathResult.ANY_TYPE, null).iterateNext();
	var right_url = document.location.href.match( /\/games/ );
	
	if ( content_el && right_url ) {
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
				window.location.replace( 'http://www.facebook.com/games' );
			}
		} );
	}
}

function _processingDone( result ) {
	
	if ( result.error ) {
		alert ( 'ERROR:' + result.error );	
	} else {
		alert( 'Processing is done.\n\nFVE currently only handles FV requests!' );
		console.log('ptype:' + result.ptype );
	}
}

function _statsLoaded( stats ) {
	alert( 'Stats loaded.\n\n1. Check actual content related to stats and\n2. Run test again.');
}

function _testDone() {
	alert( 'Test done.\n\n1. Compare stats with actual\n2. Disable test.');	
}
