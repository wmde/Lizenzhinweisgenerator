/**
 * @licence GNU GPL v3
 * @author snater.com < wikimedia@snater.com >
 */

'use strict';

var $ = require('jquery' ),
	Author = require('./Author' );

/**
 * Represents an asset.
 * @constructor
 *
 * @param {string} url
 * @param {string} mediaType
 * @param {Licence|null} [licence]
 * @param {string|null} [title]
 * @param {Author[]|null} [authors]
 * @param {string} [url]
 * @param {jQuery|null} [$attribution]
 * @param {Api|null} [api]
 *
 * @throws {Error} if a required parameter is not defined.
 */
var Asset = function( filename, mediaType, licence, title, authors, url, $attribution, api ) {
	if( typeof filename !== 'string' || typeof mediaType !== 'string' ) {
		throw new Error( 'No proper initialization parameters specified' );
	}

	this._filename = filename;
	this._mediaType = mediaType;
	this._licence = licence || null;
	this._title = title || '';
	this._url = url || null;
	this._authors = authors || [];
	this._$attribution = $attribution || null;
	this._api = api || null;

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
	_mediaType: null,

	/**
	 * @type {Licence|null}
	 */
	_licence: null,

	/**
	 * @type {string}
	 */
	_title: null,

	/**
	 * @type {Author[]}
	 */
	_authors: null,

	/**
	 * @type {string}
	 */
	_url: null,

	/**
	 * @type {jQuery|null}
	 */
	_$attribution: null,

	/**
	 * @type {Api}
	 */
	_api: null,

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
	getMediaType: function() {
		return this._mediaType;
	},

	/**
	 * @param {Licence} licence
	 */
	setLicence: function( licence ) {
		this._licence = licence;
	},

	/**
	 * @return {Licence|null}
	 */
	getLicence: function() {
		return this._licence;
	},

	/**
	 * @param {string} title
	 *
	 * @throws {Error} if the title is not of type "string".
	 */
	setTitle: function( title ) {
		if( typeof title !== 'string' ) {
			throw new Error( 'title needs to be a string' );
		}
		this._title = title;
	},

	/**
	 * @return {string}
	 */
	getTitle: function() {
		return this._title;
	},

	/**
	 * @param {string|null} url
	 *
	 * @throws {Error} if the URL is not specified properly.
	 */
	setUrl: function( url ) {
		if( typeof url !== 'string' && url !== null ) {
			throw new Error( 'URL needs to be a string or null' );
		}
		this._url = url;
	},

	/**
	 * @return {string|null}
	 */
	getUrl: function() {
		if( this._url === null ) {
			return null;
		}

		return this._url.indexOf( 'http' ) === 0 ? this._url : 'http://' + this._url;
	},

	/**
	 * @param {Author[]} authors
	 */
	setAuthors: function( authors ) {
		this._authors = authors;
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
			this._api.getImageInfo( this._filename, imageSize, this._wikiUrl )
			.done( function( imageInfo ) {
				self._imageInfo[imageSize] = imageInfo;
				deferred.resolve( imageInfo );
			} )
			.fail( function( error ) {
				deferred.reject( error );
			} );
		}

		return deferred.promise();
	},

	/**
	 * Checks if the asset object equals another asset object.
	 *
	 * @param {Asset} asset
	 * @return {boolean}
	 */
	equals: function( asset ) {
		var authors = asset.getAuthors();

		if( authors.length !== this._authors.length ) {
			return false;
		}

		for( var i = 0; i < this._authors.length; i++ ) {
			if( authors[i].getText() !== this._authors[i].getText() ) {
				return false;
			}
		}

		var haveLicences = asset.getLicence() && this.getLicence(),
			sameLicence = !haveLicences || asset.getLicence().getId() === this.getLicence().getId();

		return asset.getFilename() === this.getFilename()
			&& asset.getTitle() === this.getTitle()
			&& asset.getUrl() === this.getUrl()
			&& sameLicence;
	},

	/**
	 * Clones the asset.
	 *
	 * @return {Asset}
	 */
	clone: function() {
		return new Asset(
			this._filename,
			this._mediaType,
			this._licence,
			this._title,
			this._authors,
			this._url,
			this._$attribution,
			this._api
		);
	}
} );

module.exports = Asset;
