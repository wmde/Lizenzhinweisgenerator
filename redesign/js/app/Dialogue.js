'use strict';

var $ = require( 'jquery' );

var Dialogue = function() {
};

$.extend( Dialogue.prototype, {
	/**
	 * @type {DialogueStep[]}
	 */
	_steps: [],

	/**
	 * @param {DialogueStep} step
	 */
	addStep: function( step ) {
		this._steps.push( step );
	}
} );

module.exports = Dialogue;
