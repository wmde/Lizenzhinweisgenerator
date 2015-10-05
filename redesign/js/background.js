'use strict';

var $ = require( 'jquery' ),
	images = require( '../data/background_images.json' );

var daysSince1970 = Math.round(
	( new Date() ).getTime() / ( 60 * 1000 * 60 * 24 )
);

var imageNr = daysSince1970 % images.length;

$( '#attribution' ).html( images[ imageNr ].attribution );
$( '#landing-screen' ).css(
	'background-image',
	'url(' + images[ imageNr ].url + ')'
);
