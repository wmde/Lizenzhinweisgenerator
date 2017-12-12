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
			imageWidth: this._imageInfo.getThumbnail().width,
			filePageUrl: this._asset.getUrl()
		} );
	},

	/**
	 * Renders information about the usage not requiring attributing the author,
	 * if the asset has been licenced under appropriate licence, or starts the dialogue otherwise.
	 *
	 * @param {jQuery} $screen
	 * @param {boolean} $forceAttribution
	 */
	render: function( $screen, forceAttribution ) {
		var title, dialogue;

		if( !forceAttribution && this._noAttributionNeeded( this._asset.getLicence() ) ) {
			title = Messages.t( 'dialogue.no-attribution-needed' );
			dialogue = new PublicDomainDialogueView( this );
		} else {
			if( this._asset.getLicence().isPublicDomain() ) {
				title = Messages.t( 'adjust-legal-notice-for-usage' );
			} else {
				title = Messages.t( 'dialogue.adjust-attribution-for-usage' );
			}
			dialogue = new AttributionDialogueView( this._asset );
		}

		$screen.html( template( {
			title: title,
			imagePreview: this._renderImagePreview()
		} ) );
		dialogue.render( $screen.find( '.dialogue' ) );
	},

	/**
	 * Checks if the licence does not oblige to provide the attribution
	 *
	 * @param {Licence} licence
	 */
	_noAttributionNeeded: function( licence ) {
		return licence.isInGroup( 'pd' ) || licence.isInGroup( 'cc0' );
	}

} );

module.exports = DialogueView;
