( function( define ) {
'use strict';

define( ['jquery', 'Option' ], function( $, Option ) {

function HtmlCode() {
	Option.apply( this, arguments );
}

$.extend( HtmlCode.prototype, Option.prototype, {
	constructor: HtmlCode,

	/**
	 * @see Option.render
	 */
	render: function() {
		var self = this;

		if( !this._attributionGenerator ) {
			return $();
		}

		this._destroyUnderlay();

		var $a = $( '<a/>' ).addClass( 'button' ).text( 'HTML-Quelltext' );

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
	 * Creates the option's underlay content.
	 *
	 * @return {jQuery}
	 */
	_createUnderlayContent: function() {
		var self = this;

		var $textArea = $( '<textarea rows="6" cols="40"/>' )
			.prop( 'readonly', true )
			.val( self._attributionGenerator.generate( 'inline' ).html() );

		var $useInlineStyles = $( '<input/>' )
			.attr( 'id', 'option-htmlCode-styles' )
			.attr( 'type', 'checkbox' )
			.prop( 'checked', true );

		$useInlineStyles.on( 'click', function() {
			$textArea.val( self._attributionGenerator.generate(
				$useInlineStyles.prop( 'checked' ) ? 'inline' : undefined
			).html() );
		} );

		return $textArea
			.add( $useInlineStyles )
			.add(
				$( '<label/>' )
				.attr( 'for', 'option-htmlCode-styles' )
				.text( 'Inline-Styles verwenden' )
			);
	},

	/**
	 * @see Option.value
	 */
	value: function( value ) {
		return undefined;
	}

} );

return HtmlCode;

} );

}( define ) );
