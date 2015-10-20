'use strict';

var $ = require( 'jquery' ),
	template = require( '../templates/DialogueScreen.handlebars' ),
	dialogueTemplate = require( '../templates/Dialogue.handlebars' ),
	imagePreviewTemplate = require( '../templates/ImagePreview.handlebars' ),
	Messages = require( '../Messages' );

var DialogueView = function( imageInfo, asset ) {
	this._imageInfo = imageInfo;
	this._asset = asset;
};

$.extend( DialogueView.prototype, {
	/**
	 * @type {ImageInfo}
	 */
	_imageInfo: null,

	/**
	 * @type {Asset}
	 */
	_asset: null,

	_renderImagePreview: function() {
		return imagePreviewTemplate( {
			url: this._imageInfo.getUrl(),
			size: this._imageInfo.getPrettySize(),
			thumbUrl: this._imageInfo.getThumbnail().url,
			imageHeight: this._imageInfo.getThumbnail().height,
			imageWidth: this._imageInfo.getThumbnail().width
		} );
	},

	_renderDialogueStart: function() {
		return 'Dialogue goes here.'; // TODO: Should start the real dialogue
	},

	_renderPublicLicenceDialogue: function() {
		return dialogueTemplate( {
			title: Messages.t( 'dialogue.public-domain-picture' ),
			content: Messages.t( 'dialogue.public-domain-text' )
		} );
	},

	/**
	 * Renders information about Public Domain Licence if the picture was under PD or starts the dialogue
	 *
	 * @returns {string} The dialogue screen html
	 */
	render: function() {
		var title, dialogue;
		$( '.dialogue-screen' ).remove();

		if( this._asset.getLicence().isInGroup( 'pd' ) ) {
			title = Messages.t( 'dialogue.no-attribution-needed' );
			dialogue = this._renderPublicLicenceDialogue();
		} else {
			title = Messages.t( 'dialogue.adjust-attribution-for-usage' );
			dialogue = this._renderDialogueStart();
		}

		return template( {
			title: title,
			imagePreview: this._renderImagePreview(),
			dialogue: dialogue
		} );
	}
} );

module.exports = DialogueView;
