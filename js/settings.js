var bgp = chrome.extension.getBackgroundPage();
		
$(document).ready( function() {
	
	loadSettings( false );

	$("#defaults-btn").click( function( evt ) {
		loadSettings( true );
		evt.preventDefault();
	});
	
	$("#save-btn").click( function( evt ) {
		saveSettings();
		window.close();
		evt.preventDefault();
	});
	
	$("#cancel-btn").click( function( evt ) {
		window.close();
		evt.preventDefault();
	});			

} );

function loadSettings( loadDefaults ) {
	
	if ( loadDefaults ) {
		
		$("#user-settings .return-gift-text textarea").val(
			'This gift was returned by FV Extender for Google Chrome.'
		);
		
		$('#user-settings input:radio[name="sound"]').filter('[value="' + bgp.setting_defaults.audio_enabled + '"]').attr('checked', true);
		
		if ( bgp.setting_defaults.rejectGifts == 'true') {
			$('#user-settings input:checkbox[name="reject_gifts"]').attr('checked', 'checked' );
		} else {
			$('#user-settings input:checkbox[name="reject_gifts"]').removeAttr('checked');
		}
		
		if ( bgp.setting_defaults.rejectNeighbors == 'true' ) {
			$('#user-settings input:checkbox[name="reject_neighbors"]').attr('checked', 'checked' );
		} else {
			$('#user-settings input:checkbox[name="reject_neighbors"]').removeAttr('checked');
		}
		
		
	} else {
		
		$('#user-settings input:radio[name="sound"]').filter('[value="' + bgp.settings.audio_enabled + '"]').attr('checked', true);
		
		if ( bgp.settings.rejectGifts == 'true' ) {
			
			$('#user-settings input:checkbox[name="reject_gifts"]').attr('checked', 'checked' );
		} else {
			$('#user-settings input:checkbox[name="reject_gifts"]').removeAttr('checked');
		}
		
		if ( bgp.settings.rejectNeighbors == 'true' ) {
			$('#user-settings input:checkbox[name="reject_neighbors"]').attr('checked', 'checked' );
		} else {
			$('#user-settings input:checkbox[name="reject_neighbors"]').removeAttr('checked');
		}
		
		
		$("#user-settings .return-gift-text textarea").val( bgp.settings.returnGiftMessage );
	}	
}

function saveSettings() {
	
	bgp.settings.returnGiftMessage = $("#user-settings .return-gift-text textarea").val();
	bgp.settings.audio_enabled = $('input:radio[name="sound"]:checked').val();
	
	bgp.settings.rejectGifts = $('input:checkbox[name="reject_gifts"]').is(':checked');
	bgp.settings.rejectNeighbors = $('input:checkbox[name="reject_neighbors"]').is(':checked');
	
	bgp.saveSettings();
	
	window.close();
}
