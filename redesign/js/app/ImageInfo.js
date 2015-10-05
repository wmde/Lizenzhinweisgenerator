/**
 * @licence GNU GPL v3
 * @author snater.com < wikimedia@snater.com >
 */

'use strict';

var $ = require( 'jquery' );

/**
 * Standardized container for image information.
 * @constructor
 *
 * @param {string} url
 * @param {string} descriptionUrl
 * @param {Object} [thumbnail]
 */
var ImageInfo = function( url, descriptionUrl, thumbnail ) {
	if( !url || !descriptionUrl ) {
		throw new Error( 'Required parameters are not specified correctly' );
	}
	this._url = url;
	this._descriptionUrl = descriptionUrl;
	this._thumbnail = thumbnail || null;
};

$.extend( ImageInfo.prototype, {
	/**
	 * @type {string}
	 */
	_url: null,

	/**
	 * @type {string}
	 */
	_descriptionUrl: null,

	/**
	 * @type {Object|null}
	 */
	_thumbnail: null,

	/**
	 * @return {string}
	 */
	getUrl: function() {
		return this._url;
	},

	/**
	 * @return {string}
	 */
	getDescriptionUrl: function() {
		return this._descriptionUrl;
	},

	/**
	 * @return {Object|null}
	 */
	getThumbnail: function() {
		return this._thumbnail;
	}
} );

/**
 * Instantiates a new ImageInfo object using the "imageinfo" JSON object returned by the MediaWiki
 * API.
 *
 * @param {Object} imageinfo
 * @return {ImageInfo}
 */
ImageInfo.newFromMediaWikiImageInfoJson = function( imageinfo ) {
	return new ImageInfo(
		imageinfo.url,
		imageinfo.descriptionurl,
		{
			url: imageinfo.thumburl || null,
			width: imageinfo.thumbwidth || null,
			height: imageinfo.thumbheight || null
		}
	);
};

module.exports = ImageInfo;
