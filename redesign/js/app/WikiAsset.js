/**
 * @licence GNU GPL v3
 * @author snater.com < wikimedia@snater.com >
 */
/* jshint strict: false */

var $ = require( 'jquery' ),
	Asset = require( './Asset' );

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
 * @param {string} [wikiUrl]
 *
 * @throws {Error} if a required parameter is not defined.
 */
var WikiAsset = function( filename,
	mediaType,
	licence,
	title,
	authors,
	url,
	$attribution,
	api,
	wikiUrl ) {
	Asset.call( this, filename, mediaType, licence, title, authors, url, $attribution, api );
	this._wikiUrl = wikiUrl || null;
};

$.extend( WikiAsset.prototype, Asset.prototype, {

	/**
	 * @type {string}
	 */
	_wikiUrl: null,

	/**
	 * @see Asset.getFilename
	 *
	 * @return {string}
	 */
	getFilename: function() {
		return this._filename.replace( /^[^:]+:/, '' );
	},

	/**
	 * @return {string}
	 */
	getWikiUrl: function() {
		return this._wikiUrl;
	},

	/**
	 * @see Asset.getUrl
	 *
	 * @return {string}
	 */
	getUrl: function() {
		var url = ( this._wikiUrl || this._api.getDefaultUrl() ) + 'wiki/' + this._filename;
		return url.indexOf( 'http' ) === 0 ? url : 'https://' + url;
	},

	/**
	 * @see Asset.equals
	 *
	 * @param {Asset} asset
	 * @return {boolean}
	 */
	equals: function( asset ) {
		return this.inherited( arguments ) && asset.getWikiUrl() === this.getWikiUrl();
	},

	/**
	 * Clones the asset.
	 *
	 * @return {WikiAsset}
	 */
	clone: function() {
		return new WikiAsset(
			this._filename,
			this._mediaType,
			this._licence,
			this._title,
			this._authors,
			this._url,
			this._$attribution,
			this._api,
			this._wikiUrl
		);
	}
} );

module.exports = WikiAsset;
