( function( define ) {
'use strict';

define(
	['jquery', 'FrontPage', 'Questionnaire', 'OptionsContainer' ],
	function( $, FrontPage, Questionnaire, OptionsContainer ) {

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
	 * @type {FrontPage|null}
	 */
	_frontPage: null,

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
		var self = this;
		this._frontPage = new FrontPage( this._$node );

		$( this._frontPage )
		.on( 'input', function( event, filename ) {
			self._processFilename( filename );
		} )
		.on( 'error', function( event, message ) {
			self._displayError( message );
		} );

		this._frontPage.render();
	},

	/**
	 * Processes a filename and updates the page rendering accordingly.
	 *
	 * @param {string} filename
	 */
	_processFilename: function( filename ) {
		var self = this;

		self._api.getAsset( filename )
		.done( function( asset ) {
			if( !asset.getLicence() ) {
				self._displayError( 'Leider konnte die Lizenz des verwiesenen Bildes nicht '
					+ 'ermittelt werden oder wird von dieser Anwendung nicht unterstützt.' );
				return;
			}

			if( asset.getMediaType() !== 'bitmap' && asset.getMediaType() !== 'drawing' ) {
				self._displayError( 'Der Datentyp der angegebenen Datei wird von dieser '
					+ 'Applikation momentan leider nicht unterstützt.' );
				return;
			}

			self._asset = asset;
			self._renderApplicationPage();
		} )
		.fail( function( message ) {
			self._displayError( message );
		} )
		.always( function() {
			self._$node.find( 'input' ).removeClass( 'loading' );
		} );
	},

	/**
	 * Displays an error on the front-page.
	 *
	 * @param {string} message
	 */
	_displayError: function( message ) {
		var $error = this._$node.find( '.error' );

		$error.stop().slideUp( 'fast', function() {
			$error.text( message ).slideDown( 'fast' );
		} );
	},

	/**
	 * Renders the application page.
	 */
	_renderApplicationPage: function() {
		var self = this;

		this._$node.empty().append( $( '<div/>' ).addClass( 'app-preview' ) );

		this._questionnaire = this._renderQuestionnaire();
		this._questionnaire.start().done( function() {
			self._optionsContainer = self._renderOptionsContainer();
		} );

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

		var $questionnaire = $( '<div/>' ).addClass( 'app-questionnaire' ).prependTo( this._$node ),
			questionnaire = new Questionnaire( $questionnaire, this._asset );

		$( questionnaire )
		.on( 'update', function( event, attributionGenerator, supplementPromise ) {
			self.updatePreview( attributionGenerator, supplementPromise ).done( function() {
				self._optionsContainer.setAttributionGenerator( attributionGenerator );

				var optionKeys = ( attributionGenerator.getOptions().format === 'html' )
					? ['htmlCode']
					: [];

				self._optionsContainer.render( optionKeys, self._options );
			} );
		} )
		.on( 'exit', function() {
			$questionnaire.remove();
		} );

		return questionnaire;
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

		this._options.imageSize = this._optionsContainer
			? this._optionsContainer.getOption( 'imageSize' ).value()
			: this._options.imageSize;

		return this._asset.getImageInfo( this._options.imageSize )
		.done( function( imageInfo ) {
			self._$node.find( '.app-preview' ).replaceWith( self._renderPreview( imageInfo ) );

			var $preview = self._$node.find( '.app-preview' );

			$preview.find( '.attributed-image-frame' ).append( attributionGenerator.generate() );

			$preview.find( 'img' ).on( 'load', function() {
				$preview.find( '.app-preview-spacer' ).css(
					'marginBottom',
					-1 * parseInt( $preview.find( '.attributed-image-frame' ).height() / 2, 10 )
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
	 * Returns the DOM of the attributed image without the attribution.
	 *
	 * @param {Object} imageInfo
	 * @return {jQuery}
	 */
	_attributedImageHtml: function( imageInfo ) {
		var html = ''
			+ '<div class="attributed-image-frame"><div class="attributed-image">'
			+ '<a href="' + imageInfo.descriptionurl + '">'
			+ '<img border="0" src="' + imageInfo.thumburl + '"/>'
			+ '</a>'
			+ '</div></div>';

		var $attributedImageFrame = $( html );
		$attributedImageFrame.width( imageInfo.thumbwidth );

		return $attributedImageFrame;
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
			.append( this._attributedImageHtml( imageInfo ) );
	}

} );

return Application;

} );

}( define ) );
