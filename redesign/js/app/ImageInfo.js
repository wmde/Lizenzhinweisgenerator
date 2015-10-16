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
 * @param {int} size The image's size in bytes
 * @param {Object} [thumbnail]
 */
var ImageInfo = function( url, descriptionUrl, size, thumbnail ) {
	if( !url || !descriptionUrl ) {
		throw new Error( 'Required parameters are not specified correctly' );
	}
	this._url = url;
	this._descriptionUrl = descriptionUrl;
	this._size = size;
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
	 * The image's size in bytes
	 * @type {int}
	 */
	_size: null,

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
	 * @return {int}
	 */
	getSize: function() {
		return this._size;
	},

	/**
	 * @return {string}
	 */
	getPrettySize: function() {
		var sizeOf = function (a,b,c,d,e){
			return (b=Math,c=b.log,d=1024,e=c(a)/c(d)|0,a/b.pow(d,e)).toFixed(2)
				+' '+(e?'KMGTPEZY'[--e]+'B':'Bytes')
		};
		return sizeOf(this._size);
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
		imageinfo.size,
		{
			url: imageinfo.thumburl || null,
			width: imageinfo.thumbwidth || null,
			height: imageinfo.thumbheight || null
		}
	);
};

module.exports = ImageInfo;
