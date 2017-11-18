'use strict';

var $ = require( 'jquery' ),
	publicDomainTemplate = require( '../templates/PublicDomain.handlebars' ),
	Messages = require( '../Messages' ),
	// buttonTemplate = require( '../templates/SmallButton.handlebars' ),
	moreInfomationTemplate = require( '../templates/MoreInformation.handlebars' ),
	BackToTopButton = require( '../BackToTopButton' );

var PublicDomainDialogueView = function() {
};

$.extend( PublicDomainDialogueView.prototype, {
	_renderPublicLicenceDialogue: function() {
		return publicDomainTemplate();
	},

	_showPublicDomainInformation: function() {
		var $bottomBar = $( '<div class="licence-bottom-bar"/>' );
		$bottomBar.append( moreInfomationTemplate( {
			content: Messages.t( 'dialogue.more-information' ),
			target: 'https://wiki.creativecommons.org/wiki/Public_domain'
		} ) );
		$bottomBar.append( new BackToTopButton().render());

		return $bottomBar
	},
	_showForceAttribution: function() {
		return $( '<div class="arrow-box" />' )
		   .append(Messages.t( 'dialogue.force-pd-licence' ));
	},

	/**
	 * Renders information about Public Domain Licence if the picture was under PD or starts the dialogue
	 *
	 * @param {jQuery} $dialogue
	 */
	render: function( $dialogue ) {
		var $publicLicenceDialogue = $(this._renderPublicLicenceDialogue());
		$publicLicenceDialogue.append( this._showForceAttribution() );
		$dialogue.html( $publicLicenceDialogue )
		.append( '<div class="public-domain-bottom-separator has-bottom-seperator"></div>' )
			.append( this._showPublicDomainInformation() );
	}
} );

module.exports = PublicDomainDialogueView;
