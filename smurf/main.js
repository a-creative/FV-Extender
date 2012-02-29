var smurfs = {
	'astro' : 	{ min: 0, sec: 4, song: "01 De Foeste Kaerester Paa Maanen" },
	'kokke' : 	{ min: 0, sec: 4, song: "05 Buster" },
	'dydig' : 	{ min: 0, sec: 9.5, song: "07 Kun Dig" },
	'smoelfine':{ min: 0, sec: 5, song : "1-11 Jeg' I Live (2011)" },
	'staerk' : 	{ min: 0, sec: 4.5, song : "17 Tro Paa Dig Selv" },
	'gammel' : 	{ min: 0, sec: 4, song: "1-09 Soevnloes" },
	'pynte' : 	{ min: 0, sec: 7, song: "01 Der staar et billede af dig paa mit bord" },
	'baby' : 	{ min: 0, sec: 5, song: "05 Nu smoelfer festen" },
	'maler' : 	{ min: 0, sec: 3.5, song: "01 Hvad Nu Hvis" },
	'musik' : 	{ min: 0, sec: 4.5, song: "04 Party Rock Anthem" },
	'digter' : 	{ min: 0, sec: 3, song: "04 Kald Det Kaerlighed" },
	'bonde' : 	{ min: 0, sec: 4.5, song: "24 Saadan Nogen Som Os" },
	'doven' : 	{ min: 0, sec: 7, song: "03 Kegle" },
	'gnaven' : 	{ min: 0, sec: 4, song: "01 Det Bedste Til Sidst" },
	'altmulig' :{ min: 0, sec: 4, song: "01 Nu skal vi smoelfe" }
};


var current_playing_src = null;

var smurf_intro = {};
var smurf_song = {};

window.load = new function() {

	for ( var smurf in smurfs ) {
		
		smurf_intro[ smurf ] = document.createElement("audio");
		smurf_intro[ smurf ].src = 'audio/' + smurf + '.mp3';
		
		smurf_song[ smurf ] = document.createElement("audio");
		smurf_song[ smurf ].src = 'songs/' + smurfs[ smurf ].song + '.mp3';		
	
	}
	
};

function plays( smurf ) {
	
	if ( current_playing_src !== null ) {
		current_playing_src.currentTime = 0;
		current_playing_src.pause();
	}
	
	smurf_intro[ smurf ].play();
	setTimeout( function() {
		
		smurf_song[ smurf ].play();
		current_playing_src = smurf_song[ smurf ];
		
	}, ( smurfs[ smurf ].min * 1000 * 60 ) + ( smurfs[ smurf ].sec * 1000 ) );
	
	current_playing_src = smurf_intro[ smurf ];
}