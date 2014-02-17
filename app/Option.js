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
	 * Shows an underlay.
	 *
	 * @param {jQuery} $content
	 * @param {jQuery} $anchor Node the underlay shall be positioned to.
	 */
	_showUnderlay: function( $content, $anchor ) {
		var $underlay = $( '.option-underlay' );

		if( $underlay.length === 0 ) {
			$underlay = $( '<div/>' ).addClass( 'option-underlay' );
			$underlay.appendTo( 'body' );
		}

		$underlay.empty()
		.append( $content )
		.append(
			$('<a/>' )
			.text( 'schließen' )
			.on( 'click', function( event ) {
				$underlay.remove();
			} )
		);

		$underlay.css(
			'left',
			( $anchor.position().left + $anchor.width() / 2 - $underlay.width() / 2 ) + 'px'
		);
		$underlay.css( 'top', ( $anchor.position().top - $underlay.height() ) + 'px' );
	}

} );

return Option;

} );

}( define ) );
