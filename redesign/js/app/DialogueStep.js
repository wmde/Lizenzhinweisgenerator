'use strict';

var $ = require( 'jquery' );

/**
 * @param {string} name
 * @constructor
 */
var DialogueStep = function( name ) {
	this._name = name;
};

$.extend( DialogueStep.prototype, {
	/**
	 * @type {string}
	 */
	_name: null,

	/**
	 * @type {Dialogue}
	 */
	_dialogue: null,

	/**
	 * @type {Object}
	 */
	_data: null,

	/**
	 * @param {Dialogue} dialogue
	 */
	setDialogue: function( dialogue ) {
		this._dialogue = dialogue;
	},

	getName: function() {
		return this._name;
	},

	/**
	 * @param {Object} data - data collected from the dialogue step's form
	 */
	complete: function( data ) {
		this._data = data;
		this._dialogue.completeStep( this );
	},

	/**
	 * @returns {Object}
	 */
	getData: function() {
		return this._data;
	}
} );

module.exports = DialogueStep;
