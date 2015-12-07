'use strict';

var $ = require( 'jquery' ),
	Tracking = require( '../tracking.js' );

var Dialogue = function() {
	this._steps = [];
	this._data = {};
	this._currentStep = 0;
	this._tracking = new Tracking();
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
		var self = this;

		this._data[ step.getName() ] = step.getData();
		this._currentStep++;

		self._tracking.trackEvent( 'Progress', 'Step', step.getName() );
		if( !self.currentStep() ) {
			self._tracking.trackEvent( 'Progress', 'Done' );
		}
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
