'use strict';

var $ = require( 'jquery' );

var daysSince1970 = Math.round(
	( new Date() ).getTime() / ( 60 * 1000 * 60 * 24 )
);

$.getJSON( 'data/background_images.json' )
	.done( function( images ) {
		var imageNr = daysSince1970 % images.length;

		$( '#attribution' ).html( images[ imageNr ].attribution );
		$( '#landing-screen' ).css(
			'background-image',
			'url(' + images[ imageNr ].url + ')'
		);
	} );
