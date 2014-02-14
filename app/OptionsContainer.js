( function( define ) {
'use strict';

define( ['jquery' ], function( $ ) {

// Order of option inputs (all possible options should be listed by option key):
var ORDER = ['imageSize', 'originalFileLink', 'rawText', 'htmlCode'];

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
	 * @type {AttributionGenerator|null}
	 */
	_attributionGenerator: null,

	/**
	 * Options that shall be rendered currently. (It may not be possible to always render all
	 * options.)
	 */
	_keys: null,

	/**
	 * Renders the bar according to the submitted option keys.
	 *
	 * @param {Object} [keys]
	 * @return {jQuery}
	 */
	render: function( keys ) {
		this._keys = keys = $.extend( {
			'imageSize': true,
			'originalFileLink': true,
			'rawText': true
		}, keys || {} );

		this._$node.empty();

		for( var i = 0; i < ORDER.length; i++ ) {
			if( keys[ORDER[i]] ) {
				this._$node.append( this._renderInput( ORDER[i] ) );
			}
		}
	},

	update: function() {
		this.render( this._keys );
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
	 * @param {AttributionGenerator} attributionGenerator
	 */
	setAttributionGenerator: function( attributionGenerator ) {
		this._attributionGenerator = attributionGenerator;
		this.update();
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
		} else if( key === 'rawText' ) {
			$node = this._renderRawText();
		} else if( key === 'htmlCode' ) {
			$node = this._renderHtmlCode();
		}

		return $node.addClass( 'app-optionscontainer-option-' + key );
	},

	/**
	 * @return {jQuery}
	 */
	_renderHtmlCode: function() {
		var self = this;

		if( !this._attributionGenerator ) {
			return $();
		}

		var $a = $( '<a/>' ).text( 'HTML-Quelltext' );

		$a.on( 'click', function( event ) {
			var $underlayContent = $( '<textarea/>' ).val(
				self._attributionGenerator.generate( 'inline' )
			);

			self._showUnderlay( $underlayContent, $( event.target ) );
		} );

		return $a;
	},

	/**
	 * @return {jQuery}
	 */
	_renderRawText: function() {
		var self = this;

		if( !this._attributionGenerator ) {
			return $();
		}

		var $a = $( '<a/>' ).text( 'Lizenzverweis ohne Formatierung' );

		$a.on( 'click', function( event ) {
			var $underlayContent = $( '<textarea/>' ).val(
				self._attributionGenerator.generate( 'raw' )
			);

			self._showUnderlay( $underlayContent, $( event.target ) );
		} );

		return $a;
	},

	/**
	 * Shows an underlay.
	 *
	 * @param {jQuery} $content
	 * @param {jQuery} $anchor Node the underlay shall be positioned to.
	 */
	_showUnderlay: function( $content, $anchor ) {
		var $underlay = $( '.optionscontainer-underlay' );

		if( $underlay.length === 0 ) {
			$underlay = $( '<div/>' ).addClass( 'optionscontainer-underlay' );
			$underlay.appendTo( this._$node );
		}

		$underlay.empty()
		.append( $content )
		.append(
			$('<a/>' ).text( 'schließen' )
				.on( 'click', function( event ) {
					$underlay.remove();
				} )
		);
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
			$label = $( '<label/>' )
				.attr( 'for', 'optionscontainer-option-imagesize-input' )
				.text( 'Bildgröße: ' ),
			$select = $( '<select/>' ).attr( 'id', 'optionscontainer-option-imagesize-input' ),
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
