function group_request( request ) {
	var matches;
	if ( matches = request['action_url'].match( /%26gift%3D([^%]+)%26/i ) ) {
		request[ 'gift_id' ] = matches[ 1 ];
	}	
	
	console.log( 'gift:' + request[ 'gift_id' ] );
	
	var log_types = new Array();
	
	// Is wish grant
	if ( request['action_url'] && request['action_url'].match( /ref%3Dgift_accept_friend_gift/i ) ) {
		log_types.push('IsWishGrant' );
		request[ 'IsWishGrant' ] = true;
	}
	
	// Is seed
	if ( ( request[ 'gift_id' ] ) && ( request[ 'gift_id' ].match( /seedpackage$/ ) ) ) {
		log_types.push('IsSeed' );
		request[ 'IsSeed' ] = true;	
	}
	
	// It thank you gift
	if ( request['text'] && request['text'].match( /^Thank you for your gift/i ) ) {
		log_types.push('IsThankYouGift' );
		request[ 'IsThankYouGift' ] = true;
	}
	
	// Is material request		
	if ( request['action_url'] && request['action_url'].match( /sendmats\.php/ ) ) {
		log_types.push('IsMaterialRequest' );
		request[ 'IsMaterialRequest' ] = true;
	}
	
	// Is one way gift
	if ( request['text'] && request['text'].match( /(?:don\'t|do not) (?:resend|send back)/ ) ) {
		log_types.push('IsOneWayGift' );
		request[ 'IsOneWayGift' ] = true;
	} 
	
	// Is shovel request
	if ( request['text'] && request['text'].match( /collecting Shovels in FarmVille/ ) ) {
		log_types.push('IsShovelRequest' );
		request[ 'IsShovelRequest' ] = true;
	} 
	
	// Is neigbor request
	if ( request['action_url'] && request['action_url'].match( /addneighbor\.php/ ) ) {
		log_types.push('IsNeighborRequest' );
		request[ 'IsNeighborRequest' ] = true;	
	}
	
	// Has user text
	if ( request['user_text'] && request['user_text'] != '' ) {
		log_types.push('HasUserText' );
		request[ 'HasUserText' ] = true;	
	} 
	
	// Is send by FV extender
	if ( request['user_text'] && request['user_text'].match( /This gift was returned using FV Extender/ ) ) {
		log_types.push('IsSendByFvExtender' );
		request[ 'IsSendByFvExtender' ] = true;				  
	}
	
	// Is bushel
	if ( request['action_url'] && request['action_url'].match( /gift_accept_crafting_ask_for_bushels/ ) ) {
		log_types.push('IsBushel' );
		request[ 'IsBushel' ] = true;	
	}		
	
	console.log( 'types:' + log_types.join( ', ' ) )
	
	return request;
}

function request_to_string( game_request ) {
	return game_request[ 'gift_id'] + ' : ' + game_request['profile_name']
}