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

function _donate_btn_clicked() {
	bgp.openTab( { url: "http://a-creative.dk/donate/" } );
	window.close();
	return false;
}

window.onload = function() {
	
	bgp = chrome.extension.getBackgroundPage();
	
	var abort_btn = document.getElementById( 'abort-btn' );
	var process_btn = document.getElementById( 'process-btn' );
	var settings_btn = document.getElementById( 'settings-btn' );
	var donate_btn = document.getElementById( 'donate-btn' );
	
	if ( bgp.processing ) {
		abort_btn.className = 'enabled';
		abort_btn.onclick = _abort_clicked;
		
	} else {
		process_btn.className = 'enabled';
		process_btn.onclick = _process_clicked;
	}
	
	settings_btn.onclick = _settings_clicked;
	donate_btn.onclick = _donate_btn_clicked;	
};