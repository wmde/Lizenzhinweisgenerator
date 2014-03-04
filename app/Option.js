/**
 * @licence GNU GPL v3
 * @author snater.com < wikimedia@snater.com >
 */
define( ['jquery'], function( $ ) {
'use strict';

/**
 * Option
 * @constructor
 * @abstract
 *
 * @event update
 *        Triggered whenever the option's value is changed.
 *        (1) {jQuery.Event}
 *
 * @event error
 *        Triggered when the option is in an erroneous state indicating that the option's rendering
 *        should be removed.
 *        (1) {jQuery.Event}
 *        (2) {ApplicationError}
 *
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
		throw new Error( 'Abstract function "value" is not implemented' );
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
	 */
	toggleUnderlay: function() {
		if( !this._$underlay ) {
			return;
		}

		if( this._$underlay.is( ':visible' ) ){
			this._$underlay.hide();
		} else {
			this._$underlay.show();
		}

		$( this ).trigger( 'toggleunderlay', [this._$underlay] );
	},

	/**
	 * Shows an underlay.
	 *
	 * @param {jQuery} $content
	 * @param {jQuery} $anchor
	 */
	_createUnderlay: function( $content, $anchor ) {
		var self = this;

		this._$underlay = $( '<div/>' )
			.addClass( 'option-underlay' )
			.data( 'anchor', $anchor )
			.append( $content )
			.appendTo( 'body' );

		$( window ).on( 'resize', function() {
			if( self._$underlay && self._$underlay.is( ':visible' ) ) {
				$( self ).trigger( 'updateunderlay', [self._$underlay] );
			}
		} );
	},

	_destroyUnderlay: function() {
		if( this._$underlay ) {
			this._$underlay.remove();
			this._$underlay = null;
		}
	}

} );

return Option;

} );
