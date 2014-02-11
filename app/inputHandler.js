( function( define ) {
'use strict';

define( ['jquery'], function( $ ) {

	/**
	 * Returns a filename by analyzing input.
	 * @constructor
	 */
var InputHandler = function() {};

$.extend( InputHandler.prototype, {

	/**
	 * Tries to retrieve a filename evaluating the input parameter.
	 *
	 * @param {string|jQuery.Event} input May be a Commons URL or a drop event.
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {string} Filename
	 *         Rejected parameters:
	 *         - {string} Error message
	 */
	getFilename: function( input ) {
		var self = this,
			deferred = $.Deferred();

		if( input instanceof $.Event ) {
			this._getUrlFromEvent( input )
			.done( function( url ) {
				deferred.resolve( self._extractFilename( url ) );
			} )
			.fail( function( message ) {
				deferred.reject( message );
			} );
		} else if( typeof input === 'string' ) {
			deferred.resolve( this._extractFilename( input ) );
		} else {
			throw new Error( 'Cannot handle "' + input + '"' );
		}

		return deferred.promise();
	},

	/**
	 * Extracts the URL from a drop event.
	 *
	 * @param {jQuery.Event} event
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {string} File URL
	 *         Rejected parameters:
	 *         - {string} Error message
	 */
	_getUrlFromEvent: function( event ) {
		var deferred = $.Deferred();

		if(
			event.dataTransfer.items !== undefined
			&& event.dataTransfer.items[0] !== undefined
			&& event.dataTransfer.items[0].getAsString !== undefined
		) {
			event.dataTransfer.items[0].getAsString( function( url ) {
				deferred.resolve( url )
			} );
		} else {
			var img = event.dataTransfer.getData( 'text/html' );
			deferred.resolve( $( '<div/>' ).html( img ).find( 'img' ).attr( 'src' ) );
		}

		return deferred.promise();
	},

	/**
	 * Extracts a filename out of an URL string.
	 *
	 * @param url
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {string} Filename
	 *         Rejected parameters:
	 *         - {string} Error message
	 */
	_extractFilename: function( url ) {
		var segments = url.split( '/' );

		var filename = ( $.inArray( 'thumb', segments ) !== -1 )
			? segments[segments.length - 2]
			: segments[segments.length - 1];

		filename = decodeURIComponent( filename );

		// Strip "File:"
		filename = filename.replace( /^[A-Z][a-z]+:/ , '' ) ;

		filename = filename.replace ( /_/g , ' ' ) ;

		return filename;
	}
} );

return new InputHandler();

} );

}( define ) );
