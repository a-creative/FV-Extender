var current_requests;


function group_request( request ) {
	var matches;
	if ( matches = request['action_url'].match( /&gift=([^&]+)&/i ) ) {
		request.gift_id = matches[ 0 ];
	}	
	
	// Is seed
	if ( ( request.gift_id ) && ( request.gift_id.match( /seedpackage$/ ) ) ) {
		request[ 'IsSeed' ] = true;	
	}
	
	// It thank you gift
	if ( request['text'] && request['text'].match( /^Thank you for your gift/i ) ) {
		request[ 'IsThankYouGift' ] = true;
	}
	
	// Is material request		
	if ( request['action_url'] && request['action_url'].match( /sendmats\.php/ ) ) {
		request[ 'IsMaterialRequest' ] = true;
	}
	
	// Is one way gift
	if ( request['text'] && request['text'].match( /(?:don\'t|do not) (?:resend|send back)/ ) ) {
		request[ 'IsOneWayGift' ] = true;
	} 
	
	// Is shovel request
	if ( request['text'] && request['text'].match( /collecting Shovels in FarmVille/ ) ) {
		request[ 'IsShovelRequest' ] = true;
	} 
	
	// Is neigbor request
	if ( request['action_url'] && request['action_url'].match( /addneighbor\.php/ ) ) {
		request[ 'IsNeighborRequest' ] = true;	
	}
	
	// Has user text
	if ( request['user_text'] && request['user_text'] != '' ) {
		request[ 'HasUserText' ] = true;	
	} 
	
	// Is send by FV extender
	if ( request['user_text'] && request['user_text'].match( /This gift was returned by FV Extender/ ) ) {
		request[ 'IsSendByFvExtender' ] = true;				  
	}
	
	// Is bushel
	if ( request['action_url'] && request['action_url'].match( /gift_accept_crafting_ask_for_bushels/ ) ) {
		request[ 'IsBushel' ] = true;	
	}		
	
	return request;
}

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


function accept_and_return_test( game_request ) {
	var cand_request_id = $(request_form).children('input[name=status_div_id]').val(); 		
	if ( request_id == cand_request_id ) {
		var accept_btn = $(request_form).find('input[type="submit"]:first');
		
		if ( sendResponse ) {
			sendResponse( {} );
		}
		
		//accept_btn.click();
		return false;
	} else {
		return true;
	}	
}

chrome.extension.onRequest.addListener( function(request, sender, sendResponse) {
	if ( request.action == 'get_next_request' ) {
		if ( current_requests ) {
			if ( current_requests.length ) {
				var temp_requests = new Array();
				jQuery.each( current_requests,  function( i, el ) {
					el = group_request( el );
					
					
					if (!( 
							( el[ 'IsNeighborRequest' ] )  
										||  ( el[ 'IsShovelRequest' ] )
										|| (
												( el['HasUserText'] )
											&&	( el['IsSendByFvExtender'] != true )
										)
					)) {
						temp_requests.push( el );
					}		
				});
				
				current_requests = temp_requests;				
				
				
				if ( current_requests.length ) {
					sendResponse( current_requests[ 0 ] );	
				} else {
					sendResponse( null );	
				}
				
				/*
				chrome.extension.sendRequest( { action : "filter_skipped", requests: current_requests }, function( response ){
					current_requests = response.requests;
					sendResponse( current_requests.shift() );	
				});
				*/
					
			} else {
				sendResponse( null );
			}
		} 
		
		sendResponse( {} );
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
		var status_div = $( '#' + request.request_id );
		var frm = status_div.parent();
		var request_div = frm.parent();
		request_div.remove();
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



















