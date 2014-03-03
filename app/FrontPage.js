/**
 * @licence GNU GPL v3
 * @author snater.com < wikimedia@snater.com >
 */
define(
	[
		'jquery',
		'app/InputHandler',
		'dojo/i18n!./nls/FrontPage',
		'templates/registry',
		'app/ApplicationError',
		'dojo/_base/config'
	],
	function( $, InputHandler, messages, templateRegistry, ApplicationError, config ) {
'use strict';

/**
 * Front-page renderer.
 * @constructor
 *
 * @param {jQuery} $initNode
 * @param {Api} api
 *
 * @throws {Error} if a required parameter is not defined.
 *
 * @event asset
 *        Triggered when processing the input has successfully resulted in instantiating an Asset
 *        object.
 *        (1) {jQuery.Event}
 *        (2) {Asset}
 */
var FrontPage = function( $initNode, api ) {
	if( !$initNode || !api ) {
		throw new Error( 'Required parameters are nor properly defined' );
	}

	this._$node = $initNode;
	this._api = api;
	this._inputHandler = new InputHandler( api );

	document.title = messages['licence attribution generator'];
};

$.extend( FrontPage.prototype, {
	/**
	 * @type {jQuery}
	 */
	_$node: null,

	/**
	 * @type {Api}
	 */
	_api: null,

	/**
	 * @type {jQuery|null}
	 */
	_$frontPage: null,

	/**
	 * @type {InputHandler}
	 */
	_inputHandler: null,

	/**
	 * @type {string|null}
	 */
	_initialPaddingTop: null,

	/**
	 * Renders the front page.
	 */
	render: function() {
		var self = this;

		var $input = $( '<input type="text"/>' )
			.attr( 'placeholder', messages['input placeholder'] )
			.on( 'keypress', function( event ) {
				if( event.keyCode === 13 ) {
					event.preventDefault();
					self._submit();
				}
			} );

		var $frontPage = $( '<div/>' ).addClass( 'frontpage' )
			.append( $( '<h1/>' ).text( messages['licence attribution generator'] ) )
			.append( $( '<div/>' ).addClass( 'frontpage-container-input' ).append( $input ) )
			.append( $( '<button/>' ).text( messages['generate attribution'] ) );

		this._$node.append( $frontPage );

		this._renderHelp( $frontPage.find( '.frontpage-container-input' ) );

		$frontPage.find( 'input' )
		.on( 'dragenter dragover', false )
		.on( 'drop', function( event ) {
			event.preventDefault();
			self._evaluateInput( event );
		} );

		$frontPage.find( 'button' )
		.on( 'click', function() {
			self._submit();
		} );

		this._$frontPage = $frontPage;
		this._initialPaddingTop = this._$frontPage.css( 'paddingTop' );
	},

	/**
	 * Submits the input.
	 */
	_submit: function() {
		this._$frontPage.stop().animate( {
			paddingTop: this._initialPaddingTop
		} );

		this._$frontPage.find( '.frontpage-error' )
			.stop()
			.slideUp( 'fast' );

		this._$frontPage.find( '.frontpage-suggestions' ).remove();
		this._$frontPage.find( 'input' ).addClass( 'loading' );
		this._evaluateInput( this._$frontPage.find( 'input' ).val() );
	},

	/**
	 * Renders the help icon an the corresponding tooltip.
	 *
	 * @param {jQuery} $parentNode
	 */
	_renderHelp: function( $parentNode ) {
		$.get( templateRegistry.getDir( 'content' ) + 'frontpage-help.html' )
		.done( function( html ) {
			var $helpIcon = $( '<a/>' ).addClass( 'button frontpage-icon-help' ).text( '?' ),
				$helpContent = $( '<div/>' ).addClass( 'frontpage-help-content' ).html( html );

			$parentNode
			.append( $helpIcon )
			.append( $helpContent )
			.append( $( '<div/>' ).addClass( 'error frontpage-error' ) );

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
	 *         - {string|ImageInfo[]}
	 *         Rejected parameters:
	 *         - {ApplicationError}
	 *
	 * @triggers input
	 * @triggers error
	 */
	_evaluateInput: function( input ) {
		var self = this,
			deferred = $.Deferred();

		this._inputHandler.getFilename( input )
		.done( function( filenameOrImageInfos, wikiUrl ) {
			if( typeof filenameOrImageInfos === 'string' ) {
				self._processFilename( filenameOrImageInfos, wikiUrl );
				deferred.resolve( filenameOrImageInfos );
			} else {
				self._renderSuggestions( filenameOrImageInfos );
			}
		} )
		.fail( function( error ) {
			self._displayError( error );
		} )
		.always( function() {
			self._$node.find( 'input' ).removeClass( 'loading' );
		} );

		return deferred;
	},

	/**
	 * Processes a filename and updates the page rendering accordingly.
	 *
	 * @param {string} prefixedFilename
	 * @param {string} [wikiUrl]
	 *
	 * @triggers asset
	 */
	_processFilename: function( prefixedFilename, wikiUrl ) {
		var self = this;

		self._api.getAsset( prefixedFilename, wikiUrl )
		.done( function( asset ) {
			if( !asset.getLicence() ) {
				self._displayError( new ApplicationError( 'licence-unknown' ) );
				return;
			}

			if( $.inArray( asset.getMediaType(), config.custom.supportedMediaTypes ) === -1 ) {
				self._displayError( new ApplicationError( 'datatype-unsupported' ) );
				return;
			}

			$( self ).trigger( 'asset', [asset] );
		} )
		.fail( function( error ) {
			self._displayError( error );
		} )
		.always( function() {
			self._$node.find( 'input' ).removeClass( 'loading' );
		} );
	},

	/**
	 * Displays an error on the front-page.
	 *
	 * @param {ApplicationError} error
	 */
	_displayError: function( error ) {
		var $error = this._$node.find( '.error' );

		$error.stop().slideUp( 'fast', function() {
			$error.text( error.getMessage() ).slideDown( 'fast' );
		} );
	},

	/**
	 * Renders a list of suggestions for a list of file info objects.
	 *
	 * @param {ImageInfo[]} imageInfos
	 */
	_renderSuggestions: function( imageInfos ) {
		var self = this,
			$suggestions = this._$frontPage.find( '.frontpage-suggestions' );

		if( $suggestions.length === 0 ) {
			$suggestions = $( '<div/>' ).addClass( 'frontpage-suggestions ' )
				.appendTo( this._$frontPage );
		}

		/**
		 * @param {jQuery} $li
		 * @param {Object} imageInfo
		 */
		function attachEventHandler( $li, imageInfo ) {
			$li.on( 'click', function() {
				self._evaluateInput( imageInfo.getDescriptionUrl() );
			} );
		}

		var $ul = $( '<ul/>' );
		for( var i = 0; i < imageInfos.length; i++ ) {
			var $li = $( '<li/>' ).append(
				$( '<img/>' ).attr( 'border', '0' ).attr( 'src', imageInfos[i].getThumbnail().url )
			);

			attachEventHandler( $li, imageInfos[i] );

			$ul.append( $li );
		}

		$suggestions.empty().append( $ul );

		this._$frontPage.stop().animate( {
			paddingTop: '30pt'
		} );
	}

} );

return FrontPage;

} );
