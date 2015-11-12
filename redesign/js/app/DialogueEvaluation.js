'use strict';

var $ = require( 'jquery' );

/**
 * @param {Asset} asset
 * @constructor
 */
var DialogueEvaluation = function( asset ) {
	this._asset = asset;
};

$.extend( DialogueEvaluation.prototype, {
	/**
	 * @type {Asset}
	 */
	_asset: null,

	getAttribution: function() {
		return this._asset.getTitle();
	}
} );

module.exports = DialogueEvaluation;
