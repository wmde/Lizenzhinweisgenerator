'use strict';

var $ = require( 'jquery' ),
	template = require( '../templates/DialogueScreen.handlebars' ),
	imagePreviewTemplate = require( '../templates/ImagePreview.handlebars' ),
	PublicDomainDialogueView = require( './PublicDomainDialogueView' ),
	AttributionDialogueView = require( './AttributionDialogueView' ),
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
			imageWidth: this._imageInfo.getThumbnail().width
		} );
	},

	/**
	 * Renders information about Public Domain Licence if the picture was under PD or starts the dialogue
	 *
	 * @param {jQuery} $screen
	 */
	render: function( $screen ) {
		var title, dialogue;

		if( this._asset.getLicence().isInGroup( 'pd' ) ) {
			title = Messages.t( 'dialogue.no-attribution-needed' );
			dialogue = new PublicDomainDialogueView;
		} else {
			title = Messages.t( 'dialogue.adjust-attribution-for-usage' );
			dialogue = new AttributionDialogueView( this._asset );
		}

		$screen.html( template( {
			title: title,
			imagePreview: this._renderImagePreview()
		} ) );
		dialogue.render( $screen.find( '.dialogue' ) );
	}
} );

module.exports = DialogueView;
