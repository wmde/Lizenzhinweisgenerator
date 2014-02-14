( function( define ) {
'use strict';

define( ['jquery' ], function( $ ) {

// Order of option inputs (all possible options should be listed by option key):
var ORDER = ['imageSize', 'originalFileLink', 'rawText', 'htmlCode'];

// These options will be rendered always:
var defaultOptions = {
	'imageSize': true,
	'originalFileLink': true,
	'rawText': true
};

/**
 * Visual container for input elements that act as options.
 * @constructor
 *
 * @event update
 *        Triggered whenever an option's value is changed.
 *        (1) {jQuery.Event}
 *
 * @param {jQuery} $node
 * @param {Asset} asset
 */
var OptionsContainer = function( $node, asset ) {
	this._$node = $node;
	this._asset = asset;
};

$.extend( OptionsContainer.prototype, {
	/**
	 * @type {jQuery}
	 */
	_$node: null,

	/**
	 * @type {Asset}
	 */
	_asset: null,

	/**
	 * Renders the bar according to the submitted option keys.
	 *
	 * @param {Object} keys
	 * @return {jQuery}
	 */
	render: function( keys ) {
		keys = $.extend( defaultOptions, keys || {} );

		this._$node.empty();

		for( var i = 0; i < ORDER.length; i++ ) {
			if( keys[ORDER[i]] ) {
				this._$node.append( this._renderInput( ORDER[i] ) );
			}
		}
	},

	/**
	 * Gets an option's value.
	 *
	 * @param {string} key
	 * @return {*}
	 */
	getOption: function( key ) {
		return this._$node.find( '.app-optionscontainer-option-' + key )
			.find( 'input, select' ).val();
	},

	/**
	 * Renders a specific option's input element.
	 *
	 * @param {string} key
	 * @return {jQuery}
	 */
	_renderInput: function( key ) {
		var $node = $();

		if( key === 'originalFileLink' ) {
			$node = this._renderFullResolutionLink();
		} else if( key === 'imageSize' ) {
			$node = this._renderImageSize( key );
		}

		return $node.addClass( 'app-optionscontainer-option-' + key );
	},

	/**
	 * @return {*}
	 */
	_renderFullResolutionLink: function() {
		var $node = $( '<a/>' );

		this._asset.getImageInfo( this.getOption( 'imageSize' ) )
		.done( function( imageInfo ) {
			$node.attr( 'href', imageInfo.url ).text( 'Originaldatei aufrufen' );
		} )
		.fail( function() {
			$node.replaceWith( $() );
		} );

		return $node;
	},

	/**
	 * @param {string} key
	 * @return {jQuery}
	 */
	_renderImageSize: function( key ) {
		var self = this,
			$container = $( '<span/>' ),
			$label = $( '<label/>' ).attr( 'for', 'app-' + key ).text( 'Bildgröße: ' ),
			$select = $( '<select/>' ).attr( 'id', 'app-' + key ),
			values = [200, 300, 400, 500, 1000],
			selected = 500;

		for( var i = 0; i < values.length; i++ ) {
			var $option = $( '<option/>' ).attr( 'value', values[i] ).text( values[i] );
			if( values[i] === selected ) {
				$option.prop( 'selected', true );
			}
			$select.append( $option );
		}

		$select.on( 'change', function() {
			$( self ).trigger( 'update' );
		} );

		$container
		.append( $label )
		.append( $select );

		return $container;
	}

} );

return OptionsContainer;

} );

}( define ) );
