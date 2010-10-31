console.log('Loading background script...');
var apps = [
	{
		"id" 			: "102452128776",
		"name" 			: "FarmVille",
		"handled" 		: true,
		"Game_url" 		: 'http://www.farmville.com',
		"FB_url" 		: 'http://apps.facebook.com/onthefarm'
	}
];

var init_game_requests = new Object();
var total_init_game_requests = new Object();
var current_game_request = new Object();
var processed_game_requests_count = 0;
var accept_options;
var current_app_id;
var requests_tab;
var status_window;
var current_app;
var aborted = false;
var accept_and_return_active = false;
var done = false;

function get_handled_app( sendResponse, cand_app_id ) {
	var app;
	for ( var i = 0 ; i < apps.length; i++ ) {
		app = apps[ i ];	
		
		if ( app[ "id" ] == cand_app_id ) {
			if ( app[ "handled" ] ) {
				sendResponse( { app: app } );	
			}					
		}
	}		
	
	sendResponse( { app: null } );	
}

function group_requests( requests ) {
	
	var grouped_requests = new Array();
	jQuery.each( requests, function( i, request ) {		
		grouped_requests.push( group_request( request ) );
	});
	
	return ( grouped_requests );	
}

function accept_all( params ) {
	
	var requests = group_requests( params.requests );
	
	total_init_game_requests[ params.app.id ] = requests.length
	init_game_requests[ params.app.id ] = requests;
	current_app_id = params.app.id;	
	current_app = params.app;
	
	// Open window
	chrome.windows.create({
		"url" : "html/accept_all_options.html",
		"type" : "popup",
		"width" : 300,
		"height" : 220,
		"left" : params.wnd_x,
		"top" : params.wnd_y,
	}, function( wnd ) {
		status_window = wnd;
	});
}


function eval_request( request ) {	
	if ( 
				( request['IsThankYouGift'] ) 
			||	( request['IsMaterialRequest'] )
			||  ( request['IsOneWayGift'] )
			||  ( request['IsBushel'] ) 
			
	) {
		return 'accept'	
	} else if (
					( request[ 'IsNeighborRequest' ] )  
				||  ( request[ 'IsShovelRequest' ] )
				|| (
						( request['HasUserText'] )
					&&	( request['IsSendByFvExtender'] != true )
				)
	) { 
		return 'skip'				
	} else {
		return 'return_gift';		
	}
	
}

function update_status( sendResponse ) {
	
	var pct = 0;
	if ( total_init_game_requests[ current_app_id ] > 0 ) {	
		
		pct = ( processed_game_requests_count * 100 ) / total_init_game_requests[ current_app_id ] ;
		if ( pct > 100 ) {
			pct = 100;
		}
	}
	
	sendResponse( { 
			pct: pct,
			total: total_init_game_requests[ current_app_id ],
			status: processed_game_requests_count,
			done: done,
	} );
}


function skip_request( game_request ) {
	processed_game_requests_count++;
	accept_next();
}

