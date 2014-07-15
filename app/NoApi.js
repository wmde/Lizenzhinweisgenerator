/**
 * @licence GNU GPL v3
 * @author Kai Nissen < kai.nissen@wikimedia.de >
 */
define( ['jquery', 'app/ApplicationError', 'app/Asset', 'app/ImageInfo'],
function( $, ApplicationError, Asset, ImageInfo ) {
'use strict';

/**
 * Handler for simple file names.
 * @constructor
 */
var NoApi = function() {};

$.extend( NoApi.prototype, {
	/**
	 * Generates an Asset object for a specific filename.
	 *
	 * @param {string} filename
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {Asset}
	 *         Rejected parameters:
	 *         - {ApplicationError}
	 */
	getAsset: function( filename ) {
		var self = this,
			deferred = $.Deferred();

		this.getImageInfo( filename )
		.done( function() {
			var asset = new Asset( filename, 'mediatype', null, null, null, null, null, self );
			deferred.resolve( asset );
		} )
		.fail( function( error ) {
			deferred.reject( error );
		} );

		return deferred.promise();
	},

	/**
	 * Retrieves image information for a specific file.
	 *
	 * @param {string} filename
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {ImageInfo}
	 *         Rejected parameters:
	 *         - {ApplicationError}
	 */
	getImageInfo: function( filename ) {
		var deferred = $.Deferred();

		var $img = $( '<img/>' )
			.css( 'display', 'none' )
			.attr( 'src', filename )
			.error( function() {
				deferred.reject( new ApplicationError( 'url-invalid' ) );
				$img.remove();
			} )
			.load( function() {
				$( 'body' ).append( $img );

				deferred.resolve( new ImageInfo( filename, filename, {
					url: filename,
					width: $img.width(),
					height: $img.height()
				} ) );

				$img.remove();
			} );

		return deferred.promise();
	},

	/**
	 * @return {string}
	 */
	getDefaultUrl: function() {
		return '';
	}

} );

return NoApi;

} );
