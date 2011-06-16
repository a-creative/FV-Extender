var current_requests;

function serialize_game_request ( DOM_game_request ) {
	
	/*
	var frm_test_html = '<div><form rel="async" action="/ajax/games/apprequest/apprequest.php" method="post" data-gt="{&quot;ref&quot;:&quot;app_request_2&quot;,&quot;type&quot;:&quot;click2canvas&quot;}" style="grouped" onsubmit="return Event.__inlineSubmit(this,event)"><input type="hidden" name="charset_test" value="€,´,€,´,?,?,?"><input type="hidden" autocomplete="off" name="post_form_id" value="6763ac3a5e43cf62a230cb09d0a15e40"><input type="hidden" name="fb_dtsg" value="AQDsAt3T" autocomplete="off"><input id="id" name="id" value="217331051625362" autocomplete="off" type="hidden"><input id="params[from_id]" name="params[from_id]" value="100001654984932" autocomplete="off" type="hidden"><input id="params[app_id]" name="params[app_id]" value="131704200228509" autocomplete="off" type="hidden"><input id="div_id" name="div_id" value="app_131704200228509_217331051625362" autocomplete="off" type="hidden"><div id="app_131704200228509_217331051625362" class="appRequest"><div class="UIImageBlock clearfix"><a class="uiTooltip UIImageBlock_Image UIImageBlock_SMALL_Image" href="http://www.facebook.com/profile.php?id=100001654984932" tabindex="-1"><img class="uiProfilePhoto uiProfilePhotoMedium img" src="http://profile.ak.fbcdn.net/hprofile-ak-snc4/161349_100001654984932_3430976_q.jpg" alt=""><span class="uiTooltipWrap top left lefttop"><span class="uiTooltipText uiTooltipNoWrap">Hope Gomez</span></span></a><ul class="uiList uiListHorizontal clearfix UIImageBlock_Ext"><li class="uiListItem  uiListHorizontalItemBorder uiListHorizontalItem"><label class="uiButton uiButtonConfirm" for="u261541_8"><input value="Accept" type="submit" name="actions[accept]" data-gt="{&quot;appid&quot;:131704200228509}" id="u261541_8"></label></li><li class="pls uiListItem  uiListHorizontalItemBorder uiListHorizontalItem"><label class="uiButton uiButtonNoText" for="u261541_9"><i style="width:9px;height:13px" class="mrs closeButton customimg img sp_3czees sx_2a6214"></i><input value="" type="submit" name="actions[reject]" id="u261541_9"></label></li></ul><div class="UIImageBlock_Content UIImageBlock_SMALL_Content"><div class="pts prs appRequestBodyNewA">Check out this hot look in FASHION DESIGNER!</div></div></div></div></form></div>';
	var frm_test_el = $(frm_test_html);
	DOM_game_request = frm_test_el; 
	*/
	
	// Get request form
	var frm = DOM_game_request.find('form');
	
	var script_url = frm.attr('action');	
	
	// Get action url
	var action_url_el = frm.find( 'input[name^="' + 'actions[http' + '"]' );
	var action_url = escape( action_url_el.attr('name') );
	
	// Record if action url is not found
	var no_action_url = false;
	if ( action_url === 'undefined' ) {
		no_action_url = true;
	}
	
	// Get id of the request (unique to the app )	
	var request_id;
	var new_request_id = frm.children('input[name=request_id]');
	var old_request_id = frm.children('input[name=id]');	
	var old_request;
	if ( new_request_id.length ) {
		
		old_request = false;
		request_id = new_request_id.val();
	} else {
		
		old_request = true;
		request_id = old_request_id.val();
	}
	
	/* Get from id */
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
	
	// Find accept button
	var accept_btn_el = frm.find('input[type="submit"]:first');
	
	// Check for expired text
	var action_param_value = '';
	if ( text == 'This request has expired.' ) {
		
		// Reject action if expired text
		action_url = 'actions[reject]';
		action_param_value = '';
		
	} else {
		action_param_value = accept_btn_el.attr( 'value' );
	}
	
	var ajax_init_data;
	var unique_request_id;
	
	var reg_type;
	if ( no_action_url ) {
		reg_type = "C";
		unique_request_id = frm.children('input[name=div_id]').val();
				
		if ( action_url === 'undefined' ) {
			action_url = 'actions[accept]';	
		} 
		
		ajax_init_data = [
			'charset_test='					+ frm.children('input[name=charset_test]').val(),
			'post_form_id='					+ frm.find('input[name=post_form_id]').val(),
			'fb_dtsg='						+ frm.find('input[name=fb_dtsg]').val(),
			'id='							+ request_id,
			'params[from_id]='				+ from_id,
			'params[app_id]='				+ '102452128776',
			'div_id='						+ unique_request_id,
			 action_url 					+ '=' + action_param_value,
			'lsd',
			'post_form_id_source='			+ 'AsyncRequest',
		];	
		
	} else if ( old_request ) {
		unique_request_id = frm.children('input[name=status_div_id]').val();
		reg_type = "A";
		
		ajax_init_data = [
			'charset_test='					+ frm.children('input[name=charset_test]').val(),
			'id='							+ request_id,
			'type='							+ frm.children('input[name=type]').val(),
			'status_div_id='				+ unique_request_id,
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
		
	} else {
		unique_request_id = frm.children('input[name=status_div_id]').val();
		reg_type = "B";
		
		ajax_init_data = [
			'charset_test='					+ frm.children('input[name=charset_test]').val(),
			'post_form_id='					+ frm.find('input[name=post_form_id]').val(),
			'fb_dtsg='						+ frm.find('input[name=fb_dtsg]').val(),
			'request_id='					+ request_id,
			'type='							+ frm.children('input[name=type]').val(),
			'status_div_id='				+ unique_request_id,
			'params[from_id]='				+ from_id,
			'params[app_id]='				+ '102452128776',
			'params[req_type]='				+ frm.find('input[name="params\[req_type\]"]').val(),
			'params[is_invite]='			+ frm.find('input[name="params\[is_invite\]"]').val(),
			 action_url 					+ '=' + action_param_value,
			'lsd',
			'post_form_id_source='			+ 'AsyncRequest',
		];
	}
	
	var ajax_init_data_url = ajax_init_data.join( '&' );
	console.log( reg_type + ' >>> ' + unique_request_id + ' >>> ' + ajax_init_data_url + '\n\n');
	
	var game_request = {
		"id"			 : unique_request_id,
		"ajax_init_data" : ajax_init_data_url,
		"user_text"		 : user_text,
		"text"			 : text,
		"action_url"	 : action_url,
		"profile_id"	 : from_id,
		"no_action_url"  : no_action_url,
		"script_url"	 : script_url
		/*		
		"profile_img"	 : DOM_game_request.find('a.UIImageBlock_SMALL_Image img').attr('src'),
		"profile_name"	 : DOM_game_request.find('.UIImageBlock_SMALL_Content strong a').html()
		*/
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