function accept_request_ajax_success( data, textStatus, XMLHttpRequest ) {
	
	// Find result page URL in result data
	var temp_data = data;
					
	if ( matches = temp_data.match( /goURI\((\\".*?\\")/ ) ) {
		
		eval( "var URI_temp = '" + matches[ 1 ] + "'" );
		var URI = JSON.parse( URI_temp );
		
		// Request send gift result page
		$.ajax({
			type: "GET",
			url: URI,
			timeout: 10000,
			dataType: 'text',
			success: accept_request_ajax_result_page_success
		})
	}
}

function accept_request_ajax_result_page_success( data, textStatus, XMLHttpRequest ) { 
	var result_html = data;
	
	// Analyze result_html for: gift limits, errors
	
	
	// Remove request from UI
	removeRequestFromUI( current_game_request[ current_app_id ], function() {
		processed_game_requests_count++;
		accept_next();
	} );
}

function removeRequestFromUI( game_request, callback ) {
	 chrome.tabs.sendRequest( requests_tab.id, { action: "remove_request", request_id: game_request['id'] }, function(response) {
	 	callback();
	 });
}

function accept_request( request ) {
	console.log('Accepting request:' + request['text'] + '...' );
	$.ajax({
		type: "POST",
		timeout: 10000,
		url: 'http://www.facebook.com/ajax/reqs.php?__a=1',
		data: request.ajax_init_data,
		dataType: 'text',
		success: accept_request_ajax_success
	});
}

function accept_and_return( request ) {
	accept_and_return_active = true;
	
	var req_id = request['id'];
	chrome.tabs.sendRequest( requests_tab.id, { action: "accept_and_return", request_id: request['id'] })
}

function accept_next() {
	console.log('Accept next called')
	if ( !aborted ) {
		
		console.log( 'Querying for next request' );
		
		chrome.tabs.sendRequest( requests_tab.id, { action: "get_next_request" }, function( game_request ) {
			if ( game_request ) {
				game_request = group_request( game_request );
				
				console.log( 'Got next request:' + game_request['id'] );
				
				current_game_request[ current_app_id ] = game_request;
				
				setTimeout( function() {
					var eval_request_res = eval_request( game_request ) 
					console.log('evaled to ' + eval_request_res );
					if ( eval_request_res == 'skip' ) {
						skip_request( game_request );			
					} else if ( eval_request_res == 'accept' ) {
						accept_request( game_request )
					} else {
						accept_and_return( game_request );
					}
					
				}, 100 );
			} else {
				done = true;
			}	
		})
		
	}	
}

function goto_game() {
	chrome.windows.getCurrent( function( wnd ) {
		
		chrome.tabs.getAllInWindow( wnd.id, function( tabs ) {
			var found_tab;
			jQuery.each( tabs, function( i, tab ) {
				if (
						( tab.url.toLowerCase().indexOf( current_app.FB_url ) == 0 )
					||	( tab.url.toLowerCase().indexOf( current_app.Game_url ) == 0 )
				) {
					found_tab = tab;
					return false;
				}			
			} );
			
			if ( found_tab ) {
				chrome.tabs.update( 
					found_tab.id, {
						url : found_tab.url,
						selected: true,	
					}, 
					function() {
						if ( status_window ) {
							chrome.windows.remove( status_window.id );
						}		
					}
				);
			} else {
				chrome.tabs.create(
					{
						"windowId" : wnd.id,
						"url" : current_app.Game_url
					}, 
					function( tab ) {
						if ( status_window ) {
							chrome.windows.remove( status_window.id );
						}
					}
				);							
			}							
		});	
	} );	
}

chrome.extension.onRequest.addListener( function(request, sender, sendResponse) {
	/*
	if ( request.action == 'filter_skipped' ) {
		var eval_res;
		var requests = new Array();
		jQuery.each( request.requests, function( i, el ) {
			eval_res = eval_request( el );
			if ( eval_res != 'skip' ) {
				requests.push ( el );
			}						
		});
		sendResponse( { requests: requests } );
		
	} else
	*/ 
	if ( request.action == 'get_current_request' ) {
		sendResponse( { current_request : current_game_request[ current_app_id ] } ); 	
		
	} else if ( request.action == 'accept_and_return_response' ) {
		console.log('accept_and_return_response');
		if ( accept_and_return_active == true ) {
			//console.log('accept_and_return_response IS ACTIVE');
			accept_and_return_active = false;
			processed_game_requests_count++; 	
			accept_next();
		}				
	} else if ( request.action == 'get_accept_and_return_active' ) {
		sendResponse( {
			"accept_and_return_active" : accept_and_return_active	
		} );	
	} else if ( request.action == 'abort' ) {
		aborted = true;
	} else if ( request.action == 'goto_game' ) {
		goto_game();
	} else if ( request.action == 'get_status' ) {
		update_status( sendResponse );		
	} else if ( request.action == 'accept_first' ) {
		aborted = false;
		processed_game_requests_count = 0;
		done = false;
		
		accept_next();
	} else if ( request.action == 'accept_next' ) {
		accept_next();
	} else if ( request.action == 'set_accept_options' ) {
		accept_options = request.options;	
	} else if ( request.action == 'activate_accept_all' ) {
		requests_tab = sender.tab;
		
		accept_all( request );
	} else if ( request.action == 'get_handled_app' ) {
		get_handled_app( sendResponse, request.app_id );
	}
	
	sendResponse( {} );
} );

console.log('Background script ended.');