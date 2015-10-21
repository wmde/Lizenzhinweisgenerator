'use strict';

var $ = require( 'jquery' ),
	dialogueTemplate = require( '../templates/Dialogue.handlebars' ),
	Messages = require( '../Messages' );

var AttributionDialogueView = function() {
};

$.extend( AttributionDialogueView.prototype, {
	/**
	 * @param {jQuery} $dialogue
	 */
	render: function( $dialogue ) {
		$dialogue.html( 'Dialogue goes here!' );
	}
} );

module.exports = AttributionDialogueView;
