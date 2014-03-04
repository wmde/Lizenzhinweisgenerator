/**
 * @licence GNU GPL v3
 * @author snater.com < wikimedia@snater.com >
 */
define( [
	'jquery',
	'app/options/OriginalFileLink',
	'app/options/HtmlCode',
	'app/options/ImageSize',
	'app/options/RawText'
], function( $, OriginalFileLink, HtmlCode, ImageSize, RawText ) {
'use strict';

/**
 * Visual container for input elements that act as options.
 * @constructor
 *
 * @event update
 *        Triggered whenever one option's value is changed.
 *        (1) {jQuery.Event}
 *
 * @param {jQuery} $node
 * @param {Asset} asset
 * @param {string[]} defaultOptions
 */
var OptionContainer = function( $node, asset, defaultOptions ) {
	this._$node = $node;
	this._defaultOptions = defaultOptions || [
		'imageSize',
		'originalFileLink'
	];
	this._currentOptions = this._defaultOptions;

	this._options = [
		{ id: 'imageSize', instance: new ImageSize( asset ) },
		{ id: 'originalFileLink', instance: new OriginalFileLink( asset ) },
		{ id: 'rawText', instance: new RawText( asset ) },
		{ id: 'htmlCode', instance: new HtmlCode( asset ) }
	];

	for( var i = 0; i < this._options.length; i++ ) {
		this._attachEventHandlers( this._options[i].instance );
	}
};

$.extend( OptionContainer.prototype, {
	/**
	 * Node of the OptionContainer, node the Options are appended to.
	 * @type {jQuery}
	 */
	_$node: null,

	/**
	 * List of ids of options that should be rendered by default.
	 * @type {string[]}
	 */
	_defaultOptions: null,

	/**
	 * Definition of the options that should be rendered.
	 * @type {Object[]}
	 */
	_options: null,

	/**
	 * Options that shall be rendered currently. (It may not be possible to always render all
	 * options.)
	 * @type {string[]}
	 */
	_currentOptions: null,

	/**
	 * Attaches default event handlers to an Option instance.
	 *
	 * @param {Option} optionInstance
	 */
	_attachEventHandlers: function( optionInstance ) {
		var self = this;

		$( optionInstance )
		.on( 'update', function() {
			$( self ).trigger( 'update' );
		} )
		.on( 'toggleunderlay updateunderlay', function( event, $underlay ) {
			var $button = $underlay.data( 'anchor' ).closest( '.button' ),
				$container = $button.closest( '.optioncontainer-option' ),
				padding = $underlay.outerWidth() - $underlay.width(),
				isVisible = $underlay.is( ':visible' );

			$button[ isVisible ? 'addClass' : 'removeClass' ]( 'active' );

			$underlay.width( $container.width() - 10 - padding );

			$underlay.css( 'width', 'auto' );
			$underlay.css( 'top', '0' );
			$underlay.css( 'left', '0' );

			var containerOffset = $container.offset();

			$underlay.offset( {
				top: isVisible
					? containerOffset.top
					: containerOffset.top - $underlay.outerHeight(),
				left: containerOffset.left + $container.width() / 2 - $underlay.outerWidth() / 2
			} );

			$underlay.stop().show().animate( {
				top: isVisible
					? containerOffset.top - $underlay.outerHeight()
					: containerOffset.top
			}, 'fast' ).promise().done( function() {
				if( !isVisible ) {
					$underlay.hide();
				}
			} );
		} )
		.on( 'error', function() {
			var id;

			for( var i = 0; i < self._options.length; i++ ) {
				if( self._options[i].instance === this ) {
					id = self._options[i].id;
				}
			}

			var index = $.inArray( id, self._currentOptions );

			if( index !== -1 ) {
				self._currentOptions.splice( index, 1 );
			}

			self._reRender();
		} );
	},

	/**
	 * Renders the bar according to the submitted option ids. If no option ids are given, the
	 * default options will be rendered.
	 *
	 * @param {string[]} [ids]
	 * @param {Object} [initialValues]
	 */
	render: function( ids, initialValues ) {
		this._currentOptions = ids || this._defaultOptions;

		this._$node.empty();

		for( var i = 0; i < this._options.length; i++ ) {
			var id = this._options[i].id;

			if( $.inArray( id, this._currentOptions ) !== -1 ) {
				this._$node.addClass( 'optioncontainer' )
				.append(
					$( '<div/>' )
					.addClass( 'optioncontainer-option' )
					.addClass( 'optioncontainer-option-' + id )
					.append( this._options[i].instance.render() )
				);
				if( initialValues && initialValues[id] ) {
					this._options[i].instance.value( initialValues[id] );
				}
			}
		}
	},

	/**
	 * Re-renders all options that are supposed to be displayed.
	 */
	_reRender: function() {
		var values = {},
			i;

		for( i = 0; i < this._options.length; i++ ) {
			values[this._options[i].id] = this._options[i].instance.value();
		}

		this.render( this._currentOptions );

		for( i = 0; i < this._options.length; i++ ) {
			this._options[i].instance.value( values[this._options[i].id] );
		}
	},

	/**
	 * Returns the default options' id.
	 */
	push: function( optionId ) {
		if( $.inArray( optionId, this._currentOptions ) === -1 ) {
			this._currentOptions.push( optionId );
		}
		this._reRender();
	},

	/**
	 * Returns a specific option.
	 *
	 * @param {string|null} id
	 * @return {Option}
	 */
	getOption: function( id ) {
		for( var i = 0; i < this._options.length; i++ ) {
			if( id === this._options[i]['id'] ) {
				return this._options[i]['instance'];
			}
		}
		return null;
	},

	/**
	 * @param {AttributionGenerator} attributionGenerator
	 */
	setAttributionGenerator: function( attributionGenerator ) {
		for( var i = 0; i < this._options.length; i++ ) {
			this._options[i].instance.setAttributionGenerator( attributionGenerator );
		}
		this._reRender();
	}

} );

return OptionContainer;

} );
