'use strict';

var $ = require( 'jquery' );

/**
 * @param {Asset} asset
 * @param {{}} data - the dialogue result data
 * @constructor
 */
var DialogueEvaluation = function( asset, data ) {
	this._asset = asset;
	this._data = data;
};

$.extend( DialogueEvaluation.prototype, {
	/**
	 * @type {Asset}
	 */
	_asset: null,

	/**
	 * @type {{}}
	 */
	_data: {},

	_getPrintAttribution: function() {
		return '(' + this._asset.getUrl() + '), '
			+ this._asset.getTitle() + ', '
			+ this._asset.getLicence().getUrl();
	},

	getAttribution: function() {
		if( this._data[ 'type-of-use' ] && this._data[ 'type-of-use' ].type === 'print' ) {
			return this._getPrintAttribution();
		}

		return this._asset.getTitle();
	}
} );

module.exports = DialogueEvaluation;
