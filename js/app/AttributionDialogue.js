'use strict';

var $ = require( 'jquery' ),
	Dialogue = require( './Dialogue' ),
	DialogueStep = require( './DialogueStep' ),
	ChangeStep = require( './ChangeStep' ),
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
		var licence = this._asset.getLicence();
		this.addStep( new ChangeStep( licence ));
		this.addStep( new DialogueStep( 'creator', require( './templates/CreatorStep.handlebars' ) ) );
		if ( !licence.isPublicDomain() ) {
			this.addStep( new LicenceStep( licence ) );
		}
	}
} );

module.exports = AttributionDialogue;
