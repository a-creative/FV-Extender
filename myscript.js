var aborted = false;



$(document).ready( function() {

	function callLast(func, t){
		if(!t){ t = 100; }
		var callLastTimeout = null; 
		return function(){
			if(callLastTimeout!==null){
				window.clearTimeout(callLastTimeout); 
			}
			callLastTimeout = window.setTimeout(function(){ callLastTimeout = null; func(); }, t);
		};
	}
	
	run();
	
	function run(){
	
		var request_lists = null;
		function work(){
			request_lists = jQuery("div.mbl");
				
			if( request_lists.length ){
				
				removeWorker();
				request_lists.each( function( i,el ) { 
					
					var request_list = $(el);
					
					// Find requests
					var requests = request_list.find( '> ul > li.uiListItem' );
					if ( requests.length ) {
						
						// Find first request	
						var first = requests.first();
						
						// Check if it is a FarmVille requests
						var frm = first.find('form');
						var action_url = escape($(frm).find('input[type="submit"]:first').attr('name'));
						
						if ( action_url.match( /apps\.facebook\.com\/onthefarm/ ) ) {
							
							// Add "Accept all" button to request list header if it is not already found
							var list_header = request_list.find('>.uiHeader div div  h3');
							if ( list_header.attr( 'has_accept_all_button' ) != 'yes' ) {						 
							
								var acceptBtnBg = chrome.extension.getURL('acceptAllBtnBg.png'); 
								
								var accept_all_btn = $('<label class="uiButton uiButtonMedium my-accept-all-btn" style="background:url('+acceptBtnBg+')"></label>');
								
								var popup_layer = $('<div class="accept-all-popup" />');
								var btn = $('<input value="Accept all" type="button">');
								
								accept_all_btn.append( popup_layer );
								accept_all_btn.append( btn );
								
								var accept_all_info = $('<span class="accept-all-info">Provided by <a href="http://a-creative.github.com/FV-extender/" target="_blank">FV Extender</a></span>');
								
								list_header.css( 'position', 'relative' )
								
								list_header.append( accept_all_btn );
								list_header.append( accept_all_info );
								
								list_header.attr( 'has_accept_all_button', 'yes' );
								
								accept_all_btn.find('input').click( function() {
									show_accept_all_dialog({
										all_requests: requests,
										accept_all_btn: accept_all_btn
									})
								} );
							}
						}
					}				
					
				} );
				
				addWorker();
			}
		}
	
		var workLast = callLast(work);
		function addWorker(){       document.addEventListener("DOMSubtreeModified", workLast, false); }
		function removeWorker(){ document.removeEventListener("DOMSubtreeModified", workLast, false); } 
		function startWork(){ addWorker(); workLast(); }
	
		startWork();
	}
});

function filter_requests ( all_requests ) {
	var filtered_requests = all_requests.filter( function( index ) {
		var body_el = $(this).find('.requestBody');
		if ( body_el.length ) {			
			if ( body_el.html().match( /collecting Shovels in FarmVille/i ) ) {
				return false;
			}
		}		
		
		var msg_el = $(this).find('.requestMessage');
		if ( msg_el.length ) {
			return false;
		} else {
			return true;
		}
		
	});
	
	return ( filtered_requests );
}

function show_accept_all_dialog( params ) {
	
	// Add popup to body. Initially hide
	var accept_all_status = $('<div id="accept-all-status-popup" />');
	var center_el = $('<div style="text-align:center" />' );	
	var status_el = $('<p class="status"></p>');
	
	// Init status values
	status_el.progressbar({
		value : 0	
	});
	
	params.status_layer = status_el;
	var status_text_el = $('<p class="status-text">Accepting requests: (Initiating)</p>');	
	params.status_text_layer = status_text_el;
	
	var ga_stats_iframe_el = $('<iframe src="http://a-creative.github.com/FV-extender/stats.html" width="1" marginwidth="0" height="1" marginheight="0" scrolling="No" frameborder="0" hspace="0" vspace="0"></iframe>');
	center_el.append( status_text_el );
	center_el.append( status_el );
	center_el.append( ga_stats_iframe_el );
	accept_all_status.append( center_el );
	$('body').append( accept_all_status );
	var accept_all_btn = params.accept_all_btn;
	var dialog_x = accept_all_btn.offset().left - 100;
	var dialog_y = accept_all_btn.offset().top + 150;	
	
	chrome.extension.sendRequest( { action: "get_test_mode" }, function( response ) {
		var test_mode = response.test_mode;
		
		var dialog_title = 'FV Extender - Accept requests';
		if ( test_mode ) {
			dialog_title += ' (test mode)';
		}
		
		accept_all_status.dialog({
			position: [ dialog_x, dialog_y ],
			width: 500,
			modal: true,
			title: dialog_title,
			buttons: {
				"Abort" : function() {
					aborted = true;	
					accept_all_status.dialog('close');
					document.location.reload();
				}
			}
		});
		
		params.popup_layer = accept_all_status;
		
		accept_requests( params );
		
	} );
}

