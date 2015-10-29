'use strict';

var Handlebars = require( 'hbsfy/runtime' ),
	Messages = require( './app/Messages' );

Handlebars.registerHelper( 'translate', function( s ) {
	return Messages.t( s );
} );
