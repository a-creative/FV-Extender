
var Version = {
	FVE_version : undefined,
	init : function() {
		Version.FVE_version = Version.getVersion();
		console.log( 'Loading FVE Classic version: ' + Version.FVE_version )
	},
	getVersion : function() {
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
	},
	_twitterSuccess : function( callback, tweets ) {
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
	},
	getLatestVersion : function( callback ) {	
	
		// Load blog updates		
		var screen_name = 'fv_extender';	
		
		$.ajax({
			url: "http://api.twitter.com/1/statuses/user_timeline.json",
			dataType: 'json',
			data: "screen_name=" + screen_name + "&count=3&callback=?",
			success: function( tweets ) {
				Version._twitterSuccess( callback, tweets )
			},
			error: function() {
				callback( false );
			}
		}).error( function() {
			callback( false );
		} );
				
	},
	versionStrToInt : function( version_str ) {
		
		var version_p = version_str.split( '.' );
	
		var version_int =
				parseInt( version_p[ 0 ] ) * 100
			+	parseInt( version_p[ 1 ] ) * 10
			+   parseInt( version_p[ 2 ] ) * 1;
		
		return ( version_int );
	},
	checkForUpdates : function( callback ) {
	
		Version.getLatestVersion( function( latest_version ) {
			
			if ( latest_version ) {
				
				if ( latest_version.version != FVE_version ) {
					if ( Version.versionStrToInt( latest_version.version ) > Version.versionStrToInt( FVE_version ) ) {
						
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
};