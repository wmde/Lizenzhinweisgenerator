/**
 * @licence GNU GPL v3
 * @author snater.com < wikimedia@snater.com >
 */
define( ['jquery'], function( $ ) {
'use strict';

/**
 * Represents a Commons asset.
 * @constructor
 *
 * @param {string} prefixedFilename
 * @param {string} title
 * @param {string} mediaType
 * @param {Licence|null} licence
 * @param {Api} api
 * @param {Object} [optionalAttributes]
 * @param {string} [wikiUrl]
 * @param {string} [url]
 *
 * @throws {Error} if a required parameter is not defined.
 */
var Asset = function(
	prefixedFilename, title, mediaType, licence, api, optionalAttributes, wikiUrl, url
) {
	if( !prefixedFilename || !title || !mediaType || ( !licence && licence !== null ) || !api ) {
		throw new Error( 'No proper initialization parameters specified' );
	}

	this._prefixedFilename = prefixedFilename;
	this._title = title;
	this._mediaType = mediaType;
	this._licence = licence;
	this._api = api;
	this._wikiUrl = wikiUrl || null;
	this._url = url || '';

	if( typeof optionalAttributes === 'string' ) {
		wikiUrl = optionalAttributes;
		optionalAttributes = null;
	}

	optionalAttributes = optionalAttributes || {};

	this._authors = optionalAttributes.authors || [];
	this._$attribution = optionalAttributes.attribution || null;

	this._wikiUrl = wikiUrl || api.getDefaultUrl();

	this._imageInfo = {};
};

$.extend( Asset.prototype, {
	/**
	 * @type {string}
	 */
	_prefixedFilename: null,

	/**
	 * @type {string}
	 */
	_title: null,

	/**
	 * @type {string}
	 */
	_mediaType: null,

	/**
	 * @type {Licence|null}
	 */
	_licence: null,

	/**
	 * @type {Api}
	 */
	_api: null,

	/**
	 * @type {Author[]}
	 */
	_authors: null,

	/**
	 * @type {jQuery|null}
	 */
	_$attribution: null,

	/**
	 * @type {Object}
	 */
	_imageInfo: null,

	/**
	 * @type {string}
	 */
	_wikiUrl: null,

	/**
	 * @return {string}
	 */
	getFilename: function() {
		return this._prefixedFilename.replace( /^[^:]+:/ , '' );
	},

	/**
	 * @return {string}
	 */
	getWikiUrl: function() {
		return this._wikiUrl;
	},

	/**
	 * Returns the asset's URL.
	 * @return {string}
	 */
	getUrl: function() {
		if( this._wikiUrl ) {
			return 'http:' + this._wikiUrl + 'wiki/' + this._prefixedFilename;
		} else {
			if( this._url.indexOf( 'http' ) === 0 ) {
				return this._url;
			} else {
				return 'http://' + this._url;
			}
		}
	},

	/**
	 * @return {string}
	 */
	getTitle: function() {
		return this._title;
	},

	/**
	 * @return {string}
	 */
	getMediaType: function() {
		return this._mediaType;
	},

	/**
	 * @return {Licence|null}
	 */
	getLicence: function() {
		return this._licence;
	},

	/**
	 * @param {options} [options]
	 * @return {Author[]|string}
	 */
	getAuthors: function( options ) {
		options = options || {};

		if( options.format !== 'string' ) {
			return this._authors;
		}

		var authors = [];
		$.each( this._authors, function( index, author ) {
			authors.push( author.getText() );
		} );
		return authors.join( '; ' );
	},

	/**
	 * @param {Author[]} authors
	 */
	setAuthors: function( authors ) {
		this._authors = authors;
	},

	/**
	 * @return {jQuery}
	 */
	getAttribution: function() {
		return this._$attribution ? this._$attribution.clone() : null;
	},

	/**
	 * Retrieves the asset's image information.
	 *
	 * @param {number} imageSize
	 * @return {Object} jQuery Promise
	 *         Resolve parameters:
	 *         - {Object} Image information received from the API
	 *         Rejected parameters:
	 *         - {AjaxError}
	 */
	getImageInfo: function( imageSize ) {
		var self = this,
			deferred = $.Deferred();

		if( this._imageInfo[imageSize] ) {
			deferred.resolve( this._imageInfo[imageSize] );
		} else {
			this._api.getImageInfo( this._prefixedFilename, imageSize, this._wikiUrl )
			.done( function( imageInfo ) {
				self._imageInfo[imageSize] = imageInfo;
				deferred.resolve( imageInfo );
			} )
			.fail( function( error ) {
				deferred.reject( error );
			} );
		}

		return deferred.promise();
	}

} );

return Asset;

} );
