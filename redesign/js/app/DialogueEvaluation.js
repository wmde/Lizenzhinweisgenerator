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

	_getHtmlAuthor: function() {
		return this._asset.getAuthors().map( function( author ) {
			return typeof author === 'string' ? author : $( '<div/>' ).append( author.getHtml() ).html();
		} ).join( ', ' );
	},

	_makeLink: function( target, text ) {
		return '<a href="' + target + '">' + text + '</a>';
	},

	_getHtmlTitle: function() {
		return this._makeLink( this._asset.getUrl(), this._asset.getTitle() );
	},

	_getHtmlLicence: function() {
		return this._makeLink( this._getAttributionLicence().getUrl(), this._getAttributionLicence().getName() );
	},

	_getAttributionLicence: function() {
		return this._getResult( 'editing', 'edited' ) === 'true' ?
			licences.getLicence( this._getResult( 'licence', 'licence' ) )
			: this._asset.getLicence();
	},

	_getEditingAttribution: function() {
		if( this._getResult( 'editing', 'edited' ) !== 'true' ) {
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
			+ this._getAttributionLicence().getUrl();
	},

	_getHtmlAttribution: function() {
		return this._getHtmlAuthor() + ', '
			+ this._getHtmlTitle() + ', '
			+ this._getEditingAttribution()
			+ this._getHtmlLicence();
	},

	getAttribution: function() {
		if( this._getResult( 'typeOfUse', 'type' ) === 'print' ) {
			return this._getPrintAttribution();
		}

		return this._getHtmlAttribution();
	},

	/**
	 * Returns a list of the DOs and DONTs
	 * @returns {{dos: Array, donts: Array}}
	 */
	getDosAndDonts: function() {
		var dos = [],
			donts = [ 'terms-of-use', 'sublicences', 'cc-licence', 'technical-protection', 'rightholder-connection' ];

		dos.push( this._getResult( 'typeOfUse', 'type' ) );
		if( this._getResult( 'compilation', 'compilation' ) === 'true' ) {
			dos.push( 'compilation' );
		}
		if( this._asset.getLicence().isInGroup( 'cc1' ) || this._asset.getLicence().isInGroup( 'cc2' ) ) {
			donts.pop();
		}

		return { dos: dos, donts: donts };
	}
} );

module.exports = DialogueEvaluation;
