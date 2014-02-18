( function( define ) {
'use strict';

define( ['jquery' ], function( $ ) {

/**
 * Option
 * @constructor
 * @abstract
 *
 * @event update
 *        Triggered whenever the option's value is changed.
 *        (1) {jQuery.Event}
 *
 * @param {string} id
 * @param {Asset} asset
 */
var Option = function( asset ) {
	this._asset = asset;
};

$.extend( Option.prototype, {
	/**
	 * @type {Asset}
	 */
	_asset: null,

	/**
	 * @type {AttributionGenerator|null}
	 */
	_attributionGenerator: null,

	/**
	 * @type {jQuery|null}
	 */
	_$underlay: null,

	/**
	 * Renders the option's input element.
	 *
	 * @return {jQuery}
	 */
	render: function() {
		throw new Error( 'Abstract function "render" is not implemented' );
	},

	/**
	 * Sets/Gets the option's current value.
	 *
	 * @param {*} [value]
	 * @return {*}
	 */
	value: function( value ) {
		throw new Error( 'Abstract function "value" is not implemented' )
	},

	/**
	 * Triggers update event.
	 *
	 * @triggers update
	 */
	_triggerUpdate: function() {
		$( this ).trigger( 'update' );
	},

	/**
	 * @param {AttributionGenerator} attributionGenerator
	 */
	setAttributionGenerator: function( attributionGenerator ) {
		if( attributionGenerator === this._attributionGenerator ) {
			return;
		}

		this._attributionGenerator = attributionGenerator;
		this._triggerUpdate();
	},

	/**
	 * Toggles the underlay's visibility.
	 *
	 * @param {jQuery} $target
	 */
	toggleUnderlay: function( $target ) {
		if( !this._$underlay ) {
			return;
		}

		var $button = $target.closest( '.button' );

		if( this._$underlay.is( ':visible' ) ){
			this._$underlay.hide();
			$button.removeClass( 'active' );
		} else {
			this._$underlay.css( 'top', '0' );
			this._$underlay.css( 'left', '0' );

			this._$underlay.offset( {
				top: $button.offset().top - this._$underlay.outerHeight(),
				left: $button.offset().left + $button.width() / 2 - this._$underlay.outerWidth() / 2
			} );

			this._$underlay.show();
			$button.addClass( 'active' );
		}
	},

	/**
	 * Shows an underlay.
	 *
	 * @param {jQuery} $content
	 */
	_createUnderlay: function( $content ) {
		if( !this._$underlay ) {
			this._$underlay = $( '<div/>' ).addClass( 'option-underlay' ).appendTo( 'body' );
		}

		this._$underlay.empty().append( $content );
	}

} );

return Option;

} );

}( define ) );
