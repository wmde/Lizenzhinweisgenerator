/**
 * @licence GNU GPL v3
 * @author snater.com < wikimedia@snater.com >
 */
define( ['jquery', 'app/Option', 'dojo/i18n!./nls/ImageSize'], function( $, Option, messages ) {
'use strict';

function ImageSize() {
	Option.apply( this, arguments );
}

$.extend( ImageSize.prototype, Option.prototype, {
	constructor: ImageSize,

	/**
	 * This option's input element.
	 * @type {jQuery}
	 */
	_$select: null,

	/**
	 * @see Option.render
	 */
	render: function() {
		var self = this,
			$container = $( '<span/>' ).addClass( 'option button' ),
			$label = $( '<label/>' )
				.attr( 'for', 'option-imageSize-input' )
				.text( messages['maximum image width/height:'] + ' ' ),
			values = [200, 300, 400, 500, 1000],
			selected = 500;

		this._$select = $( '<select/>' ).attr( 'id', 'option-imageSize-input' );

		for( var i = 0; i < values.length; i++ ) {
			var $option = $( '<option/>' ).attr( 'value', values[i] ).text( values[i] + ' Pixel' );
			if( values[i] === selected ) {
				$option.prop( 'selected', true );
			}
			this._$select.append( $option );
		}

		this._$select
		.on( 'change', function() {
			$( self ).trigger( 'update' );
		} );

		$container
		.append( $label )
		.append( this._$select );

		return $container;
	},

	/**
	 * @see Option.value
	 */
	value: function( value ) {
		var self = this;

		if( value === undefined ) {
			return this._$select ? this._$select.val() : null;
		} else if( !value ) {
			return;
		}

		this._$select.children( 'option' ).each( function() {
			if( $( this ).attr( 'value' ) === value.toString() ) {
				self._$select.val( value.toString() );
				return false;
			}
		} );
	}


} );

return ImageSize;

} );
