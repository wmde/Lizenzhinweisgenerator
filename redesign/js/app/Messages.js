'use strict';

var Polyglot = require( 'node-polyglot' ),
	i18n = require( '../i18n.json' );

module.exports = new Polyglot( { phrases: i18n[ 'de' ] } );
