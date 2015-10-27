'use strict';

var $ = require( 'jquery' );

/**
 * @param {string} name
 * @param {Dialogue} dialogue
 * @constructor
 */
var DialogueStep = function( name, dialogue ) {
	this._name = name;
	this._dialogue = dialogue;
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

	getName: function() {
		return this._name;
	},

	/**
	 *
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
