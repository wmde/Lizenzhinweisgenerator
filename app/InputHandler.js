( function( define ) {
'use strict';

define( ['jquery'], function( $ ) {

	/**
	 * Returns a filename by analyzing input.
	 * @constructor
	 */
var InputHandler = function( api ) {
	this._api = api
};

$.extend( InputHandler.prototype, {
	/**
	 * @type {Api}
	 */
	_api: null,

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
				self._extractFilenames( url )
				.done( function( filenames ) {
					deferred.resolve( filenames );
				} )
				.fail( function( message ) {
					deferred.reject( message );
				} );
			} )
			.fail( function( message ) {
				deferred.reject( message );
			} );
		} else if( typeof input === 'string' ) {
			return this._extractFilenames( input );
		} else {
			deferred.reject( 'Cannot handle input' );
			console.error( 'Cannot handle input:' );
			console.error( input );
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

		if( event.type !== 'drop' || !event.dataTransfer ) {
			deferred.reject( 'Unsupported event' );
			return deferred.promise();
		}

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
	 * Evaluates an URL an extracts the filename from it, if the URL referes to a specific file. If
	 * the URL corresponds to a Wikipedia page, file info objects for the images used on the page
	 * are returned in the promise object.
	 *
	 * @param url
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {string|Object[]} Filename or file info objects
	 *         Rejected parameters:
	 *         - {string} Error message
	 */
	_extractFilenames: function( url ) {
		var deferred = $.Deferred();

		if( url.indexOf( '.wikipedia.org/wiki/' ) !== -1 ) {
			return this._getWikipediaPageImagesFileInfo( url );
		}

		deferred.resolve( this._extractFilename( url ) );

		return deferred.promise();
	},

	/**
	 * Extracts a filename out of an URL string.
	 *
	 * @param {string} url
	 * @return {string}
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
	},

	/**
	 * Retrieves file info for all images used on a specific Wikipedia page.
	 *
	 * @param {string} url
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {Object} Image info
	 *         Rejected parameters:
	 *         - {string} Error message
	 */
	_getWikipediaPageImagesFileInfo: function( url ) {
		var self = this,
			deferred = $.Deferred(),
			segments = url.split( '/' ),
			title = segments[segments.length - 1];

		this._api.getWikipediaPageImageInfo( '//' + segments[2] + '/', title )
		.done( function( imageInfos ) {
			var fileInfos = [];

			for( var i = 0; i < imageInfos.length; i++ ) {
				imageInfos[i].filename = self._extractFilename( imageInfos[i].descriptionurl );
				fileInfos.push( imageInfos[i] );
			}

			deferred.resolve( fileInfos );
		} )
		.fail( function( message ) {
			deferred.reject( message );
		} );

		return deferred.promise();
	}
} );

return InputHandler;

} );

}( define ) );
