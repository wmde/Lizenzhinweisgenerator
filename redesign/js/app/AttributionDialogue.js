'use strict';

var $ = require( 'jquery' ),
	Dialogue = require( './Dialogue' ),
	DialogueStep = require( './DialogueStep' ),
	LicenceStep = require( './LicenceStep' );

/**
 * @param {string|null} author
 * @constructor
 */
var AttributionDialogue = function( asset ) {
	Dialogue.call( this );
	this._asset = asset;
};

$.extend( AttributionDialogue.prototype, Dialogue.prototype, {
	/**
	 * @type {Asset}
	 */
	_asset: null,

	getAsset: function() {
		return this._asset;
	},

	setStep: function( n ) {
		Dialogue.prototype.setStep.call( this, n );
		if( this._hasAuthor() && n < 4 || n < 3 ) {
			this._removeEditingSteps();
		}
	},

	_hasAuthor: function() {
		return this._asset.getAuthors().length === 0;
	},

	init: function() {
		this.addStep( new DialogueStep( 'typeOfUse', require( './templates/TypeOfUseStep.handlebars' ) ) );
		if( this._hasAuthor() ) {
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

	_removeEditingSteps: function() {
		if( this._steps.length > 4 ) {
			this._steps.pop();
			this._steps.pop();
			this._steps.pop();
		}
	},

	_addEditingSteps: function() {
		this.addStep( new DialogueStep( 'change', require( './templates/ChangeStep.handlebars' ) ) );
		this.addStep( new DialogueStep( 'creator', require( './templates/CreatorStep.handlebars' ) ) );
		this.addStep( new LicenceStep( this._asset.getLicence() ) );
	}
} );

module.exports = AttributionDialogue;
