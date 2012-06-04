
var Proc = {
	request_cache : {},
	ProcessRequests : function( app_id, cb ) {
	
		// Load requests from FB		
		jQuery.get( 'https://www.facebook.com/games', function( data ) {
			
			var result = Proc.LocatePageletContent( data, 'requests' );
			
			if ( result.error == 0 ) {

				var data_el = jQuery( '<div>' +  result.content + '</div>' );
				
				// Exstract request id's from HTML
				var request_ids = Proc.ExstractRequestIds( data_el, app_id );
				
				var process_max = Settings.core_settings[ 'speed' ];				
				
				cb();		
				
				
				
				
			} else {
				alert( 'Error:' + result.error );	
			}
			
		});		
		
	},
	LocatePageletContent: function( data, pagelet_name ) {
	
		var input_err_code = 0;
		var html_data = '';
		
		var begin2_search = '"content":{"pagelet_' + pagelet_name + '":{"container_id":"';
		
		var begin2 = data.indexOf( begin2_search )
		if ( begin2 != -1 ) {
			
			// Request data is inside hidden element
			
			// Find the container id for the element
			var container_id_cand = data.substr( begin2 + begin2_search.length, begin2 + begin2_search.length + 100 );
			
			var end2 = container_id_cand.indexOf('"');
			var container_id = container_id_cand.slice(0,end2);
			
			// Find container value with html for requests
			var hidden_el_begin_str = '<code class="hidden_elem" id="' + container_id + '"><!-- ';
			
			var hidden_el_begin = data.indexOf( hidden_el_begin_str );
			if ( hidden_el_begin != -1 ) {
				
				var hidden_el_content_cand = data.substr( hidden_el_begin + hidden_el_begin_str.length );
				var hidden_el_end = hidden_el_content_cand.indexOf(" --></code>");
				html_data = hidden_el_content_cand.slice(0,hidden_el_end);
			
			} else {
				input_err_code = 1;
			}
		} else {
			
			var begin3 = data.indexOf( '"content":{"pagelet_' + pagelet_name + '":"' );
			if ( begin3 != -1 ) {
				var end = data.indexOf( '"}', ( begin3 + 10 ) ) + 2;
				var json_str_data = data.slice( ( begin3 + 10 ), end );
			
				var json_data = {};
				try {
					json_data = JSON.parse( json_str_data );
				} catch( e ) {
					input_err_code = 2
				}
				
				html_data = json_data[ 'pagelet_' + pagelet_name ];
			} else {
				input_err_code = -1;
			}
			
		}
		
		return ( { error: input_err_code, content: html_data } ); 		
	},
	ExstractRequestIds : function( data_el, only_app_id ) {
		var app_groups = data_el.find( '.appRequestGroup' );				
		var app_group;
		var app_id;
		var request_id;
		var request_ids = {};
		for ( var k = 0; k < app_groups.length ; k++ ) {
			
			app_group = jQuery( app_groups[ k ] ).parent();						
			app_id = app_group.attr( 'id').substring( 8 );
			console.log( 'Evaluating app with id:' + app_id + '...' );					
			
			
			// Check if FVE is activated for this app
			if ( Settings.getAppSetting( app_id ) && ( ( only_app_id == -1 ) || ( app_id == only_app_id ) ) ) {
						
				
				var request_id_els = app_group.find( "li.requestStatus input[name='div_id'], li.requestStatus input[name='status_div_id']" );
				
				console.log( 'Adding ' + request_id_els.length + ' requests for app with id:' + app_id + '...' );							
				
				for ( var j = 0; j < request_id_els.length; j++ ) {
					
					request_id = jQuery(request_id_els[ j ]).attr( 'value' );					
					
					request_ids[ request_id ] = true;						
					console.log( 'Adding request with id ' + request_id + '...' );				
				}
			}					
						
		};
		return Object.keys( request_ids );
	}
};