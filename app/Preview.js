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

	this._$node = $node.addClass( 'preview' ).append( $( '<div/>' ).addClass( 'preview-spacer' ) );

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
	 * @type {number}
	 */
	_currentImageSize: null,

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
			var $attributedImageFrame = self._$node.find( '.attributed-image-frame' );

			if( imageSize === self._currentImageSize ) {
				$attributedImageFrame.children().not( '.attributed-image' ).remove();
			} else {
				self._$node.find( '.attributed-image-frame' ).remove();

				$attributedImageFrame = self._attributedImageHtml( imageInfo )
					.appendTo( self._$node );
			}

			$attributedImageFrame.append( attributionGenerator.generate() );

			supplementPromise.done( function( $content ) {
				var $supplement = self._$node.find( '.preview-supplement' );

				if( $supplement.length === 0 ) {
					$supplement = $( '<div/>' ).addClass( 'preview-supplement' )
						.appendTo( self._$node );
				}

				var currentSupplement = $supplement.html(),
					newSupplement = $( '<div/>' ).append( $content ).html();

				if( currentSupplement === newSupplement ) {
					return;
				}

				$supplement.empty().append( $content );
			} );

			self._currentImageSize = imageSize;

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

		var self = this,
			$attributedImageFrame = $( html );

		$attributedImageFrame.width( imageInfo.getThumbnail().width );

		$attributedImageFrame.find( 'img' ).on( 'load', function() {
			self._$node.find( '.preview-spacer' ).css(
				'marginBottom',
				-1 * parseInt( $attributedImageFrame.height() / 2, 10 )
			);
		} );

		return $attributedImageFrame;
	}

} );

return Preview;

} );
