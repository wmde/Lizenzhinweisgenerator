/**
 * @licence GNU GPL v3
 * @author snater.com < wikimedia@snater.com >
 */
define( ['jquery', 'app/Option', 'dojo/i18n!./nls/HtmlCode'], function( $, Option, messages ) {
'use strict';

function HtmlCode() {
	Option.apply( this, arguments );
}

$.extend( HtmlCode.prototype, Option.prototype, {
	constructor: HtmlCode,

	/**
	 * @type {jQuery}
	 */
	_$imageHtml: null,

	/**
	 * @see Option.render
	 */
	render: function() {
		var self = this;

		if( !this._attributionGenerator ) {
			return $();
		}

		this._destroyUnderlay();

		var $a = $( '<a/>' ).addClass( 'option button' ).text( messages['html code'] );

		$a
		.on( 'mousedown', function() {
			$a.addClass( 'active' );
		} )
		.on( 'click', function( event ) {
			if( !self._$underlay ) {
				self._createUnderlay( self._createUnderlayContent(), $( event.target ) );
			}

			self.toggleUnderlay();

			if( !self._$underlay.is( ':visible' ) ) {
				$a.removeClass( 'active' );
			}
		} );

		return $a;
	},

	/**
	 * Returns the HTML code output or "null" if if cannot be generated.
	 *
	 * @param {boolean} useInlineStyles
	 * @return {string}
	 */
	_generateHtmlCode: function( useInlineStyles ) {
		if( !this._$imageHtml || !this._attributionGenerator ) {
			return null;
		}

		var $html = this._$imageHtml.clone(),
			$attribution = this._attributionGenerator.generate();

		$html.children().first().append( $attribution );

		if( useInlineStyles ) {
			$html = this._convertToInlineStyles( $html );
		}

		return $( '<div/>' ).append( $html ).html();
	},

	/**
	 * Updates the outputted HTML code.
	 */
	_updateHtmlCode: function() {
		if( !this._$underlay ) {
			return;
		}
		this._$underlay.find( 'textarea' ).val( this._generateHtmlCode(
			this._$underlay.find( '#option-htmlCode-styles' ).prop( 'checked' )
		) );
	},

	/**
	 * Creates the option's underlay content.
	 *
	 * @return {jQuery}
	 */
	_createUnderlayContent: function() {
		var self = this;

		var $textArea = $( '<textarea rows="6" cols="40"/>' )
			.prop( 'readonly', true )
			.val( self._generateHtmlCode( true ) );

		var $useInlineStyles = $( '<input/>' )
			.attr( 'id', 'option-htmlCode-styles' )
			.attr( 'type', 'checkbox' )
			.prop( 'checked', true );

		$useInlineStyles.on( 'click', function() {
			self._updateHtmlCode();
		} );

		return $textArea
			.add( $useInlineStyles )
			.add(
				$( '<label/>' )
				.attr( 'for', 'option-htmlCode-styles' )
				.text( messages['use inline styles'] )
			);
	},

	/**
	 * @see Option.value
	 */
	value: function() {
		return undefined;
	},

	/**
	 * Sets the basic HTML container.
	 *
	 * @param {jQuery} $imageHtml
	 */
	setImageHtml: function( $imageHtml ) {
		this._$imageHtml = $imageHtml;
		this._updateHtmlCode();
	},

	/**
	 * Converts the styles applied via css classes to inline styles.
	 *
	 * @param {jQuery} $node
	 * @return {jQuery}
	 */
	_convertToInlineStyles: function( $node ) {
		var $container = $( '<div/>' ).append( $node );

		for( var i = 0; i < document.styleSheets.length; i++ ) {
			for( var j = 0; j < document.styleSheets[i].cssRules.length; j++ ) {
				var cssRule = document.styleSheets[i].cssRules[j];
				// Do not mess with global/generic css definitions:
				if( cssRule.selectorText.indexOf( '.attributed-image-frame' ) !== -1 ) {
					var node = $container.find( cssRule.selectorText ).get( 0 );
					node.style.cssText = node.style.cssText
						+ cssRule.cssText.replace( /^([^{]+)\{([^}]+)\}$/, '$2' );
				}
			}
		}

		$container.find( '*' ).each( function() {
			$( this ).removeAttr( 'class' );
		} );

		return $container.children().first();
	}

} );

return HtmlCode;

} );
