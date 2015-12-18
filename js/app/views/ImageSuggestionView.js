'use strict';

var $ = require( 'jquery' ),
	template = require( '../templates/ImageSuggestion.handlebars' );

var ImageSuggestionView = function( imageInfo ) {
	this._imageInfo = imageInfo;
};

$.extend( ImageSuggestionView.prototype, {
	_imageInfo: null,

	render: function() {
		return template( {
			thumbnail: this._imageInfo.getThumbnail().url
		} );
	}
} );

module.exports = ImageSuggestionView;
