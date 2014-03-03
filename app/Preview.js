/**
 * @licence GNU GPL v3
 * @author snater.com < wikimedia@snater.com >
 */
define( ['jquery'], function( $ ) {
'use strict';

/**
 * Preview renderer
 * @constructor
 *
 * @param {jQuery} $node
 * @param {Asset} asset
 *
 * @throws {Error} if a required parameter is not defined.
 */
var Preview = function( $node, asset ) {
	if( !$node || !asset ) {
		throw new Error( 'Required parameters are nor properly defined' );
	}

	this._$node = $node;
	this._asset = asset;
};

$.extend( Preview.prototype, {
	/**
	 * @type {jQuery}
	 */
	_$node: null,

	/**
	 * @type {Asset}
	 */
	_asset: null,

	/**
	 * Updates the preview.
	 *
	 * @param {AttributionGenerator} attributionGenerator
	 * @param {Object} supplementPromise
	 * @param {number} imageSize
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {jQuery} Attributed image DOM
	 *         Rejected parameters:
	 *         - {AjaxError}
	 */
	update: function( attributionGenerator, supplementPromise, imageSize ) {
		var self = this,
			deferred = new $.Deferred();

		this._asset.getImageInfo( imageSize )
		.done( function( imageInfo ) {
			var $attributedImageFrame = self._attributedImageHtml( imageInfo ),
				$preview = self._create( $attributedImageFrame );

			self._$node.replaceWith( $preview );
			self._$node = $preview;

			self._$node.find( '.attributed-image-frame' ).append( attributionGenerator.generate() );

			self._$node.find( 'img' ).on( 'load', function() {
				self._$node.find( '.preview-spacer' ).css(
					'marginBottom',
					-1 * parseInt( self._$node.find( '.attributed-image-frame' ).height() / 2, 10 )
				);
			} );

			supplementPromise.done( function( $content ) {
				var $supplement = self._$node.find( '.preview-supplement' );

				if( $supplement.length === 0 ) {
					$supplement = $( '<div/>' ).addClass( 'preview-supplement' )
						.appendTo( self._$node );
				}

				$supplement.empty().append( $content );
			} );

			deferred.resolve( $attributedImageFrame );
		} )
		.fail( function( error ) {
			self._$node.empty().append(
				$( '<div/>' )
				.addClass( 'preview-error error' )
				.text( error.getMessage() )
			);
		} );

		return deferred.promise();
	},

	/**
	 * Returns the DOM of the attributed image without the attribution.
	 *
	 * @param {ImageInfo} imageInfo
	 * @return {jQuery}
	 */
	_attributedImageHtml: function( imageInfo ) {
		var html = ''
			+ '<div class="attributed-image-frame"><div class="attributed-image">'
			+ '<a href="' + imageInfo.getDescriptionUrl() + '">'
			+ '<img border="0" src="' + imageInfo.getThumbnail().url + '"/>'
			+ '</a>'
			+ '</div></div>';

		var $attributedImageFrame = $( html );
		$attributedImageFrame.width( imageInfo.getThumbnail().width );

		return $attributedImageFrame;
	},

	/**
	 * Renders the preview.
	 *
	 * @param {jQuery} $attributedImageHtml
	 * @return {jQuery}
	 */
	_create: function( $attributedImageHtml ) {
		return $( '<div/>' ).addClass( 'preview' )
			.append( $( '<div/>' ).addClass( 'preview-spacer' ) )
			.append( $attributedImageHtml );
	}

} );

return Preview;

} );
