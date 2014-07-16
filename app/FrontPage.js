/**
 * @licence GNU GPL v3
 * @author snater.com < wikimedia@snater.com >
 */
define( [
	'jquery',
	'app/InputHandler',
	'dojo/i18n!./nls/FrontPage',
	'templates/registry',
	'app/ApplicationError',
	'app/Api',
	'app/NoApi',
	'app/WikiAsset'
], function(
	$,
	InputHandler,
	messages,
	templateRegistry,
	ApplicationError,
	Api,
	NoApi,
	WikiAsset
) {
'use strict';

/**
 * Front-page renderer.
 * @constructor
 *
 * @param {jQuery} $node
 * @param {string} url
 *
 * @throws {Error} if a required parameter is not defined.
 *
 * @event asset
 *        Triggered when processing the input has successfully resulted in instantiating an Asset
 *        object.
 *        (1) {jQuery.Event}
 *        (2) {Asset}
 */
var FrontPage = function( $node, url ) {
	if( !$node ) {
		throw new Error( 'Required parameters are not properly defined' );
	}

	this._$node = $node.addClass( 'frontpage' );

	document.title = messages['attribution generator'];

	this._render( url );
};

$.extend( FrontPage.prototype, {
	/**
	 * @type {jQuery}
	 */
	_$node: null,

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
	 *
	 * @param {string} [url]
	 */
	_render: function( url ) {
		var self = this;

		var $input = $( '<input type="text"/>' )
			.attr( 'placeholder', messages['input placeholder'] )
			.on( 'keypress', function( event ) {
				if( event.keyCode === 13 ) {
					event.preventDefault();
					self._submit();
				}
			} );

		if( url ) {
			$input.val( url );
		}

		this._$node
		.append( $( '<h1/>' ).text( messages['attribution generator'] ) )
		.append( $( '<div/>' ).addClass( 'frontpage-container-input' ).append( $input ) )
		.append( $( '<button/>' ).text( messages['generate attribution'] ) );

		this._renderHelp( this._$node.find( '.frontpage-container-input' ) );

		this._$node.find( 'input' )
		.on( 'dragenter dragover', false )
		.on( 'drop', function( event ) {
			event.preventDefault();
			self._evaluateInput( event );
		} );

		this._$node.find( 'button' )
		.on( 'click', function() {
			self._submit();
		} );
	},

	/**
	 * Submits the input.
	 */
	_submit: function() {
		this._initialPaddingTop = this._initialPaddingTop || this._$node.css( 'paddingTop' );

		this._$node.stop().animate( {
			paddingTop: this._initialPaddingTop
		} );

		this._$node.find( '.frontpage-error' )
			.stop()
			.slideUp( 'fast' );

		this._$node.find( '.frontpage-suggestions' ).remove();
		this._$node.find( 'input' ).addClass( 'loading' );
		this._evaluateInput( this._$node.find( 'input' ).val() );
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

		if( !input.match( /wiki(m|p)edia\.org/ ) ) {
			this._api = new NoApi();
		} else {
			this._api = new Api( '//commons.wikimedia.org/' );
		}
		this._inputHandler = new InputHandler( this._api );

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
			if( asset instanceof WikiAsset && asset.getLicence().isInGroup( 'unsupported' ) ) {
				self._displayError( new ApplicationError( 'licence-unsupported' ) );
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
			$suggestions = this._$node.find( '.frontpage-suggestions' );

		if( $suggestions.length === 0 ) {
			$suggestions = $( '<div/>' ).addClass( 'frontpage-suggestions ' )
				.appendTo( this._$node );
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

		this._$node.stop().animate( {
			paddingTop: '30pt'
		} );
	}

} );

return FrontPage;

} );
