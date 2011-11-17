var FVE_version = getVersion();

var processing = false;
var app_requests = {};
var processed_ids = [];
var weekly_test = false;

var current_id = -1;
var main_tab_id = -1;
var just_help = false;
var hang_timer_id;

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

function getVersion() {
	
	var xhr = new XMLHttpRequest();
	
	var manifest;
	if ( xhr ) {
		xhr.open('GET', chrome.extension.getURL('manifest.json'), false);
		xhr.send(null);
		try {
			manifest = JSON.parse( xhr.responseText );
		} catch( e ) {			
			log_error( e.message );
		}
	}
		
	if ( manifest && manifest.version ) {
		return manifest.version;
	} else {
		return ( 'Could not detect version' );
	}
	
}

function _twitterSuccess( callback, tweets ) {
	var found = false;
			
	// On success
	var posts_parts = [];
	for ( var i = 0; i < tweets.length; i++ ) {
		var text = tweets[ i ].text;
		
		
			
		var matches = text.match( /^(\d+\.\d+\.\d+)/);
		if ( matches ) {
			
			//text = '3.1.1: A few bugs less, more stability and sound #instant-update. http://t.co/hKZ9FyqX';
			
			var manual_update = true;
			var update_url = '';
			if ( text.indexOf( '#instant-update' ) != -1 ) {
				manual_update = false;
				update_url = 'http://a-creative.github.com/FV-extender/versions/release_current.crx?timestamp=' + new Date().getTime();
			} else {
			
				var link_matches = text.match( /(http\:\/{2}[^\s]+)/ );
				if ( link_matches ) {
					update_url = link_matches[ 1 ];
				} 
			}
			
			callback( { version: matches[ 1 ], manual_update: manual_update, url: update_url } );
			found = true;
			break;
		}
	}
	
	if ( !found ) {
		callback( false );
	}	
}

function getLatestVersion( callback ) {
	
	
	// Load blog updates		
	var screen_name = 'fv_extender';	
	
	$.ajax({
		url: "http://api.twitter.com/1/statuses/user_timeline.json",
		dataType: 'json',
		data: "screen_name=" + screen_name + "&count=3&callback=?",
		success: function( tweets ) {
			_twitterSuccess( callback, tweets )
		},
		error: function() {
			callback( false );
		}
	}).error( function() {
		callback( false );
	} );
			
}

function version_str_to_int( version_str ) {
	
	var version_p = version_str.split( '.' );

	var version_int =
			parseInt( version_p[ 0 ] ) * 100
		+	parseInt( version_p[ 1 ] ) * 10
		+   parseInt( version_p[ 2 ] ) * 1;
	
	return ( version_int );
}

function checkForUpdates( callback ) {
	
	getLatestVersion( function( latest_version ) {
		
		if ( latest_version ) {
			
			if ( latest_version.version != FVE_version ) {
				if ( version_str_to_int( latest_version.version ) > version_str_to_int( FVE_version ) ) {
					
					callback( latest_version );
				} else {
					callback( false );	
				}
			
			} else {
				callback( false );	
			}
		} else {
			callback( false );
		}
		
	} );
}




// Reaction to events
chrome.extension.onRequest.addListener( function( request, sender, sendResponse) {
	
	//console.log( 'Action requested:' + request.action );
	
	if ( request.action == 'get_options' ) {		
		
		options.just_help = just_help;
		options.weekly_test = weekly_test;
		
		sendResponse( options );
		
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
		
		console.log( request.state + ' - ' + request.state_text );
		
		
		try {
			app_requests[ current_id ].state = request.state;
			app_requests[ current_id ].state_text = request.state_text;
		} catch( err ) {
			console.log( 'Could not find request: ' + current_id + ':' + app_requests[ current_id ] );
		}
		
		processed_ids.push( current_id );
		if ( processed_ids.length > 20 ) {
			processed_ids.shift();
		}
		
		current_id = -1;
		
		sendResponse( true );
	} else if ( request.action == 'set_current_id' ) {
		current_id = request.current_id;
		
		app_requests[ current_id ] = {
			id: current_id,
			item_name: request.current_item_name,
			text: request.current_text
		};
		
		sendResponse( current_id );
	} else if ( request.action == 'update_badge_text' ) {
		chrome.browserAction.setBadgeText( { text : request.count + "" } );
		sendResponse();
		
	} else if ( request.action == 'handle_result_page' ) {
		
		sendResponse( ( processing == true ) && ( main_tab_id == sender.tab.id ) );
	} else if ( request.action == 'check_for_hang' ) {
		
		console.log( 'Starting ext. hang check...' );
		hang_timer_id = setTimeout( function() {			
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
	} else if ( request.action == 'reset_hang_check' ) {
		console.log( 'Starting int. hang check ...' );		
		
		if ( hang_timer_id ) {
			console.log( 'Resetting ext. hang check ...' );
			clearTimeout( hang_timer_id );
		}
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