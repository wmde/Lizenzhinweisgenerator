this.app = this.app || {};

app.Application = ( function( $, app ) {
'use strict';

/**
 * Application renderer.
 * @constructor
 *
 * @param {jQuery} $initNode
 * @param {app.Api} api
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
	 * @type {app.Api}
	 */
	_api: null,

	/**
	 * @type {Object}
	 */
	_options: null,

	/**
	 * The asset currently handled by the application.
	 * @type {app.Asset|null}
	 */
	_asset: null,

	/**
	 * Most current image information as retrieved from the API.
	 * @type {Object}
	 */
	_imageInfo: null,

	/**
	 * @type {app.Questionnaire}
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

		app.inputHandler.getFilename( input )
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

		this._$node.empty();

		this._$node.empty()
		.append(
			$( '<div/>' ).addClass( 'app-frameset' )
			.append(
				$( '<div/>' ).addClass( 'app-preview-container' )
				.append( $( '<div/>' ).addClass( 'app-preview' ) )
				.append( $( '<div/>' ).addClass( 'app-options' ) )
			)
			.append( $( '<div/>' ).addClass( 'app-questionnaire' ) )
		);

		this.updatePreview().done( function() {
			self._$node.find( '.app-options' ).append(
				self._renderInput( 'imageSize' )
			);
		} );

		this._renderQuestionnaire();
	},

	/**
	 * Renders and starts the questionnaire.
	 */
	_renderQuestionnaire: function() {
		var $questionnaire = this._$node.find( '.app-questionnaire' ).empty();
		this._questionnaire = new app.Questionnaire( $questionnaire, this._asset );
		this._questionnaire.start();
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
				self.updatePreview();
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
	 * @return {Object} jQuery Promise
	 */
	updatePreview: function() {
		var self = this;

		return this._asset.getImageInfo( this._options.imageSize )
		.done( function( imageInfo ) {
			self._$node.find( '.app-preview' ).replaceWith( self._renderPreview( imageInfo ) );
		} );
	},

	/**
	 * Renders the preview.
	 *
	 * @param {Object} imageInfo
	 * @return {jQuery}
	 */
	_renderPreview: function( imageInfo ) {
		return $( '<div/>' ).addClass( 'app-preview' ).append(
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
			.append(
				$( '<div/>' ).addClass( 'attribution' )
				.append(
					$( '<div/>' ).addClass( 'attribution-title' ).text( this._asset.getTitle() )
				)
				.append( this._renderAttribution().addClass( 'attribution-text' ) )
			)
		);
	},

	/**
	 * Renders the attribution text.
	 *
	 * @return {jQuery}
	 */
	_renderAttribution: function() {
		var $attribution = $( '<div/>' );

		var hasAuthors = this._asset.getAuthors().length > 0
			&& this._asset.getAuthors()[0].getName() !== 'unknown';

		if( this._asset.getAttribution() ) {
			$attribution.append( $( '<div/>' ).text( this._asset.getAttribution() ) );
		} else if( !hasAuthors ) {
			$attribution.append( $( '<span/>' ).text(
				this._asset.getSource() ? this._asset.getSource() : 'Unbekannter Urheber'
			) );
		} else {
			var authors = this._asset.getAuthors(),
				$authors = $( '<span/>' );

			$authors.text( 'Urheber: ');

			$.each( authors, function( i, author ) {
				var url = author.getUrl();

				if( i > 0 ) {
					$authors.append( document.createTextNode( ', ' ) );
				}

				if( !url ) {
					$authors.append( document.createTextNode( author.getName() ) );
					return true;
				}

				if( url.substr( 0, 2 ) === '//' ) {
					url = 'http:' + url ;
				}

				$authors.append(
					$( '<a/>' ).attr( 'href', author.getUrl() ).text( author.getName() )
				);
			} );

			$attribution.append( $authors );
		}

		var licence = this._asset.getLicence();

		$attribution
		.append( '; ')
		.append(
			licence
			? $( '<span/>' ).append( $( '<span class="licence"/>' ).html( licence.getHtml() ) )
			: $( '<span/>' ).text( 'Unknown licence' )
		);

		return $attribution;
	}

} );

return Application;

}( jQuery, app ) );
