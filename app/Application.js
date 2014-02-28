( function( define ) {
'use strict';

define(
	[
		'jquery',
		'app/Navigation',
		'app/FrontPage',
		'app/Questionnaire',
		'app/OptionContainer'
	],
	function( $, Navigation, FrontPage, Questionnaire, OptionContainer ) {

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
	 * @type {Navigation|null}
	 */
	_navigation: null,

	/**
	 * @type {Questionnaire|null}
	 */
	_questionnaire: null,

	/**
	 * @type {OptionContainer|null}
	 */
	_optionContainer: null,

	/**
	 * Starts the application.
	 */
	start: function() {
		var self = this;

		this._$node.empty();

		this._navigation = new Navigation( this._$node, this._api );
		this._$node.append( this._navigation.create( false ) );

		this._frontPage = new FrontPage( this._$node, this._api );

		$( this._frontPage )
		.on( 'asset', function( event, asset ) {
			self._asset = asset;
			self._renderApplicationPage();
		} );

		this._frontPage.render();
	},

	/**
	 * Renders the application page.
	 */
	_renderApplicationPage: function() {
		var self = this;

		this._$node
		.empty()
		.append( this._navigation.create() )
		.append( $( '<div/>' ).addClass( 'application-preview' ) );

		this._questionnaire = this._renderQuestionnaire();
		this._questionnaire.start().done( function() {
			self._optionContainer = self._renderOptionContainer();
		} );

		// Evaluate to get the default attribution:
		self.updatePreview(
			self._questionnaire.getAttributionGenerator(),
			self._questionnaire.generateSupplement()
		).done( function() {
			self._optionContainer.setAttributionGenerator(
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
		this._$node.find( '.application-questionnaire' ).remove();

		var $questionnaire = $( '<div/>' )
				.addClass( 'application-questionnaire' )
				.prependTo( this._$node ),
			questionnaire = new Questionnaire( $questionnaire, this._asset );

		$( questionnaire )
		.on( 'update', function( event, attributionGenerator, supplementPromise ) {
			self.updatePreview( attributionGenerator, supplementPromise ).done( function() {
				self._optionContainer.push( 'htmlCode' );
				self._optionContainer.setAttributionGenerator( attributionGenerator );
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
	_renderOptionContainer: function() {
		this._$node.find( '.application-optioncontainer' ).remove();

		var self = this,
			$optionContainer = $( '<div/>' )
				.addClass( 'application-optioncontainer' )
				.appendTo( this._$node ),
			optionContainer = new OptionContainer( $optionContainer, this._asset ),
			licence = this._asset.getLicence(),
			renderRawText = !licence.isInGroup( 'pd') && !licence.isInGroup( 'cc0' );

		if( renderRawText ) {
			optionContainer.push( 'rawText' );
		}

		$( optionContainer ).on( 'update', function() {
			self.updatePreview(
				self._questionnaire.getAttributionGenerator(),
				self._questionnaire.generateSupplement()
			)
			.done( function( $attributedImageFrame ) {
				self._optionContainer.setAttributionGenerator(
					self._questionnaire.getAttributionGenerator()
				);

				self._optionContainer.getOption( 'htmlCode' )
					.setImageHtml( $attributedImageFrame.clone() );
			} );
		} );

		return optionContainer;
	},

	/**
	 * Updates the preview.
	 *
	 * @param {AttributionGenerator} attributionGenerator
	 * @param {Object} supplementPromise
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {jQuery} Attributed image DOM
	 *         Rejected parameters:
	 *         - {ApiError}
	 */
	updatePreview: function( attributionGenerator, supplementPromise ) {
		var self = this,
			deferred = new $.Deferred();

		this._options.imageSize = this._optionContainer
			? this._optionContainer.getOption( 'imageSize' ).value()
			: this._options.imageSize;

		this._asset.getImageInfo( this._options.imageSize )
		.done( function( imageInfo ) {
			var $attributedImageFrame = self._attributedImageHtml( imageInfo );

			self._$node.find( '.application-preview' ).replaceWith(
				self._renderPreview( $attributedImageFrame )
			);

			var $preview = self._$node.find( '.application-preview' );

			$preview.find( '.attributed-image-frame' ).append( attributionGenerator.generate() );

			$preview.find( 'img' ).on( 'load', function() {
				$preview.find( '.application-preview-spacer' ).css(
					'marginBottom',
					-1 * parseInt( $preview.find( '.attributed-image-frame' ).height() / 2, 10 )
				);
			} );

			supplementPromise.done( function( $supplement ) {
				$preview.append(
					$( '<div/>' ).addClass( 'application-preview-supplement' ).append( $supplement )
				);
			} );

			deferred.resolve( $attributedImageFrame );
		} )
		.fail( function( error ) {
			self._$node.find( '.application-preview' ).empty().append(
				$( '<div/>' )
				.addClass( 'application-preview-error error' )
				.text( error.getMessage() )
			);
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
		return $( '<div/>' ).addClass( 'application-preview' )
			.append( $( '<div/>' ).addClass( 'application-preview-spacer' ) )
			.append( $attributedImageHtml );
	}

} );

return Application;

} );

}( define ) );
