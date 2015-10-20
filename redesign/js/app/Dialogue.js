'use strict';

var $ = require( 'jquery' ),
	DialogueView = require( './views/DialogueView' );

var Dialogue = function( asset, imageInfo ) {
	this._asset = asset;
	this._imageInfo = imageInfo;
};

$.extend( Dialogue.prototype, {
	/**
	 * @type {Asset}
	 */
	_asset: null,

	/**
	 * @type {ImageInfo}
	 */
	_imageInfo: null,

	/**
	 * Loads the required asset data and shows the initial dialogue screen
	 */
	show: function() {
		return new DialogueView( this._imageInfo, this._asset ).render();
	}
} );

module.exports = Dialogue;