function accept_requests( params ) {
	aborted = false;
	
	// Filter requests
	var requests = filter_requests( params.all_requests );

	var count_total = requests.length;
	
	var status_el = params.status_layer;
	var status_text_el = params.status_text_layer;
	
	status_text_el.html( 'Accepting requests: 0 of ' + count_total + ' (0 %)' );
	
	var requests_array = new Array();
	var i = 0;
	requests.each( function() {
		requests_array[ i ] = $(this);
		i++;
	});	
	
	params.requests = requests_array;
	params.count_total = count_total;
	
	accept_request( params );
}	


function accept_request( params ) {
	var requests = params.requests;
	
	var current_request = requests[ 0 ];
	
	// Get request data
	var frm = current_request.find('form');
	
	var action_url = escape($(frm).find('input[type="submit"]:first').attr('name'));
	
	var ajax_params = [
		'charset_test='					+ $(frm).children('input[name=charset_test]').val(),
		'id='							+ $(frm).children('input[name=id]').val(),
		'type='							+ $(frm).children('input[name=type]').val(),
		'status_div_id='				+ $(frm).children('input[name=status_div_id]').val(),
		'params[from_id]='				+ $(frm).find('input[name="params\[from_id\]"]').val(),
		'params[app_id]='				+ '102452128776',
		'params[req_type]='				+ $(frm).find('input[name="params\[req_type\]"]').val(),
		'params[is_invite]='			+ $(frm).find('input[name="params\[is_invite\]"]').val(),
		'lsd',
		'post_form_id_source='			+ 'AsyncRequest',
		 action_url + '='				+ $(frm).find('input[type="submit"]:first').attr('value'),
		'post_form_id='					+ $(frm).find('input[name=post_form_id]').val(),
		'fb_dtsg='						+ $(frm).find('input[name=fb_dtsg]').val()
	];
		
	var data = ajax_params.join( '&' );	
	
	// Let background.html take care of ajax call to actually accept the request
	chrome.extension.sendRequest( { action: "accept_request", data : data }, function( response ) {
		
		var abort_info = '';
		
		if ( response.test_mode != true ) {
		
			//Ajax success
			var result_page = response.result_data;		
			
			if ( result_page ) {
				
				var body_start  = result_page.indexOf('<body>');
				var body_end	= result_page.indexOf('</body>', body_start );
				var body_html = result_page.slice( body_start + 6, body_end );
				
				// Handle limit errors
				if ( body_html.indexOf( 'class="giftLimit"' ) != -1 ) {
					aborted = true;
					
					if ( response.uri.indexOf( 'gift_accept_crafting_ask_for_bushels' ) ) {
						// Handle bushel limit error
						abort_info = 'Bushel limit reached!';	
					} else {				
						
						// Handle general limit error
						abort_info = 'Gift box limit reached!';
					}
				} 
			}
		}
			
		// Remove the processed request
		current_request.remove();
		requests.shift();
					
		// Update status
		var count_status = params.count_total - requests.length;		
		var pct = 0;
		if ( params.count_total > 0 ) {	
			pct = Math.ceil( ( count_status * 100 ) / params.count_total );
		
			params.status_layer.progressbar({
				value : pct	
			});
			
		}
		
		params.status_text_layer.html( 'Accepting requests: ' + count_status +' of ' + params.count_total + ' (' + pct + ' %)' );
		
		// If more items then redo
		if ( ( requests.length > 0 ) && ( aborted == false ) ){
			setTimeout( function() {	
				params.requests = requests;
				accept_request( params );
			}, 500 )
			
		} else if ( aborted ) {
			var abort_text = 'Accepting of request was aborted'
			
			if ( abort_info != '' ) {
				abort_text += ': ' + abort_info;	
			} else {
				abort_text += '!';
			}
			
			params.status_text_layer.html( abort_text );
			
			params.popup_layer.dialog( 'option', 'buttons', {
				"Ok" : function() {
					document.location.reload();	
				}					
			} );	
			
		} else {
			params.status_text_layer.html( 'All ' + params.count_total +' chosen requests accepted ( 100% )' );
			params.popup_layer.dialog( 'option', 'buttons', {
				"Ok" : function() {
					document.location.reload();	
				}					
			} );
		}	
	});
}




















