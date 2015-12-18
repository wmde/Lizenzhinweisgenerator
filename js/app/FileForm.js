'use strict';

var $ = require( 'jquery' ),
	Api = require( './Api' ),
	InputHandler = require( './InputHandler' ),
	ApplicationError = require( './ApplicationError' ),
	WikiAsset = require( './WikiAsset' ),
	config = require( '../config.json' ),
	ImageSuggestionView = require( './views/ImageSuggestionView' ),
	DialogueScreen = require( './views/DialogueScreen' ),
	Tracking = require( '../tracking.js' );

window.jQuery = $; // needed for justifiedGallery
require( 'justifiedGallery/dist/js/jquery.justifiedGallery.min' );

var FileForm = function( $node, $resultsPage ) {
	this._$node = $node;
	this._$resultsPage = $resultsPage;
	this._api = new Api( 'https://commons.wikimedia.org/' );
	this._inputHandler = new InputHandler( this._api );
	this._tracking = new Tracking();
};

$.extend( FileForm.prototype, {
	/**
	 * @type {jQuery}
	 */
	_$node: null,

	/**
	 * @type {jQuery}
	 */
	_$resultsPage: null,

	/**
	 * Initializes the submit event listener
	 */
	init: function() {
		this._$node.submit( $.proxy( this._submit, this ) );
	},

	_submit: function( e ) {
		this._$resultsPage.hide();
		this._$resultsPage.hide();
		this._evaluateInput( this._$node.find( 'input' ).val() );
		e.preventDefault();
	},

	/**
	 * Smoothly scrolls down to the results page
	 */
	_scrollToResults: function() {
		var inputHeight = 42;
		this._scrollTo( this._$resultsPage.offset().top - 3 * inputHeight );
	},

	_scrollTo: function( position ) {
		$( 'html, body' ).animate( {
			scrollTop: position
		}, 700 );
	},

	/**
	 * Evaluates any given input using the input handler.
	 *
	 * @param {string} input
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
					self._tracking.trackEvent( 'Progress', 'Start-Single', input );
					self._processFilename( filenameOrImageInfos, wikiUrl );
					deferred.resolve( filenameOrImageInfos );
				} else {
					self._tracking.trackEvent( 'Progress', 'Start-Multiple', input );
					self._showResults( filenameOrImageInfos );
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
	 * Starts the results animation and renders the picture selection
	 *
	 * @param {ImageInfo[]} imageInfos
	 */
	_showResults: function( imageInfos ) {
		this._$resultsPage.show();
		this._scrollToResults();
		this._renderSuggestions( imageInfos );
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
				if( asset instanceof WikiAsset ) {
					if( asset.getLicence() !== null && asset.getLicence().isInGroup( 'unsupported' ) ) {
						self._displayError( new ApplicationError( 'licence-unsupported' ) );
						return;
					} else if( asset.getLicence() === null ) {
						self._displayError( new ApplicationError( 'licence-not-recognized' ) );
						return;
					} else if(
						$.inArray( asset.getMediaType(), config.supportedMediaTypes ) === -1
					) {
						self._displayError( new ApplicationError( 'mediatype-unsupported' ) );
						return;
					}
				}

				self._showAsset( asset );
			} )
			.fail( function( error ) {
				self._displayError( error );
			} )
			.always( function() {
				self._$node.find( 'input' ).removeClass( 'loading' );
			} );
	},

	/**
	 * Loads asset information and starts the dialogue on the next screen
	 *
	 * @param {Asset} asset
	 */
	_showAsset: function( asset ) {
		var self = this;

		asset.getImageInfo( 300 )
			.done( function( imageInfo ) {
				$( '.dialogue-screen' ).remove();
				var $dialogueScreen = $( '<div class="dialogue-screen"/>' );
				self._$resultsPage.after( $dialogueScreen );

				new DialogueScreen( imageInfo, asset ).render( $dialogueScreen );
				self._scrollTo( $dialogueScreen.offset().top );
			} )
			.fail( function( error ) {
				self._displayError( error );
			} );
	},

	/**
	 * Displays an error on the front-page.
	 *
	 * @param {ApplicationError} error
	 */
	_displayError: function( error ) {
		var self = this;

		console.log( error.getMessage() );
		self._tracking.trackEvent( 'Progress', 'Error', error.getCode() );

		$( '#file-form-alert-placeholder' ).text( error.getMessage() );
		$( '#file-form-input' ).css( 'color', '#bf311a' );
		$( '#file-form-alert' ).slideDown();
	},

	/**
	 * Displays an error on the front-page.
	 */
	_dismissError: function() {
		$( '#file-form-input' ).removeAttr( 'style' );
		$( '#file-form-alert' ).slideUp();
	},

	/**
	 * Renders a list of suggestions for a list of file info objects.
	 *
	 * @param {ImageInfo[]} imageInfos
	 */
	_renderSuggestions: function( imageInfos ) {
		var self = this;

		this._$resultsPage.html( '' );
		$.each( imageInfos, function( _, image ) {
			self._appendSuggestion( image );
		} );

		this._$resultsPage.justifiedGallery( { margins: 3, rowHeight: 200 } );
	},

	/**
	 * Appends a suggestion to the $_resultsPage
	 * @param imageInfo
	 */
	_appendSuggestion: function( imageInfo ) {
		var $suggestion = $( new ImageSuggestionView( imageInfo ).render() ),
			self = this;

		$suggestion.on( 'click', function( e ) {
			self._evaluateInput( imageInfo.getDescriptionUrl() );
			e.preventDefault();
		} );
		self._$resultsPage.append( $suggestion );
	}
} );

module.exports = FileForm;
