'use strict';

var $ = require( 'jquery' );

var Spinner = function( $node ) {
	this._$node = $node;
};

$.extend( Spinner.prototype, {
	/**
	 * @type {jQuery}
	 */
	_$node: null,

	/**
	 * Adds a spinner to a node.
	 */
	add: function() {
		if( this._$node.find( '.ag-spinner' ).length !== 0 ) {
			return;
		}

		this._$node.prepend(
			'<div class="ag-spinner"><i class="glyphicon spin-icon glyphicon-refresh"></i></div>'
		);
	},

	remove: function() {
		this._$node.find( '.ag-spinner' ).remove();
	}
} );

module.exports = Spinner;
