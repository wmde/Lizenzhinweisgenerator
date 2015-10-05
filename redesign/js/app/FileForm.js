'use strict';

var $ = require( 'jquery' ),
	Api = require( './Api' ),
	NoApi = require( './NoApi' ),
	InputHandler = require( './InputHandler' );

var FileForm = function( $node ) {
	this._$node = $node;

	$node.submit( $.proxy( this._submit, this ) );
};

$.extend( FileForm.prototype, {
	/**
	 * @type {jQuery}
	 */
	_$node: null,

	_submit: function( e ) {
		e.preventDefault();
		this._evaluateInput( this._$node.find( 'input' ).val() );
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

		if ( !input.match( /wiki(m|p)edia\.org/ ) ) {
			this._api = new NoApi();
		} else {
			this._api = new Api( 'https://commons.wikimedia.org/' );
		}
		this._inputHandler = new InputHandler( this._api );

		this._inputHandler.getFilename( input )
			.done( function( filenameOrImageInfos, wikiUrl ) {
				if ( typeof filenameOrImageInfos === 'string' ) {
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
				if ( asset instanceof WikiAsset ) {
					if ( asset.getLicence() !== null && asset.getLicence().isInGroup( 'unsupported' ) ) {
						self._displayError( new ApplicationError( 'licence-unsupported' ) );
						return;
					} else if ( asset.getLicence() === null ) {
						self._displayError( new ApplicationError( 'licence-not-recognized' ) );
						return;
					} else if (
						$.inArray( asset.getMediaType(), config.custom.supportedMediaTypes ) === -1
					) {
						self._displayError( new ApplicationError( 'mediatype-unsupported' ) );
						return;
					}
				}
				$( self ).trigger( 'asset', [ asset ] );
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
		// FIXME: Use the bootstrap error thing.
		alert( error.getMessage() );
	},

	/**
	 * Renders a list of suggestions for a list of file info objects.
	 *
	 * @param {ImageInfo[]} imageInfos
	 */
	_renderSuggestions: function( imageInfos ) {
		// FIXME: Render images here
		console.log( imageInfos );
	}
} );

module.exports = FileForm;
