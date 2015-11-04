'use strict';

var $ = require( 'jquery' ),
	DialogueStepView = require( './views/DialogueStepView' );

/**
 * @param {string} name
 * @param {Handlebars} template
 * @constructor
 */
var DialogueStep = function( name, template ) {
	this._name = name;
	this._view = new DialogueStepView( template );
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
	 * @type {DialogueStepView
	 */
	_view: null,

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
	},

	/**
	 * @returns {jQuery}
	 */
	render: function() {
		return this._view.render();
	}
} );

module.exports = DialogueStep;
