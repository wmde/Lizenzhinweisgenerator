'use strict';

var Polyglot = require( 'node-polyglot' ),
	i18n = require( '../i18n.json' );

var getParam = function getUrlParameter( sParam ) {
	var sPageURL = decodeURIComponent( window.location.search.substring( 1 ) ),
		sURLVariables = sPageURL.split( '&' ),
		sParameterName,
		i;

	for( i = 0; i < sURLVariables.length; i++ ) {
		sParameterName = sURLVariables[i].split( '=' );

		if( sParameterName[0] === sParam ) {
			return sParameterName[1] === undefined ? true : sParameterName[1];
		}
	}
};

var lang = getParam( 'lang' );
if( lang === undefined ) {
	lang = 'de';
}

module.exports = new Polyglot( { phrases: i18n[ lang ] } );
