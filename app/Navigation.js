( function( define ) {
'use strict';

define(
	[ 'jquery', 'dojo/i18n!./nls/Navigation', 'templates/registry' ],
	function( $, messages, templateRegistry ) {

/**
 * Main navigation renderer creating and managing the main menu and its referred content.
 * @constructor
 *
 * @param {jQuery} $initNode
 * @param {Api} api
 *
 * @throws {Error} if a required parameter is not defined.
 */
var Navigation = function( $initNode, api ) {
	if( !$initNode || !api ) {
		throw new Error( 'Required parameters are nor properly defined' );
	}

	this._$node = $initNode;
	this._api = api;
};

$.extend( Navigation.prototype, {
	/**
	 * @type {jQuery}
	 */
	_$node: null,

	/**
	 * @type {Api}
	 */
	_api: null,

	/**
	 * Renders the global navigation bar.
	 *
	 * @param {boolean} showStartButton
	 *        Default: true
	 */
	create: function( showStartButton ) {
		var self = this;

		var $navigation = $( '<ul class="navigation">'
			+ '<li class="button-home">' + messages['Start'] + '</li>'
			+ '<li class="button-about">' + messages['About'] + '</li>'
			+ '<li class="button-feedback">' + messages['Feedback'] + '</li>'
			+ '</ul>' );

		$navigation.children( '.button-home' )
		.on( 'click', function() {
			location.reload();
		} );

		if( !showStartButton && showStartButton !== undefined ) {
			$navigation.children( '.button-home' ).hide();
		}

		$navigation.children( '.button-about' )
		.on( 'click', function() {
			self._showOverlay( 'about' );
		} );

		$navigation.children( '.button-feedback' )
		.on( 'click', function() {
			self._showOverlay( 'feedback' );
		} );

		return $navigation;
	},

	/**
	 * Shows the global overlay filling its content with a specific content page.
	 *
	 * @param {string} page
	 */
	_showOverlay: function( page ) {
		var self = this;

		if( !page ) {
			return;
		}

		var $overlay = this._$node.find( '.overlay' );

		if( $overlay.length === 0 ) {
			$overlay = $( '<div class="overlay">'
				+ '<div class="content"></div>'
				+ '<div class="icon-close">«</div>'
				+ '</div>' );

			$overlay.appendTo( this._$node ).hide();

			$overlay.find( '.icon-close' ).on( 'click', function() {
				self._hideOverlay();
			} );
		} else if( $overlay.find( '.page-' + page ).length === 1 ) {
			$overlay.stop().slideDown( 'fast' );
			return;
		}

		$overlay.slideUp( 'fast' );

		$.get( templateRegistry.getDir( 'content' ) + page + '.html' )
		.done( function( html ) {
			var $content = $( '<div class="page page-' + page + '" />' ).html( html );

			var $supportedLicences = $content.find( '.app-supportedLicences' );
			if( $supportedLicences.length ) {
				$supportedLicences.append( self._createSupportedLicencesHtml() );
			}

			$overlay.promise().done( function() {
				$overlay.find( '.content' ).empty().append( $content );
				$overlay.slideDown( 'fast' );
			} );
		} )
		.fail( function() {
			console.error( 'Unable to retrieve page ' + page );
		} );
	},

	/**
	 * Hides the global overlay.
	 */
	_hideOverlay: function() {
		var $overlay = this._$node.find( '.overlay' );

		if( $overlay.length === 0 ) {
			return;
		}

		$overlay.stop().slideUp( 'fast' );
	},

	/**
	 * Generates a jQuery wrapped list of nodes of all supported licences (licences registered in
	 * the licence store).
	 *
	 * @return {jQuery}
	 */
	_createSupportedLicencesHtml: function() {
		var $licences = $(),
			licences = this._api.getLicenceStore().getLicences();

		for( var i = 0; i < licences.length; i++ ) {

			if( i > 0 ) {
				$licences = $licences.add( document.createTextNode( ', ' ) );
			}

			var licence = licences[i],
				url = licence.getUrl();

			$licences = $licences.add( url
				? $( '<a/>' ).attr( 'href', url ).text( licence.getName() )
				: document.createTextNode( licence.getName() )
			);
		}

		return $licences;
	}

} );

return Navigation;

} );

}( define ) );
