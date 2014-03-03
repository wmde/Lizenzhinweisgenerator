/**
 * @licence GNU GPL v3
 * @author snater.com < wikimedia@snater.com >
 */
define( ['jquery', 'app/Option', 'dojo/i18n!./nls/OriginalFileLink'],
	function( $, Option, messages ) {
'use strict';

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
	 *
	 * @triggers error
	 */
	render: function() {
		var self = this;

		this._$a = $( '<a/>' ).addClass( 'option button' );

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
				self._$a.attr( 'href', imageInfo.getUrl() )
					.text( messages['download original file'] );
				self._$a.attr( 'download', self._asset.getFilename() );
			} else {
				self._$a.attr( 'href', imageInfo.getUrl() )
					.text( messages['retrieve original file'] );
				self._$a.on( 'click', function( event ) {
					event.preventDefault();
					window.open( imageInfo.getUrl(), '_blank' );
				} );
			}
		} )
		.fail( function( error ) {
			$( self ).trigger( 'error', [error] );
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
