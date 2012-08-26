var bgp;

function _abort_clicked() {
	bgp.main_tab_id = -1;
	bgp.processing = false;
	alert( 'Processing is aborted when the current request is done being processed.');
	window.close();
	return false;
}

function _process_clicked() {
	
	bgp.app_requests = {};
	bgp.processed_ids = {};
	bgp.processing = true;
	bgp.just_help = false;
	bgp.goto_requests();
	window.close();
	return false;
	
}

function _settings_clicked() {
	bgp.openTab( { url: "html/settings.html" } );
	window.close();
	return false;
}

function _just_help_btn_clicked() {
	alert( 'Feature not available yet. Just help will be added in a later version.' );
	window.close();

	return false;
	
}

function _donate_btn_clicked() {
	bgp.openTab( { url: "http://a-creative.dk/donate/" } );
	window.close();
	return false;
}

window.onload = function() {
	
	bgp = chrome.extension.getBackgroundPage();
	
	if ( bgp.is_google_shop ) {
		var update_link = document.getElementById( 'updates-btn' );
		update_link.innerHTML = '- FVE is up-to-date';
	} else {
		
		bgp.checkForUpdates( function( update ) {
			
			var update_link = document.getElementById( 'updates-btn' );
		
			if ( update ) {
				
				if ( update.manual_update ) {
					update_link.target = '_blank';
					update_link.innerHTML = 'Update FVE'
					update_link.title = 'Click to read more about and update FVE to the latest version: ' + update.version ;
					
				} else {
					update_link.innerHTML = 'Update FVE now'
					
					update_link.title = 'Click to update FVE instantly to the latest version: ' + update.version;
				}
				
				update_link.target = '_blank';
				update_link.href = update.url;
				update_link.className = 'enabled';
				
				var sign = document.getElementById( 'update-sign' );
				sign.href = update.url;
				sign.target = '_blank';
				sign.style.display = 'block';
				
			} else {
				update_link.innerHTML = '- FVE is up-to-date';
			}
			
			
		} );
	}
	
	var abort_btn = document.getElementById( 'abort-btn' );
	var process_btn = document.getElementById( 'process-btn' );
	var settings_btn = document.getElementById( 'settings-btn' );
	var just_help_btn = document.getElementById( 'just-help-btn' );
	var donate_btn = document.getElementById( 'donate-btn' );
	
	if ( bgp.processing ) {
		abort_btn.className = 'enabled';
		abort_btn.onclick = _abort_clicked;
		
	} else {
		process_btn.className = 'enabled';
		process_btn.onclick = _process_clicked;
	}
	
	settings_btn.onclick = _settings_clicked;
	just_help_btn.onclick = _just_help_btn_clicked;
	donate_btn.onclick = _donate_btn_clicked;	
};