var processing = false;
var processed_ids = [];
var current_id = -1;
var main_tab_id = -1;
var just_help = false;

var options = {
	audio_enabled : true,
};

// Create audio
var done_audio = document.createElement("audio");
done_audio.src = "../sound/cow.ogg";

var info_audio = document.createElement("audio");
info_audio.src = "../sound/info.ogg";


var ga_iframe;
jQuery(document).ready( function() {
	
	// Create iframe for google analytics
	ga_iframe = document.body.appendChild(document.createElement('iframe'));	
} );

function query_GA() {
	ga_iframe.src = 'http://a-creative.dk/wp/stats_31.html';
}


// Reaction to events
chrome.extension.onRequest.addListener( function( request, sender, sendResponse) {
	
	//console.log( 'Action requested:' + request.action );
	
	if ( request.action == 'get_options' ) {		
		
		options.just_help = just_help;
		
		sendResponse( options );
		
	} else if ( request.action == 'init_process_requests' ) {
		processing = true;
		sendResponse( processing );
	} else if ( request.action == 'is_processing' ) {
		sendResponse( processing );	
	} else if ( request.action == 'stop_processing' ) {
		processing = false;
		current_id = -1;	
		
		chrome.browserAction.setBadgeText( { text : "" } );
		
		if ( options.audio_enabled ) {
			done_audio.play();
		}
		
		query_GA();
		
		sendResponse( request );		
	} else if ( request.action == 'get_processed_ids' ) {
		sendResponse( processed_ids );
	} else if ( request.action == 'add_processed_id' ) {
		
		processed_ids.push( request.processed_id );
		if ( processed_ids.length > 20 ) {
			processed_ids.shift();
		}
		
		sendResponse( request.processed_id );
	} else if ( request.action == 'finish_current_id' ) {
		
		console.log( request.state + ':' + request.state_text );
		
		processed_ids.push( current_id );
		if ( processed_ids.length > 20 ) {
			processed_ids.shift();
		}
		
		current_id = -1;
		
		sendResponse( true );
	} else if ( request.action == 'set_current_id' ) {
		current_id = request.current_id;
		sendResponse( current_id );
	} else if ( request.action == 'update_badge_text' ) {
		chrome.browserAction.setBadgeText( { text : request.count + "" } );
		sendResponse();
		
	} else if ( request.action == 'handle_result_page' ) {
		
		sendResponse( ( processing == true ) && ( main_tab_id == sender.tab.id ) );
	} else if ( request.action == 'check_for_hang' ) {
		
		setTimeout( function() {			
		
			if ( request.app_request_id == current_id ) {
				console.log( 'Hang on id:' + request.app_request_id + '. Reloading main tab...' );
				
				// Reload main tab
				chrome.tabs.get( main_tab_id, function( tab ) {
					chrome.tabs.update( tab.id, { url: tab.url } );
				} );
				
			} else {
				console.log( 'NO hang on id: ' + request.app_request_id )
			}
		}, 10000 );
		
		sendResponse( true );
	}
	
	
	
} );

function goto_requests() {
	chrome.windows.getCurrent( function( wnd ) {
		
		chrome.tabs.getAllInWindow( wnd.id, function( tabs ) {
			var found_tab;
			
			jQuery.each( tabs, function( i, tab ) {
				
				if ( tab.url.toLowerCase().match('reqs.php' ) ) {
					found_tab = tab;
					return false;
				}
				
				return true;
			} );
			
			if ( found_tab ) {
				main_tab_id = found_tab.id;
				chrome.tabs.update( 
					found_tab.id, {
						url: found_tab.url,
						selected: true	
					}
				);
			} else {
				chrome.tabs.create(
					{
						"windowId" : wnd.id,
						"url" : 'http://www.facebook.com/reqs.php'
					}, function( tab ) {
						main_tab_id = tab.id
					}
				);							
			}							
		});	
	} );	
}