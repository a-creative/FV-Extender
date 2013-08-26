function changes_detected() {
	
	var button_el = jQuery( "input[name='ok_clicked']");
	var text_el = jQuery( ".platform_apprequests_preview .appRequestBody" );
	if ( button_el && button_el.length && text_el && text_el.length && text_el.html().match( /Thank you for your gift/ ) ) {
		if_not_detected( text_el, function( text_el ) {
			button_el.click();
		});		
	}	
}

// Check if this is the main tab and that processing is true
chrome.extension.sendRequest( { "action" : "handle_result_page" }, function( handle_result_page ) {

	if ( handle_result_page ) {
		run_detect_changes();
	}
} );
