( function( define ) {
'use strict';

define( ['jquery', 'Option' ], function( $, Option ) {

function OriginalFileLink() {
	Option.apply( this, arguments );
}

$.extend( OriginalFileLink.prototype, Option.prototype, {
	constructor: OriginalFileLink,

	/**
	 * The link provided by the option.
	 */
	_$a: null,

	/**
	 * @see Option.render
	 */
	render: function() {
		var self = this;

		this._$a = $( '<a/>' ).addClass( 'button' );

		this._asset.getImageInfo( '500' )
		.done( function( imageInfo ) {
			self._$a.attr( 'href', imageInfo.url ).text( 'Originaldatei aufrufen' );
		} )
		.fail( function() {
			self._$a.replaceWith( $() );
		} );

		return self._$a;
	},

	/**
	 * @see Option.value
	 */
	value: function( value ) {
		if( value === undefined ) {
			return this._$a ? this._$a.attr( 'href' ) : null;
		}
		this._$a.attr( 'href', value );
	}

} );

return OriginalFileLink;

} );

}( define ) );
