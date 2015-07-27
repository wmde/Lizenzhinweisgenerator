/**
 * @licence GNU GPL v3
 * @author Leszek Manicki < leszek.manicki@wikimedia.de >
 */
define( ['jquery', 'app/Api', 'dojo/_base/declare', 'app/AjaxError'],
	function( $, Api, declare, AjaxError ) {
'use strict';

/**
 * A mock of Commons API handler (@see Api).
 * Provides locally stored API response data.
 * @constructor
 *
 * @param {string} dataDirectory Directory containing API response data
 */
var LocalApi = declare(Api, {
	constructor: function( dataDirectory ) {
		this._dataDirectory = dataDirectory;
	},

	/**
	 * @type {string}
	 */
	_dataDirectory: null,

	/**
	 * Simulates a call to the API by reading API response data from local file
	 *
	 * @param {string|string[]} title Page title(s)
	 * @param {string} property
	 * @param {string} [wikiUrl]
	 * @param {Object} [params] API request parameter overwrites or additional parameters.
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {Object[]}
	 *         Rejected parameters:
	 *         - {AjaxError}
	 */
	_query: function( title, property, wikiUrl, params ) {
		return this._readFile( this._getLocalFilename( title, property, params ) );
	},

	/**
	 * Returns filename of file containing API response data
	 * for the given page and given API query property and params.
	 *
	 * @param title
	 * @param {string} property
	 * @param {Object} params
	 * @return {string}
	 */
	_getLocalFilename: function( title, property, params ) {
		var subdirectory;

		if ( $.isArray( title ) ) {
			return this._getLocalFilename( title[0], property, params );
		}

		title = this._escapeUrlCharacters( title );

		subdirectory = this._getSubdirectory( property, params );
		return this._dataDirectory + '/' + subdirectory + '/' + this._removeNamespace( title ) + '.json';
	},

	/**
	 * Removes a namespace prefix from title.
	 *
	 * @param title
	 * @return {string}
	 */
	_removeNamespace: function( title ) {
		return title.replace( /^[^:]+:/ , '' );
	},

	/**
	 * Replaces characters having special meaning in URLs to their "safe" equivalents, so pages with titles
	 * containing these characters could be loaded properly.
	 *
	 * @param {string} title
	 * @return {string}
	 */
	_escapeUrlCharacters: function( title ) {
		return title.replace( '?', '%3F' );
	},

	/**
	 * Returns subdirectory under which JSON files respective for the given query property
	 * and parameters are located.
	 *
	 * @param {string} property
	 * @param {Object} params
	 * @return {string}
	 */
	_getSubdirectory: function( property, params ) {
		if ( property === 'imageinfo' ) {
			if ( params.iiprop === 'mediatype|url' ) {
				return 'metadata';
			}
			if ( params.iiurlwidth === 300 ) {
				return 'imageinfo';
			}
		}
		if ( property === 'templates' || property === 'revisions' || property === 'images' ) {
			return property;
		}
	},

	/**
	 * Reads API response data from local file.
	 *
	 * @param {string} filename
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {Object[]}
	 *         Rejected parameters:
	 *         - {AjaxError}
	 */
	_readFile: function( filename ) {
		var deferred = $.Deferred();

		$.getJSON( filename )
		.done( function( data ) {
			deferred.resolve( data );
		} )
		.fail( function() {
			deferred.reject( new AjaxError( 'file-not-exist', {} ) );
		} );

		return deferred.promise();
	}
} );

return LocalApi;

} );