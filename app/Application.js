( function( define ) {
'use strict';

define( ['jquery', 'inputHandler', 'Questionnaire' ], function( $, inputHandler, Questionnaire ) {

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
	 * @type {Questionnaire}
	 */
	_questionnaire: null,

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

		inputHandler.getFilename( input )
		.done( function( filename ) {
			self._api.getAsset( filename )
			.done( function( asset ) {
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

		var $frontPage = $( '<div/>' ).addClass( 'app-frontpage' )
			.append(
				$( '<input type="text"/>' )
				.attr( 'placeholder', 'Internetadresse des Bildes' )
			)
			.append( $( '<button/>' ).text( 'Lizenztext erzeugen' ) );

		this._$node.append( $frontPage );

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

		this._$node.empty()
		.append( $( '<div/>' ).addClass( 'app-preview' ) )
		.append( $( '<div/>' ).addClass( 'app-options' ) );

		this._questionnaire = this._renderQuestionnaire();

		self._$node.find( '.app-options' ).append(
			self._renderInput( 'imageSize' )
		);

		this._questionnaire.start();
		// Evaluate to get the default attribution:
		self.updatePreview(
			self._questionnaire.generateAttribution(),
			self._questionnaire.generateSupplement()
		);
	},

	/**
	 * Renders and starts the questionnaire.
	 */
	_renderQuestionnaire: function() {
		var self = this;

		// Remove any pre-existing node:
		this._$node.find( '.app-questionnaire' ).remove();

		var $questionnaire = $( '<div/>' ).addClass( 'app-questionnaire' ).prependTo( this._$node );

		$questionnaire.on( 'update', function(
			event,
			$attribution,
			supplementPromise
		) {
			self.updatePreview( $attribution, supplementPromise ).done();
		} )
		.on( 'exit', function( event ) {
			$questionnaire.remove();
		} );

		return new Questionnaire( $questionnaire, this._asset );
	},

	/**
	 * Renders an input element.
	 *
	 * @param {string} optionName
	 * @return {jQuery}
	 */
	_renderInput: function( optionName ) {
		var self = this,
			$container = $( '<span/>' );

		if( optionName === 'imageSize' ) {
			var $label = $( '<label for="app-"' + optionName + '/>' ).text( 'Bildgröße: ' ),
				$select = $( '<select/>' ),
				values = [200, 300, 400, 500, 1000],
				selected = 500;

			for( var i = 0; i < values.length; i++ ) {
				var $option = $( '<option/>' ).attr( 'value', values[i] ).text( values[i] );
				if( values[i] === selected ) {
					$option.prop( 'selected', true );
				}
				$select.append( $option );
			}

			$select.on( 'change', function() {
				self._options.imageSize = $select.val();
				if( self._questionnaire ) {
					self.updatePreview(
						self._questionnaire.generateAttribution(),
						self._questionnaire.generateSupplement()
					);
				}
			} );

			$container
			.append( $label )
			.append( $select );
		}

		return $container;
	},

	/**
	 * Updates the preview.
	 *
	 * @param {jQuery} $attribution
	 * @param {Object} supplementPromise
	 * @return {Object} jQuery Promise
	 */
	updatePreview: function( $attribution, supplementPromise ) {
		var self = this;

		return this._asset.getImageInfo( this._options.imageSize )
		.done( function( imageInfo ) {
			self._$node.find( '.app-preview' ).replaceWith( self._renderPreview( imageInfo ) );

			var $preview = self._$node.find( '.app-preview' );

			$preview.find( '.app-preview-frame' ).append( $attribution );

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
				$( '<div/>' ).addClass( 'app-preview-frame' )
				.append(
					$( '<div/>' ).addClass( 'app-preview-image' ).append(
						$( '<a/>' ).attr( 'href', imageInfo.descriptionurl ).append(
							$( '<img/>' )
							.attr( 'border', '0' )
							.attr( 'src', imageInfo.thumburl )
						)
					)
				)
			);
	}

} );

return Application;

} );

}( define ) );
