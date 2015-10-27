'use strict';

var $ = require( 'jquery' );

var Dialogue = function() {
	this._steps = [];
	this._data = {};
};

$.extend( Dialogue.prototype, {
	/**
	 * @type {DialogueStep[]}
	 */
	_steps: null,

	/**
	 * @type {Object}
	 */
	_data: null,

	/**
	 * @param {DialogueStep} step
	 */
	addStep: function( step ) {
		this._steps.push( step );
	},

	/**
	 * @param {DialogueStep} step
	 */
	completeStep: function( step ) {
		this._data[ step.getName() ] = step.getData();
	}
} );

module.exports = Dialogue;
