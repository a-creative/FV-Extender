function main() {	
	handle_accept_and_return();
	insert_accept_all_button();	
}

function if_not_detected( el, func ) {
	if ( el.attr( 'FV_Extender_detected' ) != 'true' ) {
		el.attr('FV_Extender_detected', 'true' );
		func( el );
	}	
}
function get_handled_app( app_id, callback ) {
	chrome.extension.sendRequest( { action: "get_handled_app", app_id : app_id }, function ( response ) {
		if ( response.app != null ) {
			callback( response.app );	
		}
	} );	
	
}

function handle_accept_and_return() {
	console.log('Is accept and return active?...');
	chrome.extension.sendRequest( { action: "get_accept_and_return_active" }, function( response ) {
		console.log('Is accept and return active: ' + ( response['accept_and_return_active'] == true ? 'yes' : 'no') );
		if ( response['accept_and_return_active'] == true ) {
			console.log('Getting current request...');
			chrome.extension.sendRequest( { action: "get_current_request" }, function( response ) {
				var current_request = response.current_request;
				
				console.log(current_request['id'] +' : Got current request:' + current_request['profile_name'] );
				
				var request_dom = jQuery('#' + current_request['id'] );
				if ( request_dom && request_dom.length ) {
					console.log( current_request['id'] +' : Found request in dom' );
					
					if_not_detected( request_dom, function( request_dom ) {
						console.log(current_request['id'] +' : Clicking it' );
						var frm = request_dom.parent();
						accept_and_return_test( current_request.id, frm, null );
					});
				}
			});	
			
			
			if ( 
						( document.location.href.match( /gifterror=notfound/ ) ) 
					||	( document.location.href.match( /reqType=yes&clickSrc=$/ ) )			
			) {
				document.location.replace( 'http://www.facebook.com/reqs.php' );
			}			
			
			var h1 = jQuery( 'h1' );
			if ( h1 && h1.length ) {
				if ( h1.html().match( /oh no\! It looks like all the bits got lost/ ) ) {
					document.location.replace( 'http://www.facebook.com/reqs.php' );	
				}
			}
			
			ok_btn = jQuery( 'input[value=OK]' );
			if ( ok_btn.length ) {
				if ( document.location.match( /onthefarm/ ) ) {
					if_not_detected( ok_btn, function( ok_btn ) {
						ok_btn.click();
					})
				}
			}					
			
			/*
			// Click button show return gift window
			return_gift_btn = jQuery( 'input[name=send]' );
			if ( return_gift_btn.length ) {
				if ( return_gift_btn.val().match( /thank you/i ) ) {					
					if_not_detected( return_gift_btn, function( return_gift_btn ) {
						return_gift_btn.click();
					} );
				}
			}
			*/
			
			yes_btn = jQuery( 'input[value=Yes]' );
			if ( yes_btn.length ) {
				if_not_detected( yes_btn, function( yes_btn ) {
					/*
					var return_gift_btn_found = false;
					if ( return_gift_btn.length ) {
						if ( return_gift_btn.val().match( /thank you/i ) ) {
							return_gift_btn_found = true;		
						}
					}*/
					
					//if ( !return_gift_btn_found ) {
						yes_btn.click();
					//}
							
				})			
			}
			
			/*
			send_return_gift_btn = jQuery( 'input[name=sendit]' );
			if ( send_return_gift_btn.length ) {
				if_not_detected( send_return_gift_btn, function( send_return_gift_btn ) {
					var msg_box = $('#personal_msg_box');
					if ( msg_box.length ) {
						msg_box.show();	
						var txt_area = msg_box.find('textarea');
						if ( txt_area && txt_area.length ) {
							txt_area.val( 'This gift was returned by FV Extender 3.0(unreleased)' );
						}
					}
					
					send_return_gift_btn.attr( 'fv_extender_handled','true' );	
					send_return_gift_btn.click();					
				});	
			}
			*/
			
			
		}
	});
}

