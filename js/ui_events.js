function _processRequestsClicked() {
	
	chrome.extension.sendRequest( { "action" : "init_process_requests" }, _processRequestsInitiated );		
	return false;
}

function _processRequestsInitiated() {
	
	Process_next();
}

function _changeOptionsClicked() {
	alert( 'Change options' );
	return false;
}

function Process_next() {	
	
	var app_request_group = document.evaluate("//div[@id='confirm_102452128776']", document, null, XPathResult.ANY_TYPE, null).iterateNext();
	
	if ( app_request_group ) {
		
		// If FarmVille request group was found
		
		// Find the first request
		var requests_el = app_request_group.getElementsByClassName( 'requests' )[ 0 ];
		var app_request = requests_el.childNodes[ 0 ];
		
		if ( app_request ) {
		
			console.log( app_request.innerHTML );
		
			// Find accept all button and click it
			var accept_button = document.evaluate(".//input[starts-with(@name,'actions[accept') or starts-with(@name,'actions[http')]", app_request, null, XPathResult.ANY_TYPE, null).iterateNext();
			accept_button.click();
			
		} else {
			alert( 'Could find request' );
		}
		
	} else {
		chrome.extension.sendRequest( { "action" : "stop_processing" }, _processingDone );	
		
	}	
}

function _processingDone() {
	alert( 'No FarmVille requests. FVE currently only handles FV requests' );	
}
