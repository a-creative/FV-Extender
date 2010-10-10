var items;


$(document).ready( function() {
	/* get all lists */
	
	lists = $('div.mbl');
	
	var list_header;
	var button_added = false;
	
	var lists = lists.filter( function( index ) {
		
		list_header = $(this).find('>.uiHeader div div  h3');
		
		if ( list_header.length ) {
			if ( list_header.html().match( /\sFarmVille$/ ) ) {
				var accept_all_btn = '<label class="uiButton uiButtonMedium" id="my-accept-all-btn"><input value="Accept all" type="submit"></label>'
				
				list_header.html( list_header.html() + accept_all_btn );
				$('#my-accept-all-btn').click( function() {
					my_accept_all()
				});
							
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
		
		if ( items.length ) {		
			chrome.extension.sendRequest( { get_accept_all: true }, function( response ) {
				if ( response.accept_all ) {
					my_accept_all();						
				}				
			});
		} else 	{
			chrome.extension.sendRequest( { set_accept_all: true, accept_all: false }, function( response ) {} );		
		}
	} else if ( document.location.href.match( /\/reqs\.php/i ) ) {
		chrome.extension.sendRequest( { set_accept_all: true, accept_all: false }, function( response ) {} );	
	}
	
	/* avoid link error message */
	if ( document.location.href.match( /reqType=yes&clickSrc=$/ ) ) {
		document.location.replace('http://www.facebook.com/reqs.php');
	}
	
	/* avoid gifterror message */
	if ( document.location.href.match( /gifterror=notfound/ ) ) {
		document.location.replace('http://www.facebook.com/reqs.php');
	}
	
	/* activate yes button if avaiable and accept all is not enabled*/
	var yes_el = $('.morePending_bttn input[value=Yes]');
	if ( yes_el.length ) {
		
		if ( document.location.href.match( /sentthankyougift.php/i ) ) {
			yes_el.first().click();
		} else {
			chrome.extension.sendRequest( { get_accept_all: true }, function( response ) {
				if ( response.accept_all ) {
					yes_el.first().click();
				}
			} );
		}
	}
	
	/* avoid oh no message */
	$('h1').each( 
		function(index, Element) {
		if ( $(this).html().match( /Oh no/i ) ) {
			document.location.replace('http://www.facebook.com/reqs.php');
		}	
	} );
	
	if ( ! ( document.location.href.match( /reward.php/i ) ) ) {
		var ok_el = $('input[value=OK]').first();
		if ( ok_el.length ) {
			document.location.replace('http://www.facebook.com/reqs.php');
		}	
	}
	
});


function my_accept_all() {
	/* Filter elements. Gifts, bushels, barnraisings and not shovels (ptm, pvm og IKKE pbm) */
	
	if ( items.length ) {
		/* activate first element if elements are available*/
		var el = items.first();
		
		var accept_btn = $(el).find('input[type=submit]').first();
		accept_btn.click();
	}
	
	chrome.extension.sendRequest( { set_accept_all: true, accept_all: true }, function( response ) {});
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