function group_request( request ) {
	var matches;
	if ( matches = request['action_url'].match( /&gift=([^&]+)&/i ) ) {
		request[ 'gift_id' ] = matches[ 0 ];
	}	
	
	// Is wish grant
	console.log('action url:' + request['action_url'] );
	if ( request['action_url'] && request['action_url'].match( /ref\=gift_accept_friend_gift/i ) ) {
		console.log('IsWishGrant');
		request[ 'IsWishGrant' ] = true;
	}
	
	// Is seed
	if ( ( request[ 'gift_id' ] ) && ( request[ 'gift_id' ].match( /seedpackage$/ ) ) ) {
		request[ 'IsSeed' ] = true;	
	}
	
	// It thank you gift
	if ( request['text'] && request['text'].match( /^Thank you for your gift/i ) ) {
		request[ 'IsThankYouGift' ] = true;
	}
	
	// Is material request		
	if ( request['action_url'] && request['action_url'].match( /sendmats\.php/ ) ) {
		request[ 'IsMaterialRequest' ] = true;
	}
	
	// Is one way gift
	if ( request['text'] && request['text'].match( /(?:don\'t|do not) (?:resend|send back)/ ) ) {
		request[ 'IsOneWayGift' ] = true;
	} 
	
	// Is shovel request
	if ( request['text'] && request['text'].match( /collecting Shovels in FarmVille/ ) ) {
		request[ 'IsShovelRequest' ] = true;
	} 
	
	// Is neigbor request
	if ( request['action_url'] && request['action_url'].match( /addneighbor\.php/ ) ) {
		request[ 'IsNeighborRequest' ] = true;	
	}
	
	// Has user text
	if ( request['user_text'] && request['user_text'] != '' ) {
		request[ 'HasUserText' ] = true;	
	} 
	
	// Is send by FV extender
	if ( request['user_text'] && request['user_text'].match( /This gift was returned by FV Extender/ ) ) {
		request[ 'IsSendByFvExtender' ] = true;				  
	}
	
	// Is bushel
	if ( request['action_url'] && request['action_url'].match( /gift_accept_crafting_ask_for_bushels/ ) ) {
		request[ 'IsBushel' ] = true;	
	}		
	
	return request;
}

function request_to_string( game_request ) {
	return game_request[ 'gift_id'] + ' : ' + game_request['profile_name']
}