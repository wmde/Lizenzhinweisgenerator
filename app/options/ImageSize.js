( function( define ) {
'use strict';

define( ['jquery', 'Option' ], function( $, Option ) {

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
			$container = $( '<span/>' ).addClass( 'button' ),
			$label = $( '<label/>' )
				.attr( 'for', 'option-imageSize-input' )
				.text( 'Maximale Bildbreite/-höhe: ' ),
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
		if( value === undefined ) {
			return this._$select ? this._$select.val() : null;
		}
		this._$select.val( value );
	}


} );

return ImageSize;

} );

}( define ) );