function insert_accept_all_button() {
	
	var request_lists = jQuery("div.mbl");
		
	if( request_lists.length ){		
		
		if (!request_lists) {
			alert('do2');
		}
		request_lists.each( function( i,el ) { 
			
			var request_list = jQuery(el);
			
			// Find requests
			var requests = request_list.find( '> ul > li.uiListItem' );
			
			if ( requests.length ) {
				
				// Find first request	
				var first = requests.first();
				
				// Get app id
				var frm = first.find('form');
				var app_id_el = jQuery(frm).find('input[name=params[app_id]]');
				var app_id;
				if ( app_id_el && app_id_el.length ) {
					app_id = app_id_el.val();
				} 
				
				var action_url = escape(jQuery(frm).find('input[type="submit"]:first').attr('name'));
				
				var list_header = request_list.find('>.uiHeader div div  h3');
					
				// Check if accept all button has not already been added
				if_not_detected( list_header, function( list_header ) {
					
					// Check if app is handles and get app info
					get_handled_app( app_id, function( app ) {
						
						var acceptBtnBg = chrome.extension.getURL('../graphics/acceptAllBtnBg.png'); 
						
						var accept_all_btn = jQuery('<label class="uiButton uiButtonMedium my-accept-all-btn" style="background:url('+acceptBtnBg+')"></label>');
						
						var popup_layer = jQuery('<div class="accept-all-popup" />');
						var btn = jQuery('<input value="Accept all ..." type="button">');
						
						accept_all_btn.append( popup_layer );
						accept_all_btn.append( btn );
						
						var accept_all_info = jQuery('<span class="accept-all-info">Provided by <a href="http://a-creative.github.com/FV-extender/" target="_blank">FV Extender</a></span>');
						
						list_header.css( 'position', 'relative' )
						
						list_header.append( accept_all_btn );
						list_header.append( accept_all_info );
						
						
						
						
						accept_all_btn.find('input').click( function( evt ) {
							var wnd_x = accept_all_btn.offset().left - 100;
							var wnd_y = accept_all_btn.offset().top + 150;
							
							
							accept_all_btn_click( app, requests, wnd_x, wnd_y );	
						});
					});
				});
			}			
		} );		
	}

}

function get_requests_data( DOM_requests ) {
	var requests = new Array();
	
	var request;
	
	if (!DOM_requests) {
		alert('do1');
	}
	
	DOM_requests.each( function() {
		var frm = $(this).find('form');
	
		var action_url = escape($(frm).find('input[type="submit"]:first').attr('name'));
		
		var request_id = $(frm).children('input[name=status_div_id]').val(); 
		var from_id = $(frm).find('input[name="params\[from_id\]"]').val()
		
		var ajax_init_data = [
			'charset_test='					+ $(frm).children('input[name=charset_test]').val(),
			'id='							+ $(frm).children('input[name=id]').val(),
			'type='							+ $(frm).children('input[name=type]').val(),
			'status_div_id='				+ request_id,
			'params[from_id]='				+ from_id,
			'params[app_id]='				+ '102452128776',
			'params[req_type]='				+ $(frm).find('input[name="params\[req_type\]"]').val(),
			'params[is_invite]='			+ $(frm).find('input[name="params\[is_invite\]"]').val(),
			'lsd',
			'post_form_id_source='			+ 'AsyncRequest',
			 action_url + '='				+ $(frm).find('input[type="submit"]:first').attr('value'),
			'post_form_id='					+ $(frm).find('input[name=post_form_id]').val(),
			'fb_dtsg='						+ $(frm).find('input[name=fb_dtsg]').val()
		];
		
		var ajax_init_data_url = ajax_init_data.join( '&' );	
		
		
		request = {
			"id"			 : request_id,
			"ajax_init_data" : ajax_init_data_url,
			"user_text"		 : $(this).find('.requestMessage').html(),
			"text"			 : $(this).find('.requestBody span').html(),
			"action_url"	 : action_url,
			"profile_id"	 : from_id,
			"profile_img"	 : $(this).find('a.UIImageBlock_SMALL_Image img').attr('src'),
			"profile_name"	 : $(this).find('.UIImageBlock_SMALL_Content strong a').html()			
		};
		
		requests.push( request );
		
	})	
	return requests;
}

function accept_all_btn_click( app, DOM_requests, wnd_x, wnd_y ) {
	
	current_requests = DOM_requests; 
	
	var requests = get_requests_data( DOM_requests );
	
	chrome.extension.sendRequest( { action: "activate_accept_all", requests: requests, app: app, wnd_x : wnd_x, wnd_y : wnd_y } );
}
