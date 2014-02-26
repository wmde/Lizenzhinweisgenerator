( function( define ) {
'use strict';

define(
	[
		'jquery',
		'app/InputHandler',
		'dojo/i18n!./nls/FrontPage',
		'dojo/_base/config',
		'templates/registry'
	],
	function( $, InputHandler, messages, config, templateRegistry ) {

/**
 * Front-page renderer.
 * @constructor
 *
 * @param {jQuery} $initNode
 *
 * @throws {Error} if a required parameter is not defined.
 *
 * @event input Triggered if a filename is ready to be processed.
 *        (1) {jQuery.Event}
 *        (2) {string} File name
 * @event error Triggered if an error occurs.
 *        (1) {jQuery.Event}
 *        (2) {string} Error message
 */
var FrontPage = function( $initNode, api ) {
	if( !$initNode ) {
		throw new Error( 'Required parameters are nor properly defined' );
	}

	this._$node = $initNode;
	this._inputHandler = new InputHandler( api );
};

$.extend( FrontPage.prototype, {
	/**
	 * @type {jQuery}
	 */
	_$node: null,

	/**
	 * @type {jQuery|null}
	 */
	_$frontPage: null,

	/**
	 * @type {InputHandler}
	 */
	_inputHandler: null,

	/**
	 * Renders the front page.
	 */
	render: function() {
		var self = this;

		this._$node.empty();

		var $frontPage = $( '<div/>' ).addClass( 'frontpage' )
			.append( $( '<h1/>' ).text( messages['licence attribution generator'] ) )
			.append(
				$( '<div/>' ).addClass( 'container-input' )
				.append(
					$( '<input type="text"/>' ).attr(
						'placeholder',
						messages['input placeholder']
					)
				)
			)
			.append( $( '<button/>' ).text( messages['generate attribution'] ) );

		this._$node.append( $frontPage );

		this._renderHelp( $frontPage.find( '.container-input' ) );

		$frontPage.find( 'input' )
		.on( 'dragenter dragover', false )
		.on( 'drop', function( event ) {
			event.preventDefault();
			self._evaluateInput( event );
		} );

		$frontPage.find( 'button' )
		.on( 'click', function() {
			$frontPage.find( '.error' )
			.stop()
			.slideUp( 'fast' );

			$frontPage.find( '.suggestions' ).remove();

			$frontPage.find( 'input' ).addClass( 'loading' );

			self._evaluateInput( $frontPage.find( 'input' ).val() );
		} );

		this._$frontPage = $frontPage;
	},

	/**
	 * Renders the help icon an the corresponding tooltip.
	 *
	 * @param {jQuery} $parentNode
	 */
	_renderHelp: function( $parentNode ) {
		$.get( config.baseUrl + templateRegistry.getDir( config.locale ) + 'frontpage-help.html' )
		.done( function( html ) {
			var $helpIcon = $( '<a/>' ).addClass( 'icon-help' ).text( '?' ),
				$helpContent = $( '<div/>' ).addClass( 'help-content' ).html( html );

			$parentNode
			.append( $helpIcon )
			.append( $helpContent )
			.append( $( '<div/>' ).addClass( 'error' ) );

			$helpIcon
			.on( 'click', function() {
				if( $helpContent.is( ':visible' ) ) {
					$helpContent.hide();
					$helpIcon.removeClass( 'active' );
				} else {
					$helpContent.show();

					$helpContent.css( 'top', '0' );
					$helpContent.css( 'left', '0' );

					$helpContent.offset( {
						top: $helpIcon.offset().top + $helpIcon.height() + 6,
						left: $helpIcon.offset().left
					} );
					$helpIcon.addClass( 'active' );
				}
			} );
		} );
	},

	/**
	 * Evaluates any given input using the input handler.
	 *
	 * @param {string|jQuery.Event} input
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {string} File name.
	 *         Rejected parameters:
	 *         - {string} Error message.
	 *
	 * @triggers input
	 * @triggers error
	 */
	_evaluateInput: function( input ) {
		var self = this,
			deferred = $.Deferred();

		this._inputHandler.getFilename( input )
		.done( function( filename ) {
			if( typeof filename === 'string' ) {
				$( self ).trigger( 'input', [filename] );
				deferred.resolve( filename );
			} else {
				self._renderSuggestions( filename );
			}
		} )
		.fail( function( message ) {
			$( self ).trigger( 'error', [message] );
			deferred.reject( message );
		} )
		.always( function() {
			self._$node.find( 'input' ).removeClass( 'loading' );
		} );

		return deferred;
	},

	/**
	 * Renders a list of suggestions for a list of file info objects.
	 *
	 * @param {ImageInfo[]} imageInfos
	 */
	_renderSuggestions: function( imageInfos ) {
		var self = this,
			$suggestions = this._$frontPage.find( '.suggestions' );

		if( $suggestions.length === 0 ) {
			$suggestions = $( '<div/>' ).addClass( 'suggestions ' )
				.appendTo( this._$frontPage );
		}

		var $ul = $( '<ul/>' );
		for( var i = 0; i < imageInfos.length; i++ ) {
			var $li = $( '<li/>' ).append(
				$( '<img/>' ).attr( 'border', '0' ).attr( 'src', imageInfos[i].getThumbnail().url )
			);
			( function( imageInfo ) {
				$li.on( 'click', function() {
					self._evaluateInput( imageInfo.getDescriptionUrl() );
				} );
			}( imageInfos[i] ) );
			$ul.append( $li );
		}

		$suggestions.empty().append( $ul );
	}

} );

return FrontPage;

} );

}( define ) );
