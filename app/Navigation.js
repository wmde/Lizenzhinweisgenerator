/**
 * @licence GNU GPL v3
 * @author snater.com < wikimedia@snater.com >
 */
define( [
	'jquery',
	'dojo/i18n!./nls/Navigation',
	'templates/registry',
	'app/AjaxError',
	'dojo/_base/config'
], function( $, messages, templateRegistry, AjaxError, config ) {
'use strict';

/**
 * Main navigation renderer creating and managing the main menu and its referred content.
 * @constructor
 *
 * @param {jQuery} $node
 *
 * @throws {Error} if a required parameter is not defined.
 */
var Navigation = function( $node ) {
	if( !$node ) {
		throw new Error( 'Required parameter(s) not defined' );
	}
	this._$node = $node;
};

$.extend( Navigation.prototype, {
	/**
	 * @type {jQuery}
	 */
	_$node: null,

	/**
	 * Renders the global navigation bar.
	 *
	 * @param {boolean} showStartButton
	 *        Default: true
	 */
	create: function( showStartButton ) {
		var self = this;

		var $navigation = $( '<ul class="navigation">'
			+ '<li class="button navigation-button-home">' + messages['Start'] + '</li>'
			+ '<li class="button navigation-button-about">' + messages['About'] + '</li>'
			+ '<li class="button navigation-button-feedback">' + messages['Feedback'] + '</li>'
			+ '</ul>' );

		$navigation.children( '.navigation-button-home' )
		.on( 'click', function() {
			location.reload();
		} );

		if( !showStartButton && showStartButton !== undefined ) {
			$navigation.children( '.navigation-button-home' ).hide();
		}

		$navigation.children( '.navigation-button-about' )
		.on( 'click', function() {
			self._showOverlay( 'about' );
		} );

		$navigation.children( '.navigation-button-feedback' )
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

		var $overlay = this._$node.find( '.navigation-overlay' );

		if( $overlay.length === 0 ) {
			$overlay = $( '<div class="navigation-overlay">'
				+ '<div class="navigation-overlay-content"></div>'
				+ '<div class="navigation-overlay-icon-close button">«</div>'
				+ '</div>' );

			$overlay.appendTo( this._$node ).hide();

			$overlay.find( '.navigation-overlay-icon-close' ).on( 'click', function() {
				self._hideOverlay();
			} );
		} else if( $overlay.find( '.page-' + page ).length === 1 ) {
			$overlay.stop().slideDown( 'fast' );
			return;
		}

		$overlay.slideUp( 'fast' );

		var ajaxOptions = {
			url: templateRegistry.getDir( 'content' ) + page + '.html',
			dataType: 'html'
		};

		$.ajax( ajaxOptions )
		.done( function( html ) {
			var $content = $( '<div class="page page-' + page + '" />' ).html( html );

			var $supportedLicences = $content.find( '.app-supportedLicences' );
			if( $supportedLicences.length ) {
				$supportedLicences.append( self._createSupportedLicencesHtml() );
			}

			$overlay.promise().done( function() {
				$overlay.find( '.navigation-overlay-content' ).empty().append( $content );
				$overlay.slideDown( 'fast' );
			} );
		} )
		.fail( function() {
			var error = new AjaxError( 'contentpage-missing', ajaxOptions );

			$overlay.promise().done( function() {
				$overlay.find( '.navigation-overlay-content' ).empty().append(
					$( '<div/>' )
					.addClass( 'navigation-overlay-error error' )
					.text( error.getMessage() )
				);
				$overlay.slideDown( 'fast' );
			} );
		} );
	},

	/**
	 * Hides the global overlay.
	 */
	_hideOverlay: function() {
		var $overlay = this._$node.find( '.navigation-overlay' );

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
			licences = config.custom.licenceStore.getLicences();

		for( var i = 0; i < licences.getLicences().length; i++ ) {

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
