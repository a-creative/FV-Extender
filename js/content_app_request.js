var handled = false;
var state = -1;
var state_text;

var return_gift_message = '';

chrome.extension.sendRequest( { "action" : "get_return_gift_message" }, function( my_return_gift_message ) {
	return_gift_message = my_return_gift_message;
} );

// Detect changes by live content
function changes_detected() {
	
	console.log( 'Detects changes for game...');
	
	// Detect try again
	
	var try_again_btn = jQuery( "input[name='try_again_button']" );
	if ( try_again_btn && try_again_btn.length ) {
		if_not_detected( try_again_btn, function(try_again_btn ) {
			try_again_btn.click();
		} );
	}
	
	// Detect and react to "angry cow" error
	var h1 = jQuery( 'h1' );
	if ( h1 && h1.length && h1.html().match( /Oh no/i ) ) {
		if_not_detected( h1, function( h1 ) {
			
			document.location.reload();
			
		} );
	}
	
	if ( h1 && h1.length && h1.html().match( /Select which reward you/ ) ) {
		if_not_detected( h1, function( h1 ) {
			state = 3;
			state_text = 'Request accepted!(by select reward)';
			chrome.extension.sendRequest( { "action" : "finish_current_id", state: state, state_text: state_text }, function() {
				redirect();
			} );
			
		} );
	}
	
	if ( h1 && h1.length && h1.html().match( /Select which reward you/ ) ) {
		redirect();
	}
	
	// Detect ok
	var ok_btn = jQuery("input[value='OK']");
	if ( ok_btn.length ) {
		if_not_detected( ok_btn, function( ok_btn ) {
			state = 3;
			state_text = 'Request accepted!(by OK button)';
			chrome.extension.sendRequest( { "action" : "finish_current_id", state: state, state_text: state_text }, function() {
				redirect();
			} );
		} );
	}
	
	// Detect flash
	var flash_iframe = jQuery("iframe[id='farmvilleIframe']");
	if ( flash_iframe.length ) {
		if_not_detected( flash_iframe, function( flash_iframe ) {
			state = 3;
			state_text = 'Request accepted!(by Farm show)';
			chrome.extension.sendRequest( { "action" : "finish_current_id", state: state, state_text: state_text }, function() {
				redirect();
			} );
		} );
	}
	
	
	
	// Detect yes button
	var h3_help = jQuery("h3:contains('Materials sent')");
	var h3_help_2 = jQuery("h3:contains('Sorry')");
	var askMore_text_el = jQuery("div[class='askMore_text']");
	
	var yes_btn = jQuery( "input[value='Yes']");
	if ( yes_btn.length && ( ( !document.location.href.match( /\/?request_ids=/ ) ) || h3_help.length || h3_help_2.length || askMore_text_el.length ) ) {
		
		if_not_detected( yes_btn, function( yes_btn ) {
			
			if ( !document.location.href.match( /\/?request_ids=/ ) ) {
				
				chrome.extension.sendRequest( { "action" : "reset_hang_check" } );
				
				setTimeout( function() {
					if (!handled) {
						
						state = 3;
						state_text = 'Request accepted!( by YES button on gift returned)';
						chrome.extension.sendRequest( { "action" : "finish_current_id", state: state, state_text: state_text }, function() {
							redirect();
						} );	
					}
				}, 7000);
			} else {
			
				state = 3;
				state_text = 'Request accepted!( by YES button)';
				chrome.extension.sendRequest( { "action" : "finish_current_id", state: state, state_text: state_text }, function() {
					
					redirect();
				} );
			}
		} );
	} 
	
	// Detect play farmville
	var play_btn = jQuery( "input[value='Play FarmVille']");
	if ( play_btn.length ) {
		if_not_detected( play_btn, function( play_btn ) {
			state = 3;
			state_text = 'Request accepted!(by Play button)';
			chrome.extension.sendRequest( { "action" : "finish_current_id", state: state, state_text: state_text }, function() {
				redirect();
			} );
		} );
	}
	
	// Detect and click on return gift button
	var return_gift_btn = jQuery( 'input[name=send]' );
	if ( return_gift_btn.length ) {
		console.log( 'Found gift back button');
		
		if ( return_gift_btn.val().match( /thank you/i ) ) {					
			console.log( 'Found gift back button text ');
			
			if_not_detected( return_gift_btn, function( return_gift_btn ) {
				
				console.log( 'Just before clicking the SHOW SEND button.');
				
				// If so click button to show return gift window
				return_gift_btn.click();
			} );
		}
	}
	
	// Handle out of requests error
	
	// Detect text field for return gift message
	var msg_box = $('#personal_msg_box textarea');
	var send_return_gift_btn = jQuery( 'input[name=sendit]' );
	if ( ( send_return_gift_btn.length ) && ( msg_box.length) ) {
		if_not_detected( send_return_gift_btn, function( send_return_gift_btn ) {
			if_not_detected( msg_box, function( msg_box ) {
				msg_box.val( return_gift_message );
				send_return_gift_btn.click();
			});
		});	
	}	
}

function redirect() {
	
	chrome.extension.sendRequest( { "action" : "games_redirect" } );
}

// Check if this is the main tab and that processing is true
chrome.extension.sendRequest( { "action" : "handle_result_page" }, function( handle_result_page ) {

	if ( !handle_result_page ) {
		
		// Don't handle this
		
		// Do nothing
		// And set as handled to avoid detection of changes part 
		handled = true;
		console.log( 'FVE didn\'t handle this:' + document.location.href );
		
	} else {
		
		// Handle this
		console.log( 'FVE is handling this: ' + document.location.href );	
		
		// Detect changes by url
		if ( document.location.href.match( /gifterror=notfound/ ) ) { state = 6; state_text = "Gift not found" };
		if ( document.location.href.match( /gifterror=invalid/ ) ) { state = 7; state_text = "Gift was invalid" };
		if ( document.location.href.match( /reqType=yes&clickSrc=$/ ) ) { state = 6; state_text = "Other error(1)" };
		if ( document.location.href.match( /toolbar\.zynga\.com/i ) ) { state = 6; state_text = "Other error(2)" };
		if ( document.location.href.match( /sentthankyougift\.php/ ) ) {
			state = 3; state_text = 'Request accepted!(with thankyou gift)';
		}
		if ( document.location.href.match( /sendcredits\.php/ ) ) {
			state = 3; state_text = 'Help request accepted!';
		}
		if ( state != -1 ) {
			handled = true;
			
			state_text += ', url( ' + document.location.href + ')';
			
			console.log( 'Initiates finish by url:' +  state_text + ' ( ' + state + ' ) '  );
			
			chrome.extension.sendRequest( { "action" : "finish_current_id", state: state, state_text: state_text }, function() {
				redirect();
			} );			
		}
		
		// Detect changes by html
		
		// Detect live changes in html
		if (!handled) {
			run_detect_changes();
		}
		
	}
} );

