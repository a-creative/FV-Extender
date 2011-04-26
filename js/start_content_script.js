var current_requests;

function serialize_game_request ( DOM_game_request ) {
	
	var frm = DOM_game_request.find('form');
	
	var accept_btn_el = frm.find( 'input[name^="' + 'actions[http' + '"]' );
	
	var action_url = escape( accept_btn_el.attr('name') );
	
	var request_id = frm.children('input[name=status_div_id]').val(); 
	var from_id = frm.find('input[name="params\[from_id\]"]').val()
	
		
		
	// Find user text
	var matches;	
	var user_text = '';	
	if ( matches = DOM_game_request.html().match( /<div><strong>([^<]+)<\/strong><\/div>/ ) ) {
		user_text = matches[ 1 ];
	} 
	
	// Find text
	var text = '';
	var text_el = DOM_game_request.find('.appRequestBodyNewB' );
	
	if ( ! ( text_el && text_el.length ) ) {
		text_el = DOM_game_request.find('.appRequestBodyNewA' );
		
		if ( ! ( text_el && text_el.length ) ) {
			text_el = DOM_game_request.find('.streamStyleRequestBody, .appRequestBody');
		} 
	}
	
	if ( text_el && text_el.length ) {
		
		var text_el_cnt =  text_el.find('span');
		
		if ( text_el_cnt && text_el_cnt.length ) {
			text = text_el_cnt.html();
		} else {
			text = text_el.html();
		}
	}
	
	var action_param_value = '';
	
	if ( text == 'This request has expired.' ) {
		action_url = 'actions[reject]';
		action_param_value = '';
		
	} else {
		action_param_value = accept_btn_el.attr( 'value' );
	}
	
	var ajax_init_data = [
		'charset_test='					+ frm.children('input[name=charset_test]').val(),
		'id='							+ frm.children('input[name=id]').val(),
		'type='							+ frm.children('input[name=type]').val(),
		'status_div_id='				+ request_id,
		'params[from_id]='				+ from_id,
		'params[app_id]='				+ '102452128776',
		'params[req_type]='				+ frm.find('input[name="params\[req_type\]"]').val(),
		'params[is_invite]='			+ frm.find('input[name="params\[is_invite\]"]').val(),
		'lsd',
		'post_form_id_source='			+ 'AsyncRequest',
		 action_url 					+ '=' + action_param_value,
		'post_form_id='					+ frm.find('input[name=post_form_id]').val(),
		'fb_dtsg='						+ frm.find('input[name=fb_dtsg]').val()
	];
	
	var ajax_init_data_url = ajax_init_data.join( '&' );
	
	var game_request = {
		"id"			 : request_id,
		"ajax_init_data" : ajax_init_data_url,
		"user_text"		 : user_text,
		"text"			 : text,
		"action_url"	 : action_url,
		"profile_id"	 : from_id
		/*		
		"profile_img"	 : DOM_game_request.find('a.UIImageBlock_SMALL_Image img').attr('src'),
		"profile_name"	 : DOM_game_request.find('.UIImageBlock_SMALL_Content strong a').html()
		*/
	};
	
	/*
	console.log('\n');
	for ( var key in game_request ) {
		console.log( key + ':' + game_request[ key ] );
	}
	*/
	
	return ( game_request );
}

chrome.extension.onRequest.addListener( function(request, sender, sendResponse) {

	if ( request.action == 'get_next_request' ) {
		// Get first of non-skiped game requests from frontend
		
		if ( current_requests ) {
			if ( current_requests.length ) {
				
				// If there is still game requests to proces
				
				// Remove game requests that should be skipped.
				var temp_requests = new Array();
				jQuery.each( current_requests,  function( i, game_request ) {
					
					// Add group info
					game_request = group_request( game_request );
					
					if ( ( request.accept_mode == 'JUST_HELP' ) && ( game_request[ 'IsMaterialRequest' ] || game_request[ 'IsMaterialRequestManual' ] ) ) {
						temp_requests.push( game_request );
					} else if ((!( 
							( game_request[ 'IsNeighborRequest' ] && ( !request.options[ 'auto-accept-friend-requests' ] ) )  
						||  ( game_request[ 'IsShovelRequest' ] )
						|| (
									( game_request['HasUserText'] )
								&&	( !request.options[ 'ignore-user-messages' ] )
								&&	( game_request['IsSendByFvExtender'] != true )
							)
					)) && ( request.accept_mode != 'JUST_HELP' ) )  {
						temp_requests.push( game_request );
					}	
				});
				
				current_requests = temp_requests;				
				
				// If there is still game request left after skipping				
				if ( current_requests.length ) {
					
					// Return the first game request
					sendResponse( { game_request: current_requests[ 0 ], more_after_this: ( current_requests.length > 1 ) } );	
				} else {
					
					// Return null to stop processing of game requetss
					sendResponse( { game_request: null, more_after_this: false } );	
				}
					
			} else {		
				
				// There is no more game request, and processing should stop.
				sendResponse( { game_request: null, more_after_this: false } );	
			}
		} else {
			sendResponse( { game_request: null, more_after_this: false, aborted: true, abort_info_id: 'ERROR_1' } );			
		} 
		
		
	} else if ( request.action == 'accept_and_return' ) {
		if ( current_requests ) {		
			
			console.log('Find ' + request.request_id );
			console.log('First:' + current_requests[0]['id']);
			jQuery.each( current_requests, function(i, game_request ) {
				
				if ( game_request['id'] == request.request_id ) {
					var status_div = $( '#' + game_request['id'] );
					var frm = status_div.parent();
					var accept_btn = frm.find( 'input[name^="' + 'actions[http' + '"]' );;
					
					accept_btn.click();
					return false;
				}
			});	
		} 
	} else if ( request.action == 'remove_request' ) {
		
		// Remove request from UI
		var status_div = $( '#' + request.request_id );
		
		var frm = status_div.parent();
		var request_div = frm.parent();
		
		request_div.remove();
		
		// Remove request memory
		var temp_requests = new Array();
		jQuery.each( current_requests, function( i, game_request ) {
			if ( game_request['id'] != request.request_id ) {
				temp_requests.push( game_request );
			}
		} );
		
		current_requests = temp_requests;
		
		sendResponse( {} );
	}	
});

$(document).ready( function() {
	
	
	function callLast(func, t){
		if(!t){ t = 100; }
		var callLastTimeout = null; 
		return function(){
			if(callLastTimeout!==null){
				window.clearTimeout(callLastTimeout); 
			}
			callLastTimeout = window.setTimeout(function(){ callLastTimeout = null; func(); }, t);
		};
	}
	
	run();
	
	function run(){		
		function work(){
			removeWorker();
			main();
			addWorker();
		}
	
		var workLast = callLast(work);
		function addWorker(){       document.addEventListener("DOMSubtreeModified", workLast, false); }
		function removeWorker(){ document.removeEventListener("DOMSubtreeModified", workLast, false); } 
		function startWork(){ addWorker(); workLast(); }
	
		startWork();
	}
});
