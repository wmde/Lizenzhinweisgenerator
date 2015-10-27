'use strict';

var $ = require( 'jquery' );

var Dialogue = function() {
	this._steps = [];
};

$.extend( Dialogue.prototype, {
	/**
	 * @type {DialogueStep[]}
	 */
	_steps: null,

	/**
	 * @param {DialogueStep} step
	 */
	addStep: function( step ) {
		this._steps.push( step );
	}
} );

module.exports = Dialogue;
