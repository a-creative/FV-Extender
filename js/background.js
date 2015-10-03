var is_google_shop = false;

var FVE_version = getVersion();


var def_data_page = "http://www.facebook.com/reqs.php#confirm_102452128776";
var def_data_page_check = "facebook.com/reqs.php";
var alt_data_page = "http://www.facebook.com/games/activity";
var alt_data_page_check ="facebook.com/games/activity";

var processing = false;
var app_requests = {};
var processed_ids = {};
var weekly_test = false;

var current_id = -1;
var main_tab_id = -1;
var just_help = false;
var hang_check = true;
var hang_timer_id;
var list_reload_index = 0;
var listLoadId = 0;

var options = {};
var settings;

var setting_defaults = {
	"audio_enabled" : "1",
	"returnGiftMessage"  : "This gift was returned by FV Extender for Google Chrome.",
	"rejectGifts" : 'false',
	"rejectNeighbors" : 'false',
    "bandwidthUse" : "",
	"useAlternativeDataPage" : 'true'
};

// Create audio
var done_audio = document.createElement("audio");
done_audio.src = "../sound/cow.ogg";

var info_audio = document.createElement("audio");
info_audio.src = "../sound/info.ogg";


var ga_iframe;
jQuery(document).ready( function() {
	
	if ( weekly_test ) {
		alert( 'Test enabled' );
	}
	
	loadSettings();
	
	// Create iframe for google analytics
	ga_iframe = document.body.appendChild(document.createElement('iframe'));	
} );


function log_error( text ) {
	console.error( text );	
}

function log_info( text ) {
	console.info( text );	
}

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
			
			if ( manifest && ( typeof manifest.update_url !== 'undefined' ) ) {
				is_google_shop = true;
			}
			
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
		if ( loadDefaults || ( ( typeof localStorage[ key ] ) == 'undefined' ) ) {
			localStorage[ key ] = setting_defaults[ key ]
		}		
	}
	
	settings = localStorage;
}

function loadDefaults() {
	loadSettings( true );
}

function saveSettings() {		
	for ( var key in setting_defaults ) {
		localStorage[ key ] = settings[ key ];
	}
}

function games_redirect( tab ) {
	listLoadId = new Date().getTime();
	var listLoadIdCheck = listLoadId;
	setTimeout( function() {
		
		if ( listLoadIdCheck == listLoadId ) {
			
			games_redirect( tab );
		
		}			
	}, 10000 );

	var data_page_url = def_data_page;
	if ( settings.useAlternativeDataPage === 'true' ) {
		data_page_url = alt_data_page;
	}

	chrome.tabs.update(
		tab.id, {
			url: data_page_url,
			selected: false,
			active: false
		}
	);	
}


// Reaction to events
chrome.extension.onRequest.addListener( function( request, sender, sendResponse) {
	
	//console.log( 'Action requested:' + request.action );
	
	if ( request.action == 'games_redirect' ) {
		
		games_redirect( sender.tab );
		
		sendResponse();
		
	} else if ( request.action == 'get_return_gift_message' ) {
		
		sendResponse( settings.returnGiftMessage );
		
	} else if ( request.action == 'get_options' ) {		
		
		options.just_help = just_help;
		options.weekly_test = weekly_test;
		options.settings = settings;
		
		sendResponse( options );
		
	} else if ( request.action == 'is_processing' ) {
        var delay_seconds = parseInt( settings.bandwidthUse );
        if ( isNaN( delay_seconds ) ) {
            delay_seconds = 0;
        }
		
		listLoadId = request.time;
		sendResponse( { is_processing: processing, delay_seconds: delay_seconds } );
	} else if ( request.action == 'stop_processing' ) {
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

			var data_page_url = def_data_page;
			if ( settings.useAlternativeDataPage === 'true' ) {
				data_page_url = alt_data_page;
			}

			alert(
					'FV Extender has stopped processing because it after several '
				+ 	'retries couldn\'t access your list of requests.\n'
				+	'\n'
				+	'Please verify your list of FV requests here:\n'
				+	data_page_url + '\n'
				+	'\n'
				+	'If the list looks empty you should look for a solution here:\n'
				+	'http://a-creative.dk/?p=861\n'
				+	'\n'
				+	'If there seem to be another problem you can always contact me here:\n'
				+	'http://a-creative.dk/contact/' 
			);
		}
		
		sendResponse( do_reload, data_page_url );
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
	}
	
	
	
} );

function goto_requests() {
	chrome.windows.getCurrent( function( wnd ) {
		
		chrome.tabs.getAllInWindow( wnd.id, function( tabs ) {
			var found_tab;
			jQuery.each( tabs, function( i, tab ) {

				var check_path = def_data_page_check;

				if ( settings.useAlternativeDataPage === 'true' ) {
					check_path = alt_data_page_check;
				}

				if ( tab.url.toLowerCase().indexOf( check_path ) !==-1 ) {
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

				var data_page_url = def_data_page;
				if ( settings.useAlternativeDataPage === 'true' ) {
					data_page_url = alt_data_page;
				}

				chrome.tabs.create(
					{
						"windowId" : wnd.id,
						"url" : data_page_url
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

