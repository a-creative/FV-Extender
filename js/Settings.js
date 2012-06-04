
var Settings = {
	
	/* attributes */
	core_setting_defaults : {
		"audio_enabled" : "1",
		"returnGiftMessage"  : "",
		"rejectGifts" : false,
		"rejectNeighbors" : false,
		"speed" : 1,
	},
	app_settings : {},
	core_settings : {},
	
	/* methods */
	setAppSetting : function( app_id, timeout, store ) {
		Settings.app_settings[ app_id ] = {
			"timeout" : timeout
		};
		
		Settings.saveAppSetting( app_id, false );	
	},
	getAppSetting: function( app_id ) {
		return ( Settings.app_settings[ app_id ] );
	},
	removeApp: function( app_id, store ) {
		Settings.saveAppSetting( app_id, true );
		delete Settings.app_settings[ app_id ];	
	},
	loadAppSettings: function() {
	
		var apps = localStorage.apps;
		if ( ( apps === null ) || ( typeof apps === 'undefined' ) ){
			localStorage.apps = "";
			Settings.setAppSetting( 102452128776, -1, true );
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
			
			Settings.setAppSetting(
				app_id,
				localStorage[ "app_" + app_id + "_timeout" ],
				false
			);		
		}	
	},
	saveAppSetting: function( save_app_id, remove ) {
	
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
			for ( var key in Settings.app_settings[ save_app_id ] ) {
				
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
			for ( var key in Settings.app_settings[ save_app_id ] ) {
							
				localStorage[ "app_" + save_app_id + "_" + key ] = Settings.app_settings[ save_app_id ][ key ];
			}	
		}
		
		localStorage.apps = stored_ids.join( "," );	
		
	},
	loadSettings: function( loadDefaults ) {
		for ( var key in Settings.core_setting_defaults ) {		
			if ( loadDefaults || ( localStorage[ key ] === null ) || ( typeof localStorage[  key ] === 'undefined' ) ) {
				localStorage[ key ] = Settings.core_setting_defaults[ key ] ;
				Settings.core_settings[ key ] = Settings.core_setting_defaults[ key ];
			} else {
				Settings.core_settings[ key ] = localStorage[ key ];
			}		
		}
	},
	loadDefaults: function() {
		Settings.loadSettings( true );
	},
	saveSettings: function() {		
		for ( var key in Settings.core_setting_defaults ) {
			
			localStorage[ key ] = Settings.core_settings[ key ];
		}
	}
	
};