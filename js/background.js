var FVE_version = getVersion();

var processing = false;
var app_requests = {};
var processed_ids = {};

var weekly_test = 0;
var weekly_test_stop_at = '';

var current_id = -1;
var main_tab_id = -1;
var just_help = false;
var hang_check = true;
var hang_timer_id;
var list_reload_index = 0;
var listLoadId = 0;

var options = {};
var settings = {}

var app_settings = {};

var setting_defaults = {
	"audio_enabled" : "1",
	"returnGiftMessage"  : "",
	"rejectGifts" : false,
	"rejectNeighbors" : false
}

// Create audio
var done_audio = document.createElement("audio");
done_audio.src = "../sound/cow.ogg";

var info_audio = document.createElement("audio");
info_audio.src = "../sound/info.ogg";


var ga_iframe;
jQuery(document).ready( function() {
	
	if ( weekly_test === 1 ) {
		alert( 'Test enabled:' + weekly_test_stop_at );
	}
	
	loadSettings();
	
	// Init. app settings with FV enabled
	var apps = localStorage[ 'apps' ];
	
	if ( ( apps === null ) || ( typeof apps === 'undefined' ) ){
		
				
		
		localStorage['apps'] = "";
		setAppSetting( 102452128776, -1, true );
		
	}
	
	loadAppSettings();
	
	// Create iframe for google analytics
	ga_iframe = document.body.appendChild(document.createElement('iframe'));	
} );

function query_GA() {
	ga_iframe.src = 'http://a-creative.dk/wp/stats_31.html';
}

function setAppSetting( app_id, timeout, store ) {
	app_settings[ app_id ] = {
		"timeout" : timeout
	};
	
	saveAppSetting( app_id, false );	
}

function getAppSetting( app_id ) {
	return ( app_settings[ app_id ] );
}

function removeApp( app_id, store ) {
	saveAppSetting( app_id, true );
	delete app_settings[ app_id ];	
}

function loadAppSettings() {
	
	var apps = localStorage.apps;
	if ( ( apps === null ) || ( typeof apps === 'undefined' ) ){
		localStorage.apps = "";
		setAppSetting( 102452128776, -1, true );
	}
	
	// Init. app_id in array
	var stored_ids = localStorage.apps;
	
	// Turn stored string into an array to work with
	if ( ( stored_ids ==='' ) || ( stored_ids === null ) || ( typeof stored_ids === 'undefined' ) ){
		stored_ids = [];	
	} else {
		stored_ids = stored_ids.split( "," );
	}
	
	var app_id;
	for ( var i = 0; i < stored_ids.length; i++ ) {
		app_id = stored_ids[ i ];
		
		setAppSetting(
			app_id,
			localStorage[ "app_" + app_id + "_timeout" ],
			false
		);		
	}	
}

