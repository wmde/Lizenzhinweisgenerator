/**
 * @licence GNU GPL v3
 * @author snater.com < wikimedia@snater.com >
 */
define( ['jquery'], function( $ ) {
'use strict';

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
		return this._$author.clone();
	},

	/**
	 * @return {string}
	 */
	getText: function() {
		return $.trim( this._$author.text() );
	}

} );

return Author;

} );
