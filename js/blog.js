var months = [ 'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December' ];

function unixTimestampToStr( unix_timestamp_sec ) {
						
	var js_timestamp_ms = unix_timestamp_sec * 1000;			//	milliseconds
	
	var timestamp = new Date( js_timestamp_ms );
	
	// Format date
	var yesterday = new Date();
	yesterday.setTime( yesterday.getTime() - 86400000 );
	yesterday.setSeconds(59);
	yesterday.setMinutes(59);
	yesterday.setHours(23);
	
	var before_yesterday = new Date();
	before_yesterday.setTime( yesterday.getTime() - 86400000 );
	
	var date_str = months[ timestamp.getMonth() ] + ' ' + timestamp.getDate();
	
	// Format time
	var l_time_str = timestamp.toLocaleTimeString();
	var time_str;
	var matches = l_time_str.match( /(\d{2}:\d{2}):\d{2}\s?(am|pm)?/i );						
	if ( matches ) {
		time_str = matches[ 1 ];
		if ( matches[ 2 ] ) {
			time_str += matches[ 2 ];
		}
	} else {
		time_str = l_time_str;
	}
	
	return ( date_str + ' - ' + time_str );
}

function _aknUpdateAndBlogBtnClicked( evt ) {
	akn_update( evt, true );
	
}

function _aknUpdateBtnClicked( evt ) {
	akn_update( evt, false );
}

function akn_update ( evt, show_blog ) {
	
	bgp.localStorage[ 'last_info_update' ] = new Date().getTime();
	$('#blog-updates-pop-down').slideUp();	
	if ( show_blog ) {
		window.open( 'http://a-creative.dk', '_blank' );	
	} 
	
	evt.preventDefault();
}

function show_blog_updates_pop_down( result ) {
	
	var post_els = $(result).find('post');
	if ( post_els.length ) {
	
		// Play sound
		document.getElementById('show-blog-update-snd').play();
		
		// Loop posts
		var headline;
		var timestamp;
		var posts_parts = [];
		post_els.each(function(){
			headline = $(this).find( 'headline' ).text();
			timestamp_sec = $(this).find( 'timestamp_sec' ).text();
			
			// Convert timestamp to local string
			var time_str = unixTimestampToStr( timestamp_sec );
			
			posts_parts.push( time_str + ' - ' + headline );
		});
		
		$('#blog-updates-pop-down .posts').html( posts_parts.reverse().join( '<br />' ) );
		
		$('#blog-updates-pop-down .read-more').show();
		
		// Show pop down
		
		$('#blog-updates-pop-down').slideDown();
		
		bgp.localStorage[ 'last_info_update' ] = new Date().getTime();
		
	} else {
		$('.beta-notice').css('display','block');
	}
}

function check_for_blog_updates() {
	
	var last_info_update = bgp.localStorage[ 'last_info_update' ];
	
	if ( (!last_info_update) || ( last_info_update === 'undefined' ) ) {
		last_info_update = 0;
		bgp.localStorage[ 'last_info_update' ] = last_info_update;
	}
	
	// Request server
	jQuery.ajax( {
		type: "get",
		url: "http://a-creative.dk/wp/getLatestPostsInfo.php",
		data: { "timestamp_ms" : last_info_update },
		success: function( result ) {
			
			show_blog_updates_pop_down( result );	
		},
		error: function() {
			// Play sound
			document.getElementById('show-blog-update-snd').play();
			
			$('#blog-updates-pop-down .posts').html( 'Could not check for new blog posts. Please report this to stay updated. (code:' + err + ')' );
			$('#blog-updates-pop-down .read-more').hide();
			$('#blog-updates-pop-down').slideDown();	
		},
		cache: false,
		dataType: "xml",
		timeout: 3000
	});
}