

	// Check if processing is active
	chrome.extension.sendRequest( { "action" : "is_processing" }, function( is_processing ) {
		
		if ( is_processing ) {
			
			// We are in processing mode
			
			// Process next app request
			Process_next();
			
		} else {
			
			// We're done processing
			
			// Insert accept all button to be able to start again
		
			var container = document.getElementById( 'contentArea' );
		
			var fve_el = document.createElement( 'div' );
			fve_el.id = 'fv-extender';
			
			var main_el = document.createElement('div');
			main_el.className = 'main';
			
			var btn_el = document.createElement( 'label' );
			btn_el.className = 'uiButton uiButtonMedium fveButton';
			btn_el.style.background = 'url(' + chrome.extension.getURL('../graphics/acceptAllBtnBg.png') + ')';
			btn_el.innerHTML = '<input value="Process requests" type="button">';
			btn_el.addEventListener( 'click', _processRequestsClicked );
			main_el.appendChild( btn_el );
				
			var btn_el = document.createElement( 'label' );
			btn_el.className = 'uiButton uiButtonMedium fveButton';
			btn_el.style.background = 'url(' + chrome.extension.getURL('../graphics/acceptAllBtnBg.png') + ')';
			btn_el.innerHTML = '<input value="..." type="button">';
			btn_el.addEventListener( 'click', _changeOptionsClicked );
			main_el.appendChild( btn_el );	
			
			fve_el.appendChild( main_el );	
			container.insertBefore( fve_el, container.childNodes[ 0 ] );	
		}
		
	});		
	

	
	
	
	
	
	