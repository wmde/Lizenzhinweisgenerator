( function( define ) {
'use strict';

define(
	['jquery', 'InputHandler', 'Questionnaire', 'OptionsContainer' ],
	function( $, InputHandler, Questionnaire, OptionsContainer ) {

/**
 * Application renderer.
 * @constructor
 *
 * @param {jQuery} $initNode
 * @param {Api} api
 * @param {Object} [options]
 *
 * @throws {Error} if a required parameter is not defined.
 */
var Application = function( $initNode, api, options ) {
	if( !$initNode || !api ) {
		throw new Error( 'Required parameters are nor properly defined' );
	}

	this._$node = $initNode;
	this._api = api;
	this._inputHandler = new InputHandler();

	this._options = $.extend( {
		'imageSize': 500
	}, ( options || {} ) );
};

$.extend( Application.prototype, {
	/**
	 * @type {jQuery}
	 */
	_$node: null,

	/**
	 * @type {Api}
	 */
	_api: null,

	/**
	 * @type {InputHandler}
	 */
	_inputHandler: null,

	/**
	 * @type {Object}
	 */
	_options: null,

	/**
	 * The asset currently handled by the application.
	 * @type {Asset|null}
	 */
	_asset: null,

	/**
	 * Most current image information as retrieved from the API.
	 * @type {Object}
	 */
	_imageInfo: null,

	/**
	 * @type {Questionnaire}
	 */
	_questionnaire: null,

	/**
	 * @type {OptionsContainer}
	 */
	_optionsContainer: null,

	/**
	 * Starts the application.
	 */
	start: function() {
		this._renderFrontPage();
	},

	/**
	 * Evaluate any input and updates the page rendering accordingly.
	 *
	 * @param {string|jQuery.Event} input
	 */
	_evaluateInput: function( input ) {
		var self = this;

		this._inputHandler.getFilename( input )
		.done( function( filename ) {
			self._api.getAsset( filename )
			.done( function( asset ) {
				if( !asset.getLicence() ) {
					self._$node.find( '.error' )
					.text( 'Leider konnte die Lizenz des verwiesenen Bildes nicht ermittelt werden '
						+ 'oder wird von dieser Anwendung nicht unterstützt.'
					)
					.slideDown( 'fast' );

					return;
				}

				self._asset = asset;
				self._renderApplicationPage();
			} );
		} );
	},

	/**
	 * Renders the application's front page.
	 */
	_renderFrontPage: function() {
		var self = this;

		this._$node.empty();

		var $frontPage = $( '<div/>' ).addClass( 'frontpage' )
			.append( $( '<h1/>' ).text( 'Lizenzverweisgenerator' ) )
			.append(
				$( '<div/>' ).addClass( 'container-input' )
				.append(
					$( '<input type="text"/>' ).attr(
						'placeholder',
						'Internetadresse des Bildes auf Wikimedia Commons'
					)
				)
			)
			.append( $( '<button/>' ).text( 'Lizenztext erzeugen' ) );

		this._$node.append( $frontPage );

		$.get( './templates/frontpage-help.html' )
		.done( function( html ) {
			var $helpIcon = $( '<a/>' ).addClass( 'icon-help' ).text( '?' ),
				$helpContent = $( '<div/>' ).addClass( 'help-content' ).html( html );

			$frontPage.find( '.container-input' )
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

		$frontPage.find( 'input' )
		.on( 'dragenter dragover', false )
		.on( 'drop', function( event ) {
			event.preventDefault();
			self._evaluateInput( event );
		} );

		$frontPage.find( 'button' )
		.on( 'click', function() {
			self._evaluateInput( $frontPage.find( 'input' ).val() );
		} );
	},

	/**
	 * Renders the application page.
	 */
	_renderApplicationPage: function() {
		var self = this;

		this._$node.empty().append( $( '<div/>' ).addClass( 'app-preview' ) );

		this._questionnaire = this._renderQuestionnaire();

		this._questionnaire.start();
		this._optionsContainer = this._renderOptionsContainer();

		// Evaluate to get the default attribution:
		self.updatePreview(
			self._questionnaire.getAttributionGenerator(),
			self._questionnaire.generateSupplement()
		).done( function() {
			self._optionsContainer.setAttributionGenerator(
				self._questionnaire.getAttributionGenerator()
			);
		} );
	},

	/**
	 * Renders and starts the questionnaire.
	 */
	_renderQuestionnaire: function() {
		var self = this;

		// Remove any pre-existing node:
		this._$node.find( '.app-questionnaire' ).remove();

		var $questionnaire = $( '<div/>' ).addClass( 'app-questionnaire' ).prependTo( this._$node );

		$questionnaire.on( 'update', function( event, attributionGenerator, supplementPromise ) {
			self.updatePreview( attributionGenerator, supplementPromise ).done( function() {
				self._optionsContainer.setAttributionGenerator( attributionGenerator );
				var optionKeys = ( self._questionnaire.getUseCase() === 'html' )
					? ['htmlCode']
					: [];
				self._optionsContainer.render( optionKeys );
			} );
		} )
		.on( 'exit', function() {
			$questionnaire.remove();
		} );

		return new Questionnaire( $questionnaire, this._asset );
	},

	/**
	 * Renders the options container and attaches corresponding events.
	 */
	_renderOptionsContainer: function() {
		this._$node.find( '.app-options' ).remove();

		var self = this,
			$optionsContainer = $( '<div/>' ).addClass( 'app-options' ).appendTo( this._$node ),
			optionsContainer = new OptionsContainer( $optionsContainer, this._asset );

		optionsContainer.render();
		$( optionsContainer ).on( 'update', function() {
			self.updatePreview(
				self._questionnaire.getAttributionGenerator(),
				self._questionnaire.generateSupplement()
			).done( function() {
				self._optionsContainer.setAttributionGenerator(
					self._questionnaire.getAttributionGenerator()
				);
			} );
		} );

		return optionsContainer;
	},

	/**
	 * Updates the preview.
	 *
	 * @param {AttributionGenerator} attributionGenerator
	 * @param {Object} supplementPromise
	 * @return {Object} jQuery Promise
	 */
	updatePreview: function( attributionGenerator, supplementPromise ) {
		var self = this;

		return this._asset.getImageInfo( this._optionsContainer.getOption( 'imageSize' ).value() )
		.done( function( imageInfo ) {
			self._$node.find( '.app-preview' ).replaceWith( self._renderPreview( imageInfo ) );

			var $preview = self._$node.find( '.app-preview' );

			$preview.find( '.app-preview-frame' ).append( attributionGenerator.generate() );

			$preview.find( 'img' ).on( 'load', function() {
				$preview.find( '.app-preview-spacer' ).css(
					'marginBottom',
					-1 * parseInt( $preview.find( '.app-preview-frame' ).height() / 2, 10 )
				);
			} );

			supplementPromise.done( function( $supplement ) {
				$preview.append(
					$( '<div/>' ).addClass( 'app-preview-supplement' ).append( $supplement )
				);
			} );
		} );
	},

	/**
	 * Renders the preview.
	 *
	 * @param {Object} imageInfo
	 * @return {jQuery}
	 */
	_renderPreview: function( imageInfo ) {
		return $( '<div/>' ).addClass( 'app-preview' )
			.append( $( '<div/>' ).addClass( 'app-preview-spacer' ) )
			.append(
				$( '<div/>' ).addClass( 'app-preview-frame' ).width( imageInfo.thumbwidth )
				.append(
					$( '<div/>' ).addClass( 'app-preview-image' ).append(
						$( '<a/>' ).attr( 'href', imageInfo.descriptionurl ).append(
							$( '<img/>' ).attr( 'border', '0' ).attr( 'src', imageInfo.thumburl )
						)
					)
				)
			);
	}

} );

return Application;

} );

}( define ) );
