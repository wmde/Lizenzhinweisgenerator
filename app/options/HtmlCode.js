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

		var $a = $( '<a/>' ).addClass( 'button' ).text( 'HTML-Quelltext' );

		$a.on( 'click', function( event ) {
			var $textArea = $( '<textarea/>' ).val(
				self._attributionGenerator.generate( 'inline' ).html()
			);

			var $useInlineStyles = $( '<input/>' )
				.attr( 'id', 'option-htmlCode-styles' )
				.attr( 'type', 'checkbox' )
				.prop( 'checked', true );

			$useInlineStyles.on( 'click', function() {
				$textArea.val( self._attributionGenerator.generate(
					$useInlineStyles.prop( 'checked' ) ? 'inline' : undefined
				).html() );
			} );

			var $underlayContent = $textArea
				.add( $useInlineStyles )
				.add(
					$( '<label/>' )
					.attr( 'for', 'option-htmlCode-styles' )
					.text( 'Inline-Styles verwenden' )
				);

			self._showUnderlay( $underlayContent, $( event.target ) );
		} );

		return $a;
	}

} );

return HtmlCode;

} );

}( define ) );
