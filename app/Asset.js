( function( define ) {
'use strict';

define( ['jquery'], function( $ ) {

/**
 * Represents a Commons asset.
 * @constructor
 *
 * @param {string} filename
 * @param {string} title
 * @param {Licence|null} licence
 * @param {Api} api
 * @param {Object} [attributes]
 *
 * @throws {Error} if a required parameter is not defined.
 */
var Asset = function( filename, title, licence, api, attributes ) {
	if( !filename || !title || !licence || !api ) {
		throw new Error( 'No proper initialization parameters specified' );
	}

	this._filename = filename;
	this._title = title;
	this._licence = licence;
	this._api = api;

	attributes = attributes || {};

	this._descriptions = attributes.descriptions || null;
	this._authors = attributes.authors || null;
	this._source = attributes.source || null;
	this._attribution = attributes.attribution || null;

	this._imageInfo = {};
};

$.extend( Asset.prototype, {
	/**
	 * @type {string}
	 */
	_filename: null,

	/**
	 * @type {string}
	 */
	_title: null,

	/**
	 * @type {Licence|null}
	 */
	_licence: null,

	/**
	 * @type {Api}
	 */
	_api: null,

	/**
	 * @type {Object|null}
	 */
	_descriptions: null,

	/**
	 * @type {Author[]|null}
	 */
	_authors: null,

	/**
	 * @type {string|null}
	 */
	_source: null,

	/**
	 * @type {string|null}
	 */
	_attribution: null,

	/**
	 * @type {Object}
	 */
	_imageInfo: null,

	/**
	 * @return {string}
	 */
	getFilename: function() {
		return this._filename;
	},

	/**
	 * @return {string}
	 */
	getTitle: function() {
		return this._title;
	},

	/**
	 * @return {Licence|null}
	 */
	getLicence: function() {
		return this._licence;
	},

	/**
	 * @return {Object}
	 */
	getDescriptions: function() {
		return this._descriptions;
	},

	/**
	 * @param {string} languageCode
	 * @return {string|null}
	 */
	getDescription: function( languageCode ) {
		if( !this._descriptions ) {
			return null;
		}
		return this._descriptions[languageCode] || null;
	},

	/**
	 * @param {options} [options]
	 * @return {string[]|string}
	 */
	getAuthors: function( options ) {
		options = options || {};

		if( !options.format !== 'string' ) {
			return this._authors;
		}

		return this._authors.join( '; ' );
	},

	/**
	 * @return {string}
	 */
	getSource: function() {
		return this._source;
	},

	/**
	 * @return {string}
	 */
	getAttribution: function() {
		return this._attribution;
	},

	/**
	 * Retrieves the asset's image information.
	 *
	 * @param {number} imageSize
	 * @return {Object} jQuery Promise
	 *         Resolve parameters:
	 *         - {Object} Image information received from the API.
	 *         Rejected parameters:
	 *         - {string} Error message.
	 */
	getImageInfo: function( imageSize ) {
		var self = this,
			deferred = $.Deferred();

		if( this._imageInfo[imageSize] ) {
			deferred.resolve( this._imageInfo[imageSize] );
		} else {
			this._api.getImageInfo( this._filename, imageSize )
			.done( function( imageInfo ) {
				self._imageInfo[imageSize] = imageInfo;
				deferred.resolve( imageInfo );
			} )
			.fail( function( message ) {
				deferred.reject( message );
			} );
		}

		return deferred.promise();
	}

} );

return Asset;

} );

}( define ) );
