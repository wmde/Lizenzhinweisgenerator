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
		return template( {
			image: this._imageInfo.getThumbnail().url
		} );
	}
} );

module.exports = DialogueView;
