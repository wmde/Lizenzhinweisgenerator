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
		this.addStep( new DialogueStep( 'typeOfUse', require( './templates/TypeOfUseStep.handlebars' ) ) );
		if( !this._author ) {
			this.addStep( new DialogueStep( 'author', require( './templates/AuthorStep.handlebars' ) ) );
		}
		this.addStep( new DialogueStep( 'compilation', require( './templates/CompilationStep.handlebars' ) ) );
		this.addStep( new DialogueStep( 'editing', require( './templates/EditingStep.handlebars' ) ) );
	},

	completeStep: function( step ) {
		Dialogue.prototype.completeStep.call( this, step );

		var data = step.getData();
		if( step.getName() === 'editing' && data[ 'edited' ] === 'true' ) {
			this._addEditingSteps();
		}
	},

	_addEditingSteps: function() {
		this.addStep( new DialogueStep( 'change', require( './templates/ChangeStep.handlebars' ) ) );
		this.addStep( new DialogueStep( 'creator', require( './templates/CreatorStep.handlebars' ) ) );
		this.addStep( new DialogueStep( 'licence', require( './templates/LicenceStep.handlebars' ) ) );
	}
} );

module.exports = AttributionDialogue;
