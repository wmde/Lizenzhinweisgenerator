( function( define ) {
'use strict';

define( ['jquery'], function( $ ) {

/**
 * Represents a Commons author.
 *
 * @param {jQuery} $author
 * @constructor
 */
var Author = function( $author ) {
	this._$author = $author;
};

$.extend( Author.prototype, {
	/**
	 * @type {jQuery}
	 */
	_$author: null,

	/**
	 * @return {jQuery}
	 */
	getHtml: function() {
		return this._$author;
	},

	/**
	 * @return {string}
	 */
	getText: function() {
		return this._$author.text();
	}

} );

return Author;

} );

}( define ) );
