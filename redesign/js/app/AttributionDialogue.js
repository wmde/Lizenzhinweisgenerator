'use strict';

var $ = require( 'jquery' ),
	Dialogue = require( './Dialogue' ),
	DialogueStep = require( './DialogueStep' );

/**
 * @param {string|null} author
 * @constructor
 */
var AttributionDialogue = function( author ) {
	Dialogue.call( this );
	this._author = author;
};

$.extend( AttributionDialogue.prototype, Dialogue.prototype, {
	/**
	 * @type {string}
	 */
	_author: null,

	init: function() {
		this.addStep( new DialogueStep( 'typeOfUse' ) );
		if( !this._author ) {
			this.addStep( new DialogueStep( 'author' ) );
		}
		this.addStep( new DialogueStep( 'compilation' ) );
		this.addStep( new DialogueStep( 'editing' ) );
	},

	completeStep: function( step ) {
		Dialogue.prototype.completeStep.call( this, step );

		var data = step.getData();
		if( step.getName() === 'editing' && data['edited'] ) {
			this._addEditingSteps();
		}
	},

	_addEditingSteps: function() {
		this.addStep( new DialogueStep( 'change' ) );
		this.addStep( new DialogueStep( 'creator' ) );
		this.addStep( new DialogueStep( 'licence' ) );
	}
} );

module.exports = AttributionDialogue;
