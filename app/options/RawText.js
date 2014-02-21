( function( define ) {
'use strict';

define( ['jquery', 'Option' ], function( $, Option ) {

function RawText() {
	Option.apply( this, arguments );
}

$.extend( RawText.prototype, Option.prototype, {
	constructor: RawText,

	/**
	 * @see Option.render
	 */
	render: function() {
		var self = this;

		if( !this._attributionGenerator ) {
			return $();
		}

		this._destroyUnderlay();

		var $a = $( '<a/>' ).addClass( 'button' ).text( 'Lizenzverweis ohne Formatierung' );

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

		return $( '<textarea rows="6" cols="40"/>' )
			.prop( 'readonly', true )
			.val( self._attributionGenerator.generate( 'raw' ) );
	},

	/**
	 * @see Option.value
	 */
	value: function( value ) {
		return undefined;
	}

} );

return RawText;

} );

}( define ) );
