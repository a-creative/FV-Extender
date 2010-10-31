var test_mode = false;
var single_mode = true;
var return_gifts_mode = true;
var accept_and_return = false;

console.log('Loading FV Extender...');

var app_id = '102452128776';

chrome.extension.onRequest.addListener( function(request, sender, sendResponse) {
	if ( request.action == 'set_accept_and_return' ) {
		accept_and_return = request.value;
		sendResponse( { accept_and_return : accept_and_return } );
	} else if ( request.action == 'get_accept_and_return' ) {
		sendResponse( { accept_and_return : accept_and_return } );
	} else if ( request.action == 'get_return_gifts_mode' ) {
		sendResponse( { return_gifts_mode : return_gifts_mode } );
	} else if ( request.action == 'get_single_mode' ) {
		sendResponse( { single_mode : single_mode } );
	} else if ( request.action == 'get_test_mode' ) {
		sendResponse( { test_mode : test_mode } );
	} else if ( request.action == 'accept_request' ) {
		
		if ( test_mode == true ) {
			sendResponse( { test_mode : true } );
		} else {
			
			// Send gift
			$.ajax({
				type: "POST",
				timeout: 10000,
				url: 'http://www.facebook.com/ajax/reqs.php?__a=1',
				data: request.data,
				dataType: 'text',
				success: function( data, textStatus, XMLHttpRequest) {
					var temp_data = data;
					console.log('Got 1' );
					
					if ( matches = temp_data.match( /goURI\((\\".*?\\")/ ) ) {
						
						eval( "var URI_temp = '" + matches[ 1 ] + "'" );
						var URI = JSON.parse( URI_temp );
						
						// Request send gift result page
						$.ajax({
							type: "GET",
							url: URI,
							timeout: 10000,
							dataType: 'text',
							success: function( game_data ) {
								
								
								/* return gift
								var matches;
								if ( matches = game_data.match( /gifts_send\.php\?(action=sendThankYou[^"]+)/ ) ) {
									var query_str = matches[ 1 ];
									query_str = query_str.replace( /&amp;/g,'&' );
									
									var url = 'http://apps.facebook.com/onthefarm/gifts_send.php?' + query_str;
									
									// Send return gift
									$.ajax({
										type: "POST",
										timeout: 10000,
										url: url,
										dataType: 'text',
										success: function( data, textStatus, XMLHttpRequest) {	
											
											var matches;
											if ( matches = game_data.match( /receiverGift=([^&]+)&amp;giftRecipient=(\d+)&/ ) ) {
												var gift_id = matches[ 1 ];
												var to_id = matches[ 2 ];
												
												// Request return gift result page
												$.ajax({
													type: "GET",
													timeout: 10000,
													url: 'http://apps.facebook.com/onthefarm/sentthankyougift.php',
													data: {
														"senderId"	: to_id,
														"gift"		: gift_id,
														"ref"		: "gift_accept_tab"
													},
													dataType: 'text',
													success: function( data, textStatus, XMLHttpRequest) {	
														
														// Inform UI about the susccesfully accepted request
														sendResponse( { result_data : game_data, uri: URI, test_mode: false } );	
													}
												} )
												
											}
										}
									});
								}
								*/
								
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