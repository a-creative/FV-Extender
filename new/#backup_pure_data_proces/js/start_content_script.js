/* Detects changes in DOM and runs main() in main_content_script.js when ready */

var current_requests;

function accept_and_return_test( request_id, request_form, sendResponse ) {
	var cand_request_id = $(request_form).children('input[name=status_div_id]').val(); 		
	//alert( 'Comparing: "' + request_id + '"<>"' + cand_request_id + '" = ' + ( request_id == cand_request_id ) );
	if ( request_id == cand_request_id ) {
		//alert('accept_and_return request found');
		var accept_btn = $(request_form).find('input[type="submit"]:first');
		
		if ( sendResponse ) {
			sendResponse( {} );
		}
		
		accept_btn.click();
		return false;
	} else {
		return true;
	}	
}

chrome.extension.onRequest.addListener( function(request, sender, sendResponse) {
	if ( request.action == 'accept_and_return' ) {
		
		if ( current_requests ) {		
			current_requests.each( function() {
				var request_frm = $(this).find('form');
				return accept_and_return_test( request.request_id, request_frm, sendResponse );	
			});	
		} 
	} else if ( request.action == 'remove_request' ) {
		if ( current_requests ) {
			current_requests.each( function() {
				var frm = $(this).find('form');
				var request_id = $(frm).children('input[name=status_div_id]').val(); 
				
				if ( request_id == request.request_id ) {
					$(this).remove();
					sendResponse( {} );
					return false;
				}			
			});
		}
	}	
});

$(document).ready( function() {
	if ( document.location.href.match( /\/reqs\.php/i ) ) {
		chrome.extension.sendRequest( { action: "accept_and_return_response" })		
	}
	
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
		function work(){
			removeWorker();
			main();
			addWorker();
		}
	
		var workLast = callLast(work);
		function addWorker(){       document.addEventListener("DOMSubtreeModified", workLast, false); }
		function removeWorker(){ document.removeEventListener("DOMSubtreeModified", workLast, false); } 
		function startWork(){ addWorker(); workLast(); }
	
		startWork();
	}
});



















