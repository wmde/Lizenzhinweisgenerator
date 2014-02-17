( function( define ) {
'use strict';

define( ['jquery', 'Option' ], function( $, Option ) {

function RawText() {
	Option.apply( this, arguments );
}

$.extend( RawText.prototype, Option.prototype, {
	constructor: RawText,

	/**
	 * This option's input element.
	 * @type {jQuery}
	 */
	_$select: null,

	/**
	 * @see Option.render
	 */
	render: function() {
		var self = this;

		if( !this._attributionGenerator ) {
			return $();
		}

		var $a = $( '<a/>' ).addClass( 'button' ).text( 'Lizenzverweis ohne Formatierung' );

		$a.on( 'click', function( event ) {
			var $target = $( event.target );

			if( !self._$underlay ) {
				var $underlayContent = $( '<textarea rows="6" cols="40"/>' )
					.prop( 'readonly', true )
					.val( self._attributionGenerator.generate( 'raw' ) );
				self._createUnderlay( $underlayContent, $target );
			}
			self.toggleUnderlay( $target );
		} );

		return $a;
	}

} );

return RawText;

} );

}( define ) );
