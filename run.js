var test_mode = false;

console.log('Loading FV Extender...');

chrome.extension.onRequest.addListener( function(request, sender, sendResponse) {
	if ( request.action == 'get_test_mode' ) {
		sendResponse( { test_mode : test_mode } );
	} else if ( request.action == 'accept_request' ) {
		
		if ( test_mode == true ) {
			sendResponse( { test_mode : true } );
		} else {
			$.ajax({
				type: "POST",
				timeout: 10000,
				url: 'http://www.facebook.com/ajax/reqs.php?__a=1',
				data: request.data,
				dataType: 'text',
				success: function( data, textStatus, XMLHttpRequest) {
					var temp_data = data;
					
					// Find game URI in result page
					if ( matches = temp_data.match( /goURI\((\\".*?\\")/ ) ) {
						
						eval( "var URI_temp = '" + matches[ 1 ] + "'" );
						var URI = JSON.parse( URI_temp );
						
						// Request game URI
						$.ajax({
							type: "GET",
							url: URI,
							timeout: 10000,
							dataType: 'text',
							success: function( game_data ) {
								
								// Inform UI about the susccesfully accepted request
								sendResponse( { result_data : game_data, uri: URI, test_mode: false } );	
							}
						});
											
					} else {
						console.log( 'Could not find URI' );					
					}														
				},
				error: function( XMLHttpRequest, textStatus, errorThrown) {
					alert('Error:' + textStatus );							
				}
			});	
		}	
	}
});
			
			
console.log('FV Extender loaded.');