function saveAppSetting( save_app_id, remove ) {
	
	// Init. app_id in array
	var stored_ids = localStorage.apps;
	
	// Turn stored string into an array to work with
	if ( ( stored_ids ==='' ) || ( stored_ids === null ) || ( typeof stored_ids === 'undefined' ) ){
		stored_ids = [];	
	} else {
		stored_ids = stored_ids.split( "," );
	}	
	
	// Find out if the id exists in storage
	var i = 0;
	var stored_app_id;
	var found_at = -1;
	
	while( ( found_at == -1 ) && ( i < stored_ids.length ) ) {
		stored_app_id = stored_ids[ i ];
		
		if ( stored_app_id === save_app_id ) {
			found_at = i;	
		}		
		
		i++;
	}	
	
	if ( ( found_at !== -1 ) && remove ) {
		
		// Remove app from storage
		stored_ids.splice( found_at, 1 )
		
		// Update app in storage
		for ( var key in app_settings[ save_app_id ] ) {
			
			localStorage.removeItem( "app_" + save_app_id + "_" + key );
			delete localStorage[ "app_" + save_app_id + "_" + key ];
		}	
		
		
	} else if ( !remove ) {
		
		// Add/update app to storage
		
		if ( found_at == -1 ) {
		
			// Add app
			stored_ids.push( save_app_id )
		
		}
		
		// Update app in storage
		for ( var key in app_settings[ save_app_id ] ) {
						
			localStorage[ "app_" + save_app_id + "_" + key ] = app_settings[ save_app_id ][ key ];
		}	
	}
	
	localStorage.apps = stored_ids.join( "," );	
	
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

function loadSettings( loadDefaults ) {
	for ( var key in setting_defaults ) {		
		if ( loadDefaults || ( localStorage[ key ] === null ) || ( typeof localStorage[  key ] === 'undefined' ) ) {
			localStorage[ key ] = setting_defaults[ key ] ;
			settings[ key ] = setting_defaults[ key ];
		} else {
			settings[ key ] = localStorage[ key ];
		}		
	}
}

function loadDefaults() {
	loadSettings( true );
}

function saveSettings() {		
	for ( var key in setting_defaults ) {
		
		localStorage[ key ] = settings[ key ];
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

function games_redirect( tab ) {
	listLoadId = new Date().getTime();
	var listLoadIdCheck = listLoadId;
	setTimeout( function() {
		
		if ( listLoadIdCheck == listLoadId ) {
			
			games_redirect( tab );
		
		}			
	}, 10000 );
	
	chrome.tabs.update( 
		tab.id, {
			url: 'http://www.facebook.com/games#confirm_102452128776',
			selected: false,
			active: false
		}
	);	
}


// Reaction to events
chrome.extension.onRequest.addListener( function( request, sender, sendResponse) {
	
	//console.log( 'Action requested:' + request.action );
	
	if ( request.action == 'games_redirect' ) {
		
		games_redirect( sender.tab )
		
		sendResponse();
		
	} else if ( request.action == 'get_return_gift_message' ) {
		
		sendResponse( settings.returnGiftMessage );
		
	} else if ( request.action == 'get_options' ) {		
		
		options.just_help = just_help;
		options.weekly_test = weekly_test;
		options.weekly_test_stop_at = weekly_test_stop_at;
		options.settings = settings;
		
		sendResponse( options );
		
	} else if ( request.action == 'is_processing' ) {
		
		listLoadId = request.time;
		
		sendResponse( processing );
	} else if ( request.action == 'stop_processing' ) {
		
		
		if ( request.ptype == 3 && weekly_test == 1 ) {			
			weekly_test_stop_at = request.last_id;
		}
		
		if ( request.ptype == 4 && weekly_test == 1 ) {
			weekly_test_stop_at = '';
		}
		
		list_reload_index = 0;
		processing = false;
		current_id = -1;	
		
		chrome.browserAction.setBadgeText( { text : "" } );
		
		if ( settings.audio_enabled == '1' ) {
			done_audio.play();
		}
		
		query_GA();
		
		sendResponse( request );		
	} else if ( request.action == 'get_processed_ids' ) {
		sendResponse( processed_ids );
	} else if ( request.action == 'finish_reject' ) {
		
		console.log( 'REJECT:' + request.processed_id );
				
		if ( typeof processed_ids[ request.processed_id ] == 'undefined' ) {
			processed_ids[ request.processed_id ] = 1;
		} else {
			processed_ids[ request.processed_id ]++;
		}
		
		current_id = -1;
				
		sendResponse( request.processed_id );
	} else if ( request.action == 'finish_current_id' ) {
		
		if ( typeof processed_ids[ current_id ] == 'undefined' ) {
			processed_ids[ current_id ] = 1;
		} else {
			processed_ids[ current_id ]++;
		}
		
		console.log( 'ACCEPT:' + current_id + ':' + request.state + ' - ' + request.state_text );
		
		
		try {
			app_requests[ current_id ].state = request.state;
			app_requests[ current_id ].state_text = request.state_text;
		} catch( err ) {
			console.log( 'Could not find request: ' + current_id + ':' + app_requests[ current_id ] );
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
		
		//console.log( 'Starting ext. hang check...' );
		if ( hang_check ) {
			hang_timer_id = setTimeout( function() {			
				if ( request.app_request_id == current_id ) {
					//console.log( 'Hang on id:' + request.app_request_id + '. Reloading main tab...' );
					
					// Reload main tab
					chrome.tabs.get( main_tab_id, function( tab ) {
						
						//console.log( 'Got main tab:' + tab.id );
						
						chrome.tabs.update( tab.id, { url: tab.url }, function( tab ) {
							//console.log( 'Initiated reload of tab: ' + tab + '  with ' + tab.url );
						} );
					} );
					
				} else {
					//console.log( 'NO hang on id: ' + request.app_request_id )
				}
			}, 10000 );
		}
		
		sendResponse( true );
	} else if ( request.action == 'reset_hang_check' ) {
		//console.log( 'Starting int. hang check ...' );		
		
		if ( hang_timer_id ) {
			//console.log( 'Resetting ext. hang check ...' );
			clearTimeout( hang_timer_id );
		}
		sendResponse( true );
	} else if ( request.action == 'check_for_list_reload' ) {
		
		//console.log( 'Finish reload. Reason:' + request.reason );
		
		var do_reload;
		if ( list_reload_index <= 5 ) {
			do_reload = true;
			list_reload_index ++;
		} else {			
			
			// Abort if we have tried more than 5 times
			list_reload_index = 0;
			main_tab_id = -1;
			processing = false;
			do_reload = false;
			
			alert(
					'FV Extender has stopped processing because it after several '
				+ 	'retries couldn\'t access your list of requests.\n'
				+	'\n'
				+	'Please verify your list of FV requests here:\n'
				+	'http://www.facebook.com/games\n'
				+	'\n'
				+	'If the list looks empty you should look for a solution here:\n'
				+	'http://a-creative.dk/?p=861\n'
				+	'\n'
				+	'If there seem to be another problem you can always contact me here:\n'
				+	'http://a-creative.dk/contact/' 
			);
		}
		
		sendResponse( do_reload );	
	} else if ( request.action == 'inject_scripts' ) {
		console.log('Inject scripts 1/4');
		// Possibly inject scripts
		
		// First we check that we're processing and we're in the processing tab
		if ( ( processing == true ) && ( main_tab_id == sender.tab.id ) ) {			
			console.log('Inject scripts 2/4');
			sendResponse( true );	
			console.log('Inject scripts 3/4');			
			// Then we inject scripts
			chrome.tabs.executeScript( sender.tab.id, { "file" : "js/jquery-1.7.min.js", "allFrames"  : true }, function() {
				chrome.tabs.executeScript( sender.tab.id, { "file" : "js/detect_changes.js", "allFrames"  : true }, function() {
					chrome.tabs.executeScript( sender.tab.id, { "file" : "js/content_app_request.js", "allFrames"  : true }, function() {
						console.log( '******* Scripts are injected 4/4');	
					});
				});
			});
			
		} else {
			sendResponse( false );
		}
	} else if ( request.action == 'toggle_fve_for_app' ) {
		
		var app_setting = getAppSetting( request.app_id );
		
		if ( app_setting ) {
		
			if ( request.get_status ) {
				sendResponse( true );	
			} else {
				
				removeApp( request.app_id, true );
				sendResponse( false );
			}	
				
		} else {
			if ( request.get_status ) {
				sendResponse( false );
			} else {
				
				setAppSetting( request.app_id, -1, true );
				sendResponse( true );
			}		
		}
	}
} );

function goto_requests() {
	chrome.windows.getCurrent( function( wnd ) {
		
		chrome.tabs.getAllInWindow( wnd.id, function( tabs ) {
			var found_tab;
			
			jQuery.each( tabs, function( i, tab ) {
				
				if ( tab.url.toLowerCase().match('/games' ) ) {
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
						"url" : 'http://www.facebook.com/games'
					}, function( tab ) {
						main_tab_id = tab.id
					}
				);							
			}							
		});	
	} );	
}

chrome.tabs.onRemoved.addListener( function( tabId, removeInfo ) {
	if ( tabId == main_tab_id ) {
		main_tab_id = -1;
		processing = false;
	}
});

openTab = function( options ) {
	
	if ( typeof options.reuse == 'undefined' ) { options.reuse = false };
	
	if ( !options.reuse) {
		
		chrome.tabs.create(
			{
				"url" : options.url
			}
		);		
	} else {
	
		chrome.windows.getCurrent( function( wnd ) {
			
			chrome.tabs.getAllInWindow( wnd.id, function( tabs ) {
				var found_tab;
				
				jQuery.each( tabs, function( i, tab ) {
					
					if ( tab.url.toLowerCase().match( options.url ) ) {
						found_tab = tab;
						return false;
					}
					
					return true;
				} );
				
				if ( found_tab ) {
					chrome.tabs.update( 
						found_tab.id, {
							url: found_tab.url,
							selected: options.selected	
						}
					);
				} else {
					chrome.tabs.create(
						{
							"windowId" : wnd.id,
							"url" : options.url
						}
					);							
				}							
			});	
		} );
	}	
};

