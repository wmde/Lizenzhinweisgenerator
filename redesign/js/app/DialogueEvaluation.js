'use strict';

var $ = require( 'jquery' ),
	LicenceStore = require( './LicenceStore' ),
	licences = new LicenceStore( require( './LICENCES' ) );

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

	_getResult: function( step, field ) {
		return this._data[ step ] && this._data[ step ][ field ];
	},

	_getAttributionLicenceUrl: function() {
		return this._getResult( 'editing', 'edited' ) === 'true' ?
			licences.getLicence( this._getResult( 'licence', 'licence' ) ).getUrl()
			: this._asset.getLicence().getUrl();
	},

	_getPrintAttribution: function() {
		return '(' + this._asset.getUrl() + '), '
			+ this._asset.getTitle() + ', '
			+ this._getAttributionLicenceUrl();
	},

	getAttribution: function() {
		if( this._getResult( 'type-of-use', 'type' ) === 'print' ) {
			return this._getPrintAttribution();
		}

		return this._asset.getTitle();
	}
} );

module.exports = DialogueEvaluation;
