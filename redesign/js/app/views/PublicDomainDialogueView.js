'use strict';

var $ = require( 'jquery' ),
	dialogueTemplate = require( '../templates/Dialogue.handlebars' ),
	Messages = require( '../Messages' );

var PublicDomainDialogueView = function() {
};

$.extend( PublicDomainDialogueView.prototype, {
	_renderPublicLicenceDialogue: function() {
		return dialogueTemplate( {
			title: Messages.t( 'dialogue.public-domain-picture' ),
			content: Messages.t( 'dialogue.public-domain-text' )
		} );
	},

	_showPublicDomainInformation: function() {
		return '"more information" button goes here.';
	},

	/**
	 * Renders information about Public Domain Licence if the picture was under PD or starts the dialogue
	 *
	 * @param {jQuery} $dialogue
	 */
	render: function( $dialogue ) {
		$dialogue.html( this._renderPublicLicenceDialogue() )
			.append( this._showPublicDomainInformation() );
	}
} );

module.exports = PublicDomainDialogueView;
