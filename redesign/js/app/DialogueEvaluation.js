'use strict';

var $ = require( 'jquery' ),
	LicenceStore = require( './LicenceStore' ),
	licences = new LicenceStore( require( './LICENCES' ) ),
	Messages = require( './Messages' );

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

	_getAuthor: function() {
		return this._asset.getAuthors().map( function( author ) {
			return typeof author === 'string' ? author : author.getText();
		} ).join( ', ' );
	},

	_getAttributionLicenceUrl: function() {
		return this._getResult( 'editing', 'edited' ) === 'true' ?
			licences.getLicence( this._getResult( 'licence', 'licence' ) ).getUrl()
			: this._asset.getLicence().getUrl();
	},

	_getEditingAttribution: function() {
		if( !this._getResult( 'editing', 'edited' ) ) {
			return '';
		}

		return this._getResult( 'change', 'change' )
			+ ' ' + Messages.t( 'evaluation.by' )
			+ ' ' + this._getResult( 'creator', 'name' )
			+ ', ';
	},

	_getPrintAttribution: function() {
		return this._getAuthor() + ' '
			+ '(' + this._asset.getUrl() + '), '
			+ this._asset.getTitle() + ', '
			+ this._getEditingAttribution()
			+ this._getAttributionLicenceUrl();
	},

	getAttribution: function() {
		if( this._getResult( 'type-of-use', 'type' ) === 'print' ) {
			return this._getPrintAttribution();
		}

		return this._getAuthor() + ' ' + this._asset.getTitle();
	}
} );

module.exports = DialogueEvaluation;
