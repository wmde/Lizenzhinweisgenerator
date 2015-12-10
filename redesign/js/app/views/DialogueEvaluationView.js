'use strict';

var $ = require( 'jquery' ),
	doneTemplate = require( '../templates/Done.handlebars' ),
	dosAndDontsTemplate = require( '../templates/DosAndDonts.handlebars' ),
	attributionTemplate = require( '../templates/Attribution.handlebars' ),
	ZeroClipboard = require( 'zeroclipboard' ),
	Clipboard = require( 'clipboard' ),
	buttonTemplate = require( '../templates/SmallButton.handlebars' ),
	Messages = require( '../Messages' ),
	Tracking = require( '../../tracking.js' );

ZeroClipboard.config( { swfPath: '//cdnjs.cloudflare.com/ajax/libs/zeroclipboard/2.2.0/ZeroClipboard.swf' } );

/**
 * @param {DialogueEvaluation} evaluation
 * @constructor
 */
var DialogueEvaluationView = function( evaluation ) {
	this._evaluation = evaluation;
	this._tracking = new Tracking();
};

$.extend( DialogueEvaluationView.prototype, {
	/**
	 * @type {DialogueEvaluation}
	 */
	_evaluation: null,

	_showDont: function( e ) {
		$( this ).parent().siblings( '.dont-text' ).slideToggle();

		e.preventDefault();
	},

	_showAttribution: function( e ) {
		$( '.final-attribution .attribution-box div' ).hide();
		$( $( this ).data( 'target' ) ).show();
		$( '.final-attribution .show-attribution' ).removeClass( 'active' );
		$( this ).addClass( 'active' );

		e.preventDefault();
	},

	_attributionText: function() {
		return $( '.attribution-box > div:visible' ).text().trim();
	},

	_copyAttribution: function( event, $button ) {
		event.clipboardData.setData( 'text/plain', this._attributionText() );
		this._blinkCopyButton( $button );
	},

	_blinkCopyButton: function( $button ) {
		$button.addClass( 'flash' );
		window.setTimeout( function() {
			$button.removeClass( 'flash' );
		}, 800 );
	},

	_hasFlash: function() {
		var hasFlash = false;
		try {
			var swf = new ActiveXObject( 'ShockwaveFlash.ShockwaveFlash' ); // jshint ignore:line
			if( swf ) {
				hasFlash = true;
			}
		} catch( e ) {
			if( navigator.mimeTypes
				&& navigator.mimeTypes[ 'application/x-shockwave-flash' ] !== undefined
				&& navigator.mimeTypes[ 'application/x-shockwave-flash' ].enabledPlugin ) {
				hasFlash = true;
			}
		}

		return hasFlash;
	},

	_initIECopy: function( $button ) {
		var self = this;

		$button.click( function( e ) {
			window.clipboardData.setData( 'Text', self._attributionText() );
			self._blinkCopyButton( $button );

			e.preventDefault();
			self._tracking.trackEvent( 'Button', 'CopyAttribution' );
		} );
	},

	_initFlashCopy: function( $button ) {
		var self = this,
			clipboard = new ZeroClipboard( $button );

		clipboard.on( 'copy', function( e ) {
			self._tracking.trackEvent( 'Button', 'CopyAttribution' );
			self._copyAttribution( e, $button );
		} );
	},

	_initJSCopy: function( $button ) {
		var self = this;

		new Clipboard( '#' + $button.attr( 'id' ), { // jshint ignore:line
			text: function() {
				self._tracking.trackEvent( 'Button', 'CopyAttribution' );
				self._blinkCopyButton( $button );
				return self._attributionText();
			} // TODO: show a hint in case this fails
		} );
	},

	_initCopyButton: function( $button ) {
		if( window.clipboardData ) { // IE
			this._initIECopy( $button );
		} else if( this._hasFlash() ) { // flash
			this._initFlashCopy( $button );
		} else { // JS with hint when copying fails
			this._initJSCopy( $button );
		}
	},

	render: function() {
		var $html = $( doneTemplate() ),
			dosAndDonts = this._evaluation.getDosAndDonts();

		$html.append( attributionTemplate( {
			attribution: this._evaluation.getAttribution(),
			unformattedAttribution: this._evaluation.getUnformattedAttribution(),
			isPrint: this._evaluation.isPrint()
		} ) );
		$html.append( dosAndDontsTemplate( {
			dos: dosAndDonts.dos.map( function( d ) {
				return 'evaluation.do-' + d + '-text';
			} ),
			donts: dosAndDonts.donts.map( function( dont ) {
				return {
					headline: 'evaluation.dont-' + dont + '-headline',
					text: 'evaluation.dont-' + dont + '-text'
				};
			} )
		} ) );
		$html.append( '<div class="clearfix"/>' );
		$( '<div class="licence-link"/>' )
			.append( buttonTemplate( {
				content: '<img class="cc-logo" src="images/cc.svg">'
				+ Messages.t( 'evaluation.show-licence-text' )
				+ ' (' + this._evaluation.getAttributionLicence().getName() + ')',
				target: this._evaluation.getAttributionLicence().getUrl()
			} ) )
			.appendTo( $html );

		$html.find( '.show-attribution' ).click( this._showAttribution );
		$html.find( '.show-dont' ).click( this._showDont );

		this._initCopyButton( $html.find( '#copy-attribution' ) );

		return $html;
	}
} );

module.exports = DialogueEvaluationView;
