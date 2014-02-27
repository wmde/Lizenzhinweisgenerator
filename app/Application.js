( function( define ) {
'use strict';

define(
	[
		'jquery',
		'app/FrontPage',
		'app/Questionnaire',
		'app/OptionsContainer',
		'dojo/i18n!./nls/Application'
	],
	function( $, FrontPage, Questionnaire, OptionsContainer, messages ) {

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
		this._frontPage = new FrontPage( this._$node, this._api );

		$( this._frontPage )
		.on( 'input', function( event, prefixedFilename, wikiUrl ) {
			self._processFilename( prefixedFilename, wikiUrl );
		} )
		.on( 'error', function( event, message ) {
			self._displayError( message );
		} );

		this._frontPage.render();
	},

	/**
	 * Processes a filename and updates the page rendering accordingly.
	 *
	 * @param {string} prefixedFilename
	 */
	_processFilename: function( prefixedFilename, wikiUrl ) {
		var self = this;

		self._api.getAsset( prefixedFilename, wikiUrl )
		.done( function( asset ) {
			if( !asset.getLicence() ) {
				self._displayError( messages['error: unable to detect licence'] );
				return;
			}

			if( asset.getMediaType() !== 'bitmap' && asset.getMediaType() !== 'drawing' ) {
				self._displayError( messages['error: unsupported data type'] );
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
			)
			.done( function( $attributedImageFrame ) {
				self._optionsContainer.setAttributionGenerator(
					self._questionnaire.getAttributionGenerator()
				);

				self._optionsContainer.getOption( 'htmlCode' )
					.setImageHtml( $attributedImageFrame.clone() );
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
	 *         Resolved parameters:
	 *         - {jQuery} Attributed image DOM.
	 *         Rejected parameters:
	 *         - {string} Error message.
	 */
	updatePreview: function( attributionGenerator, supplementPromise ) {
		var self = this,
			deferred = new $.Deferred();

		this._options.imageSize = this._optionsContainer
			? this._optionsContainer.getOption( 'imageSize' ).value()
			: this._options.imageSize;

		this._asset.getImageInfo( this._options.imageSize )
		.done( function( imageInfo ) {
			var $attributedImageFrame = self._attributedImageHtml( imageInfo );

			self._$node.find( '.app-preview' ).replaceWith(
				self._renderPreview( $attributedImageFrame )
			);

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

			deferred.resolve( $attributedImageFrame );
		} )
		.fail( function( message ) {
			deferred.reject( message );
		} );

		return deferred.promise();
	},

	/**
	 * Returns the DOM of the attributed image without the attribution.
	 *
	 * @param {ImageInfo} imageInfo
	 * @return {jQuery}
	 */
	_attributedImageHtml: function( imageInfo ) {
		var html = ''
			+ '<div class="attributed-image-frame"><div class="attributed-image">'
			+ '<a href="' + imageInfo.getDescriptionUrl() + '">'
			+ '<img border="0" src="' + imageInfo.getThumbnail().url + '"/>'
			+ '</a>'
			+ '</div></div>';

		var $attributedImageFrame = $( html );
		$attributedImageFrame.width( imageInfo.getThumbnail().width );

		return $attributedImageFrame;
	},

	/**
	 * Renders the preview.
	 *
	 * @param {jQuery} $attributedImageHtml
	 * @return {jQuery}
	 */
	_renderPreview: function( $attributedImageHtml ) {
		return $( '<div/>' ).addClass( 'app-preview' )
			.append( $( '<div/>' ).addClass( 'app-preview-spacer' ) )
			.append( $attributedImageHtml );
	}

} );

return Application;

} );

}( define ) );
