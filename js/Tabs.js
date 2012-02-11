var Tabs = {
	openTab : function( options ) {
	
		if ( typeof options.reuse == 'undefined' ) { options.reuse = false };
		
		if ( !options.reuse) {
			
			chrome.tabs.create(
				{
					"url" : options.url
				}
			);		
		} else {
		
			chrome.windows.getCurrent( function( wnd ) {
				
				chrome.tabs.getAllInWindow( wnd.id, function( tabs ) {
					var found_tab;
					
					jQuery.each( tabs, function( i, tab ) {
						
						if ( tab.url.toLowerCase().match( options.url ) ) {
							found_tab = tab;
							return false;
						}
						
						return true;
					} );
					
					if ( found_tab ) {
						chrome.tabs.update( 
							found_tab.id, {
								url: found_tab.url,
								selected: options.selected	
							}
						);
					} else {
						chrome.tabs.create(
							{
								"windowId" : wnd.id,
								"url" : options.url
							}
						);							
					}							
				});	
			} );
		}	
	}
}