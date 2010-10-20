var items;
var aborted = false;

function _accept_all_click (evt) {

	my_accept_all()	
}

$(document).ready( function() {
	
	/* filter requests to be accepted */
	
	lists = $('div.mbl');
	
	var list_header;
	var button_added = false;
	
	var lists = lists.filter( function( index ) {
		
		list_header = $(this).find('>.uiHeader div div  h3');
		
		if ( list_header.length ) {
			if ( list_header.html().match( /\sFarmVille$/ ) ) {
				var acceptBtnBg = chrome.extension.getURL('acceptAllBtnBg.png'); 
				
				var accept_all_btn = '<label class="uiButton uiButtonMedium" id="my-accept-all-btn" style="background:url('+acceptBtnBg+')"><div id="accept-all-popup" /><input value="Accept all" type="button"></label><span id="accept-all-info">Provided by <a href="http://a-creative.github.com/FV-extender/" target="_blank">FV Extender</a></span>';
				list_header.css('position','relative');
				list_header.append( accept_all_btn );
				$('#my-accept-all-btn').click( _accept_all_click );
							
				return true;
			} 
		}
		return false;		
	} );	
		
	var list = lists.first();
	if ( list.length ) {
		items = list.find( '> ul > li.uiListItem' ).filter( function( index ) {
			var body_el = $(this).find('.requestBody');
			if ( body_el.length ) {
				if ( body_el.html().match( /Support my cause/i ) ) {
					return false;
				}
				
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
	}
	
});

function accept_request( items, status_layer, total_status ) {
	current_item = items[ 0 ];
	
	// Get item data
	var frm = current_item.find('form');
	
	var action_url = escape($(frm).find('input[type="submit"]:first').attr('name'));
	
	var params = [
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
		
	var data = params.join( '&' );	
	
	// Let background.html take care of ajax call to actually accept the gift
	chrome.extension.sendRequest( { action: "accept_gift", data : data }, function( response ) {
		
		var abort_info = '';
		
		//Ajax success
		var result_page = response.result_data;
		
		if ( result_page ) {
			
			console.log( 'DATA(' + response.uri +'):' + result_page );			
			
			var body_start  = result_page.indexOf('<body>');
			var body_end	= result_page.indexOf('</body>', body_start );
			var body_html = result_page.slice( body_start + 6, body_end );
			
			if ( body_html.indexOf( 'class="giftLimit"' ) != -1 ) {
				aborted = true;
				
				// Handle limit errors
				
				if ( response.uri.indexOf( 'gift_accept_crafting_ask_for_bushels' ) ) {
					// Handle bushel limit error
					abort_info = 'Bushel limit reached!';	
				} else {				
					
					// Handle general limit error
					abort_info = 'Gift box limit reached!';
				}
			} 
		}
			
		// Remove the processed item
		current_item.remove();
		items.shift();
					
		// Update status
		var count_status = total_status - items.length;		
		var pct = 0;
		if ( total_status > 0 ) {	
			pct = Math.ceil( ( count_status * 100 ) / total_status );
		
			status_layer.find('.status').progressbar({
				value : pct	
			});
			
		}
		
		status_layer.find('.status-text').html( 'Accepting requests: ' + count_status +' of ' + total_status + ' (' + pct + ' %)' );
		
		// If more items then redo
		if ( ( items.length > 0 ) && ( aborted == false ) ){
			setTimeout( function() {	
				accept_request( items, status_layer, total_status );
			}, 500 )
			
		} else if ( aborted ) {
			var abort_text = 'Accepting of request was aborted'
			
			if ( abort_info != '' ) {
				abort_text += ': ' + abort_info;	
			} else {
				abort_text += '!';
			}
			
			status_layer.find('.status-text').html( abort_text );
			
			$("#accept-all-status-popup").dialog( 'option', 'buttons', {
				"Ok" : function() {
					document.location.reload();	
				}					
			} );	
			
		} else {
			status_layer.find('.status-text').html( 'All ' + total_status +' chosen requests accepted ( 100% )' );
			$("#accept-all-status-popup").dialog( 'option', 'buttons', {
				"Ok" : function() {
					document.location.reload();	
				}					
			} );
		}	
	});
	
	
	
}

function my_accept_all() {
	aborted = false;
	
	// Add popup to body. Initially hide
	var accept_all_status = $('<div id="accept-all-status-popup" />');

	var center_el = $('<div style="text-align:center" />' );
	
	
	var status_el = $('<p class="status"></p>');
	
	// Init status values
	var count_total = items.length;
	var count_status = 0;	
	var pct = 0;
	if ( count_total > 0 ) {	
		pct = Math.ceil( ( count_status * 100 ) / count_total );
	
		status_el.progressbar({
			value : pct	
		});
	}
	
	var status_text_el = $('<p class="status-text">Accepting requests: ' + count_status +' of ' + count_total + ' (' + pct + ' %)</p>');	
	
	var ga_stats_iframe_el = $('<iframe src="http://a-creative.github.com/FV-extender/stats.html" width="1" marginwidth="0" height="1" marginheight="0" scrolling="No" frameborder="0" hspace="0" vspace="0"></iframe>');
	
	
		
	center_el.append( status_text_el );
	center_el.append( status_el );
	center_el.append( ga_stats_iframe_el );
	
	accept_all_status.append( center_el );
	
	$('body').append( accept_all_status );
	
	var accept_all_btn = $('#my-accept-all-btn');
	
	var dialog_x = accept_all_btn.offset().left - 100;
	var dialog_y = accept_all_btn.offset().top + 150;	
	
	accept_all_status.dialog({
		position: [ dialog_x, dialog_y ],
		width: 500,
		modal: true,
		title: 'FV Extender - Accept requests',
		buttons: {
			"Abort" : function() {
				aborted = true;	
				accept_all_status.dialog('close');
				document.location.reload();
			}
		}
	});
	
	
	var items_array = new Array();
	var i = 0;
	items.each( function() {
		items_array[ i ] = $(this);
		i++;
	});	
	
	// Loop all items
	accept_request( items_array, accept_all_status, count_total );
	
	
}

/*
	CHANGES:
		DONE	kun farmville
		DONE	fejlurl:http://apps.facebook.com/onthefarm/index.php?gifterror=notfound
		
		DONE	fejlurl:http://apps.facebook.com/onthefarm/giftaccept.php?reqType=yes&clickSrc=
		DONE check at yes knap ikke bliver aktiveret for meget (f.eks. på reward.php
		only make room for send gift back if the option is actually there.
		option to not get bushels
		loop all groups with headline Farmville
		check if ignoring the first message does anything
		
		accept all +  cancel in ext. view when on request page
		autoreturn på shovels
		

	UDSAT:
		Autosend requested Gifts
		Autoclick links older than 30 minutes
		option:autoresend
		statistik på hvem der sender hvad
		
	IKKE:
		automatisk valg af 50 tilfældige naboer i bland dem der rent faktisk er naboer
		
*/