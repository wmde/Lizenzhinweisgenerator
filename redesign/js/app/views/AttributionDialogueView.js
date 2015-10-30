'use strict';

var $ = require( 'jquery' ),
	AttributionDialogue = require( '../AttributionDialogue' );

var AttributionDialogueView = function() {
	this._dialogue = new AttributionDialogue();
	this._dialogue.init();
};

$.extend( AttributionDialogueView.prototype, {
	/**
	 * @type {AttributionDialogue}
	 */
	_dialogue: null,

	/**
	 * @param {jQuery} $dialogue
	 */
	render: function( $dialogue ) {
		$dialogue.html( this._dialogue.currentStep().render() );
	}
} );

module.exports = AttributionDialogueView;
