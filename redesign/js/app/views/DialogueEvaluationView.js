'use strict';

var $ = require( 'jquery' ),
	doneTemplate = require( '../templates/Done.handlebars' ),
	dosAndDontsTemplate = require( '../templates/DosAndDonts.handlebars' ),
	attributionTemplate = require( '../templates/Attribution.handlebars' ),
	Clipboard = require( 'zeroclipboard' ),
	buttonTemplate = require( '../templates/SmallButton.handlebars' ),
	Messages = require( '../Messages' ),
	Tracking = require( '../../tracking.js' );

Clipboard.config( { swfPath: '//cdnjs.cloudflare.com/ajax/libs/zeroclipboard/2.2.0/ZeroClipboard.swf' } );

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

	_copyAttribution: function( event, $button ) {
		event.clipboardData.setData( 'text/plain', $( '.attribution-box > div:visible' ).text().trim() );
		$button.addClass( 'flash' );
		window.setTimeout( function() {
			$button.removeClass( 'flash' );
		}, 800 );
	},

	render: function() {
		var $html = $( doneTemplate() ),
			dosAndDonts = this._evaluation.getDosAndDonts(),
			self = this;

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

		var $copyButton = $html.find( '#copy-attribution' ),
			clipboard = new Clipboard( $copyButton ),
			self = this;
		clipboard.on( 'copy', function( e ) {
			self._tracking.trackEvent( 'Button', 'CopyAttribution' );
			self._copyAttribution( e, $copyButton );
		} );

		return $html;
	}
} );

module.exports = DialogueEvaluationView;
