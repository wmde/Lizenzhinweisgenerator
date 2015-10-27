'use strict';

var $ = require( 'jquery' );

var DialogueStep = function( name ) {
	this._name = name;
};

$.extend( DialogueStep.prototype, {
	/**
	 * @type {string}
	 */
	_name: null,

	getName: function() {
		return this._name;
	}
} );

module.exports = DialogueStep;
