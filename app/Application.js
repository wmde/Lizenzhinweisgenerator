/**
 * @licence GNU GPL v3
 * @author snater.com < wikimedia@snater.com >
 */
define(
	[
		'jquery',
		'app/Navigation',
		'app/FrontPage',
		'app/Preview',
		'app/Questionnaire',
		'app/OptionContainer'
	],
	function( $, Navigation, FrontPage, Preview, Questionnaire, OptionContainer ) {
'use strict';

/**
 * Application renderer
 * @constructor
 *
 * @param {jQuery} $node
 * @param {Api} api
 * @param {Object} [options]
 *
 * @throws {Error} if a required parameter is not defined.
 */
var Application = function( $node, api, options ) {
	if( !$node || !api ) {
		throw new Error( 'Required parameters are nor properly defined' );
	}

	this._$node = $node;
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
	 * @type {FrontPage|null}
	 */
	_frontPage: null,

	/**
	 * @type {Navigation|null}
	 */
	_navigation: null,

	/**
	 * @type {Preview|null}
	 */
	_preview: null,

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
			self._renderApplicationPage( asset );
		} );

		this._frontPage.render();
	},

	/**
	 * Renders the application page.
	 *
	 * @param {Asset} asset
	 */
	_renderApplicationPage: function( asset ) {
		var self = this;

		var $preview = $( '<div/>' );
		this._preview = new Preview( $preview, asset );

		this._$node
		.empty()
		.append( this._navigation.create() )
		.append( $preview );

		this._questionnaire = this._renderQuestionnaire();
		this._questionnaire.start().done( function() {
			self._optionContainer = self._renderOptionContainer();
		} );

		// Evaluate to get the default attribution:
		this._preview.update(
			self._questionnaire.getAttributionGenerator(),
			self._questionnaire.generateSupplement(),
			self._getImageSize()
		).done( function() {
			self._optionContainer.setAttributionGenerator(
				self._questionnaire.getAttributionGenerator()
			);
		} );
	},

	/**
	 * Renders and starts the questionnaire.
	 *
	 * @param {Asset} asset
	 */
	_renderQuestionnaire: function( asset ) {
		var self = this;

		// Remove any pre-existing node:
		this._$node.find( '.application-questionnaire' ).remove();

		var $questionnaire = $( '<div/>' )
				.addClass( 'application-questionnaire' )
				.prependTo( this._$node ),
			questionnaire = new Questionnaire( $questionnaire, asset );

		$( questionnaire )
		.on( 'update', function( event, attributionGenerator, supplementPromise ) {
			self._preview.update(
				attributionGenerator,
				supplementPromise,
				self._getImageSize()
			).done( function() {
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
	 *
	 * @param {Asset} asset
	 */
	_renderOptionContainer: function( asset ) {
		this._$node.find( '.application-optioncontainer' ).remove();

		var self = this,
			$optionContainer = $( '<div/>' )
				.addClass( 'application-optioncontainer' )
				.appendTo( this._$node ),
			optionContainer = new OptionContainer( $optionContainer, asset ),
			licence = asset.getLicence(),
			renderRawText = !licence.isInGroup( 'pd') && !licence.isInGroup( 'cc0' );

		if( renderRawText ) {
			optionContainer.push( 'rawText' );
		}

		$( optionContainer ).on( 'update', function() {
			self._preview.update(
				self._questionnaire.getAttributionGenerator(),
				self._questionnaire.generateSupplement(),
				self._getImageSize()
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
	 * @return {number}
	 */
	_getImageSize: function() {
		return this._optionContainer
			? this._optionContainer.getOption( 'imageSize' ).value()
			: this._options.imageSize;
	}

} );

return Application;

} );
