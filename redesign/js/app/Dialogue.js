'use strict';

var $ = require( 'jquery' );

var Dialogue = function() {
	this._steps = [];
	this._data = {};
	this._currentStep = 0;
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
	 * @type {int}
	 */
	_currentStep: null,

	/**
	 * @param {DialogueStep} step
	 */
	addStep: function( step ) {
		step.setDialogue( this );
		this._steps.push( step );
	},

	/**
	 * @param {int} n
	 */
	setStep: function( n ) {
		this._currentStep = n;
	},

	/**
	 * @param {DialogueStep} step
	 */
	completeStep: function( step ) {
		this._data[ step.getName() ] = step.getData();
		this._currentStep++;
	},

	/**
	 * @returns {Object}
	 */
	getData: function() {
		return this._data;
	},

	/**
	 * @returns {DialogueStep}
	 */
	currentStep: function() {
		return this._steps[ this._currentStep ];
	}
} );

module.exports = Dialogue;
