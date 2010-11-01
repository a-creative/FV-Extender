var current_requests;

function serialize_game_request ( DOM_game_request ) {
	var frm = DOM_game_request.find('form');
		
	var action_url = escape(frm.find('input[type="submit"]:first').attr('name'));
	
	var request_id = frm.children('input[name=status_div_id]').val(); 
	var from_id = frm.find('input[name="params\[from_id\]"]').val()
	
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
		 action_url + '='				+ frm.find('input[type="submit"]:first').attr('value'),
		'post_form_id='					+ frm.find('input[name=post_form_id]').val(),
		'fb_dtsg='						+ frm.find('input[name=fb_dtsg]').val()
	];
	
	var ajax_init_data_url = ajax_init_data.join( '&' );	
	
	
	var game_request = {
		"id"			 : request_id,
		"ajax_init_data" : ajax_init_data_url,
		"user_text"		 : DOM_game_request.find('.requestMessage').html(),
		"text"			 : DOM_game_request.find('.requestBody span').html(),
		"action_url"	 : action_url,
		"profile_id"	 : from_id,
		"profile_img"	 : DOM_game_request.find('a.UIImageBlock_SMALL_Image img').attr('src'),
		"profile_name"	 : DOM_game_request.find('.UIImageBlock_SMALL_Content strong a').html()			
	};		
	
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
					
					
					if (!( 
							( game_request[ 'IsNeighborRequest' ] )  
						||  ( game_request[ 'IsShovelRequest' ] )
						|| (
									( game_request['HasUserText'] )
								&&	( game_request['IsSendByFvExtender'] != true )
							)
					)) {
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
			console.log('1: Unexpected');			
		} 
		
		sendResponse( null );
	} else if ( request.action == 'accept_and_return' ) {
		if ( current_requests ) {		
			
			console.log('Find ' + request.request_id );
			console.log('First:' + current_requests[0]['id']);
			jQuery.each( current_requests, function(i, game_request ) {
				
				if ( game_request['id'] == request.request_id ) {
					console.log('found clickable:' + game_request['id'] );
					var status_div = $( '#' + game_request['id'] );
					var frm = status_div.parent();
					var accept_btn = frm.find('input[type="submit"]:first');
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
