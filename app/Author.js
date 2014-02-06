this.app = this.app || {};

app.Author = ( function( $ ) {
'use strict';

/**
 * Represents a Commons author.
 *
 * @param {string} name
 * @param {string} [url]
 * @constructor
 */
var Author = function( name, url ) {
	this._name = name;
	this._url = url || null;
};

$.extend( Author.prototype, {
	/**
	 * @type {string}
	 */
	_name: null,

	/**
	 * @type {string}
	 */
	_url: null,

	/**
	 * @return {string}
	 */
	getName: function() {
		return this._name;
	},

	/**
	 * @return {string}
	 */
	getUrl: function() {
		return this._url;
	}

} );

return Author;

}( jQuery ) );
