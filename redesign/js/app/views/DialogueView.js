'use strict';

var $ = require( 'jquery' ),
	template = require( '../templates/DialogueView.handlebars' );

var DialogueView = function( imageInfo ) {
	this._imageInfo = imageInfo;
};

$.extend( DialogueView.prototype, {
	/**
	 * @type {ImageInfo}
	 */
	_imageInfo: null,

	render: function() {
		$( '.dialogue-screen' ).remove();
		return template( {
			url: this._imageInfo.getUrl(),
			thumbUrl: this._imageInfo.getThumbnail().url,
			imageHeight: this._imageInfo.getThumbnail().height,
			imageWidth: this._imageInfo.getThumbnail().width
		} );
	}
} );

module.exports = DialogueView;
