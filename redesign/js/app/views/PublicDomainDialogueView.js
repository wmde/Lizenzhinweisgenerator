'use strict';

var $ = require( 'jquery' ),
	dialogueTemplate = require( '../templates/Dialogue.handlebars' ),
	Messages = require( '../Messages' ),
	buttonTemplate = require( '../templates/SmallButton.handlebars' );

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
		return $( '<div class="more-information"/>' )
			.html( buttonTemplate( {
				content: '<img class="cc-logo" src="http://mirrors.creativecommons.org/presskit/icons/cc.svg">'
				+ Messages.t( 'dialogue.more-information' ),
				target: 'https://wiki.creativecommons.org/wiki/Public_domain'
			} ) );
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
