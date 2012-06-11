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
	if ( (!flash_iframe) || ( flash_iframe.length == 0 ) ) {
		flash_iframe = jQuery("iframe[name='flashAppIframe']");
		
		if ( (!flash_iframe) || ( flash_iframe.length == 0 ) ) {
			flash_iframe = jQuery("iframe[id='flashAppIframe']");
		}
	}
	
	if ( flash_iframe && flash_iframe.length ) {
		if_not_detected( flash_iframe, function( flash_iframe ) {
			state = 3;
			state_text = 'Request accepted!(by Farm show)';
			chrome.extension.sendRequest( { "action" : "finish_current_id", state: state, state_text: state_text }, function() {
				redirect();
			} );
		} );
	}
	
	
	
	// Detect yes button
	var yes_btn = jQuery( "input[value='Yes']");
	if ( yes_btn.length ) {
		
		if_not_detected( yes_btn, function( yes_btn ) {
			
			state = 3;
			state_text = 'Request accepted!( by YES button)';
			chrome.extension.sendRequest( { "action" : "finish_current_id", state: state, state_text: state_text }, function() {				
				redirect();
			} );
		} );
	} 
	
	// Detect play farmville
	var play_btn = jQuery( "input[value='Play FarmVille']");
	if ( play_btn.length == 0 ) {
		play_btn = jQuery( "input[value='Play FarmVille!']");
	}
	
	if ( play_btn.length  ) {
		if_not_detected( play_btn, function( play_btn ) {
			state = 3;
			state_text = 'Request accepted!(by Play button)';
			chrome.extension.sendRequest( { "action" : "finish_current_id", state: state, state_text: state_text }, function() {
				redirect();
			} );
		} );
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
		if ( ( document.location.href.match( /sentthankyougift\.php/ ) ) || ( document.location.href.match( /redirecting_zy_session_expired\=1/ ) ) ) {
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

