function toggle_FVE_app( app_id ) {
	
	chrome.extension.sendRequest( { "action" : "toggle_fve_for_app", "app_id" : app_id }, function( active ) {
		
		var btn = $('#FVE-activate-btn-' + app_id );	
		if ( active ) {
			btn.val( "De-activate" )
		} else {
			btn.val( "Activate" );
		}
	} );	
}

function changes_detected( ) {
	
	var close_btn = jQuery( ".app-access-table label.uiButton input[type='submit']:visible" );
	
	if ( close_btn && close_btn.length ) {
		
		if_not_detected( close_btn, function( close_btn ) {
			
			var app_li = close_btn.closest( '.fbApplicationsListItem' );
			var app_id = app_li.attr( 'id' ).split('-')[2];
			
			var btn_row = close_btn.closest("tbody");
					
			chrome.extension.sendRequest( { "action" : "toggle_fve_for_app", "app_id" : app_id, "get_status" : true }, function( active ) {
				
				var btn_text = 'Activate';
				if ( active ) {
					btn_text = 'De-activate';
				}					
						
				var row =
				+	'<tbody id="FVE-app-' + app_id + '>'
				+		'<tr>'
				+			'<td class="label" style="padding-top:10px;padding-bottom:10px">FV Extender:</td>'
				+			'<td class="data" style="padding-top:10px;padding-bottom:10px">'		
				+				'<table class="uiGrid" cellspacing="0" cellpadding="0">'
				+					'<tbody>'
				+						'<tr><td class="app-permissions-bucket">'
				+						'<div class="UIImageBlock_Content UIImageBlock_ICON_Content">'
				+							'<div class="gdp_permission_title fsl fwb fcb">Activate FVE</div>'
				+							'<div id="text_selector"><div class="fsm fwn fcg">Includes this application when processing requests with FV Extender.</div></div>'
				+						'</div>'
				+						'</td>'
				+						'<td class="app-required-info" style="width:56px"><div class="fsm fwn fcg"><label class="uiLinkButton async_throbber"><input type="button" value="' + btn_text + '" app-id="' + app_id + '" id="FVE-activate-btn-' + app_id + '" class="enter_submit_target stat_elem"></label></div></td>'
				+						'</tr>'
				+					'</tbody>'
				+				'</table>'
				+			'</td>'
				+		'</tr>'
				+		'<tr class="spacer"><td colspan="2"><hr></td></tr>'
				+	'</tbody>';
				
				$(row).insertBefore( btn_row);
				
				$('#FVE-activate-btn-' + app_id ).click( function() {
					toggle_FVE_app( app_id )
				});
			} );
			
		} );
	}
}




run_detect_changes();