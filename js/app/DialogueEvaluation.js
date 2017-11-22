'use strict';

var $ = require( 'jquery' ),
	LicenceStore = require( './LicenceStore' ),
	config = require( '../config.json' ),
	licences = new LicenceStore( require( './LICENCES' ), config.portedLicences ),
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

	_unknownAuthor: function() {
		return this._getResult( 'author', 'no-author' ) === 'true' || this._getResult( 'author', 'author' );
	},

	_unknownAuthorName: function() {
		return this._getResult( 'author', 'author' ) || Messages.t( 'evaluation.anonymous' );
	},

	_getAuthor: function() {
		if( this._unknownAuthor() ) {
			return this._unknownAuthorName();
		}

		return this._asset.getAuthors().map( function( author ) {
			return typeof author === 'string' ? author : author.getText();
		} ).join( ', ' );
	},

	_getHtmlAuthor: function() {
		var self = this;
		if( this._unknownAuthor() ) {
			return this._unknownAuthorName();
		}

		return this._asset.getAuthors().map( function( author ) {
			return typeof author === 'string' ? author : self._getAuthorWithLink( author );
		} ).join( ', ' );
	},

	_getAuthorWithLink: function( $author ) {
		var self = this,
			$container = $( '<div/>' ).append( $author.getHtml() );
		$container.find( 'a' ).each( function() {
			var $link = $( this );
			$( this ).replaceWith( self._makeLink( $link.attr( 'href' ), $link.text() ) );
		} );
		return $container.html();
	},

	_makeLink: function( target, text, isLicense ) {
		if (isLicense) {
			return '<a href="' + target + '" rel="license" target="_blank">' + text + '</a>'
		}
		return '<a href="' + target + '" target="_blank">' + text + '</a>';
	},

	_getHtmlTitle: function() {
		return this._makeLink( this._asset.getUrl(), this._asset.getTitle() );
	},

	_getHtmlLicence: function() {
		var url = this.getAttributionLicence().getUrl();
		if (url) {
			return this._makeLink( this.getAttributionLicence().getUrl(), this.getAttributionLicence().getName(), true);
		} else {
			return this.getAttributionLicence().getName();
		}
	},

	getAttributionLicence: function() {
		return this._getResult( 'editing', 'edited' ) === 'true' && this._getResult( 'licence', 'licence' ) !== 'original' ?
			licences.getLicence( this._getResult( 'licence', 'licence' ) )
			: this._asset.getLicence();
	},

	_getEditingAttribution: function() {
		var change, creator, attribution;
		if( this._getResult( 'editing', 'edited' ) !== 'true' ) {
			return '';
		}

		change = this._getResult( 'change', 'change' );
		creator = this._getResult( 'creator', 'name' );
		attribution = change || Messages.t( 'evaluation.edited' );
		if( creator ) {
			attribution += ' ' + Messages.t( 'evaluation.by' ) + ' ' + creator;
		}
		attribution += ', ';
		return attribution;
	},

	_getAuthorAttribution: function() {
		var attributionText = this._asset.getAttribution() && this._asset.getAttribution().text().trim(),
			notEmpty = attributionText && attributionText.length > 0;

		if( this.isPrint() ) {
			return notEmpty && attributionText;
		}
		return notEmpty && ( $( '<div/>' ).append( this._asset.getAttribution() ).html() || attributionText );
	},

	_getPrintAttribution: function() {
		var attribution = ( this._getAuthorAttribution() || this._getAuthor() ) + ' '
			+ '(' + this._asset.getUrl() + '), ';
		var licence = this._asset.getLicence();
		if( !licence.isInGroup( 'cc4' ) ) {
			attribution += '„' + this._asset.getTitle() + '“' + ', ';
		}
		attribution += this._getEditingAttribution();

		if ( licence.isPublicDomain() ) {
			attribution += Messages.t('dialogue.pd-attribution-hint')
				+ ' Wikimedia Commons: ';
		}

		attribution	+= this.getAttributionLicence().getUrl();
		return attribution;
	},

	_getHtmlAttribution: function() {
		var attributionLink
		var licence = this.getAttributionLicence();
		if ( licence.isPublicDomain() ) {
			attributionLink = Messages.t('dialogue.pd-attribution-hint') + ' '
				+ this._makeLink( licence.getUrl(), 'Wikimedia Commons' );
		} else {
			attrbutionLink = this._getHtmlLicence();
		}

		return ( this._getAuthorAttribution() || this._getHtmlAuthor() ) + ', '
			+ this._getHtmlTitle() + ', '
			+ this._getEditingAttribution()
			+ attributionLink;
	},

	_getAttributionAsTextWithLinks: function() {
		return ( this._getAuthorAttribution() || this._getAuthor() ) + ' '
			+ '(' + this._asset.getUrl() + '), '
			+ '„' + this._asset.getTitle() + '“' + ', '
			+ this._getEditingAttribution()
			+ this.getAttributionLicence().getUrl();
	},

	getAttribution: function() {
		if( this.isPrint() ) {
			return this._getPrintAttribution();
		}

		return this._getHtmlAttribution();
	},

	getPlainTextAttribution: function() {
		if( this.isPrint() || !this._asset.getLicence().isInGroup( 'cc4' ) ) {
			return this._getPrintAttribution();
		}
		return this._getAttributionAsTextWithLinks();
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
	},

	isPrint: function() {
		return this._getResult( 'typeOfUse', 'type' ) === 'print';
	}
} );

module.exports = DialogueEvaluation;
