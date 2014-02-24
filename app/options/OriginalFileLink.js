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

		this._$a
		.on( 'mousedown', function() {
			self._$a.addClass( 'active' );
		} )
		.on( 'mouseup', function() {
			self._$a.removeClass( 'active' );
		} );

		this._asset.getImageInfo( '500' )
		.done( function( imageInfo ) {
			if( self._$a.get( 0 ).download !== undefined ) {
				self._$a.attr( 'href', imageInfo.url ).text( 'Originaldatei herunterladen' );
				self._$a.attr( 'download', self._asset.getFilename() );
			} else {
				self._$a.attr( 'href', imageInfo.url ).text( 'Originaldatei aufrufen' );
				self._$a.on( 'click', function( event ) {
					event.preventDefault();
					window.open( imageInfo.url, '_blank' );
				} );
			}
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
