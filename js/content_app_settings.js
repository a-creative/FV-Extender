function changes_detected( ) {
	
	var close_btn = jQuery( ".app-access-table label.uiButton input[type='submit']:visible" );
	
	if ( close_btn && close_btn.length ) {
		
		if_not_detected( close_btn, function( close_btn ) {
			
			var app_li = close_btn.closest( '.fbApplicationsListItem' );
			var app_id = app_li.attr( 'id' ).split('-')[2];
			
			var btn_row = close_btn.closest("tbody");
						
			var row =
			+	'<tbody id="FVE-app-' + app_id + '>'
			+		'<tr>'
			+			'<td class="label" style="padding-top:10px;padding-bottom:10px">FV Extender:</td>'
			+			'<td class="data" style="padding-top:10px;padding-bottom:10px">'		
			+				'<table class="uiGrid" cellspacing="0" cellpadding="0">'
			+					'<tbody>'
			+						'<tr><td class="app-permissions-bucket">'
			+						'<div class="UIImageBlock_Content UIImageBlock_ICON_Content">'
			+							'<div class="gdp_permission_title fsl fwb fcb">Label</div>'
			+							'<div id="text_selector"><div class="fsm fwn fcg">Description</div></div>'
			+						'</div>'
			+						'</td>'
			+						'<td class="app-required-info" style="width:56px"><div class="fsm fwn fcg"><label class="uiLinkButton async_throbber"><input type="button" value="Button" class="enter_submit_target stat_elem"></label></div></td>'
			+						'</tr>'
			+					'</tbody>'
			+				'</table>'
			+			'</td>'
			+		'</tr>'
			+		'<tr class="spacer"><td colspan="2"><hr></td></tr>'
			+	'</tbody>';
			
			$(row).insertBefore( btn_row);
			
		} );
	}
}

run_detect_changes();