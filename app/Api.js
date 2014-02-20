( function( define ) {
'use strict';

define( ['jquery', 'AssetPage'], function( $, AssetPage ) {

/**
 * Commons API Handler.
 * @constructor
 *
 * @param {string} url
 * @param {LicenceStore} licenceStore
 *
 * @throws {Error} if a required parameter is omitted.
 */
var Api = function( url, licenceStore ) {
	if( !url || !licenceStore ) {
		throw new Error( 'A required parameter has been omitted' );
	}
	this._url = url;
	this._licenceStore = licenceStore;
};

$.extend( Api.prototype, {
	/**
	 * API URL.
	 * @type {string}
	 */
	_url: null,

	/**
	 * @param {LicenceStore|null} filename
	 */
	_licenceStore: null,

	/**
	 * @return {LicenceStore|null}
	 */
	getLicenceStore: function() {
		return this._licenceStore;
	},

	/**
	 * Generates an Asset object for a specific filename.
	 *
	 * @param {string} filename
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {Asset}
	 *         Rejected parameters:
	 *         - {string} Error message
	 */
	getAsset: function( filename ) {
		var self = this,
			deferred = $.Deferred();

		this._getMediaType( filename )
		.done( function( mediaType ) {

			self.getPageContent( filename )
			.done( function( $dom ) {

				self.getCategories( filename )
				.done( function( categories ) {
					var assetPage = new AssetPage( filename, mediaType, $dom, categories, self );

					deferred.resolve( assetPage.getAsset() );
				} )
				.fail( function( message ) {
					deferred.reject( message );
				} );
			} )
			.fail( function( message ) {
				deferred.reject( message );
			} );

		} )
		.fail( function( message ) {
			deferred.reject( message );
		} );

		return deferred.promise();
	},

	/**
	 * Retrieves the asset page content of a specific file.
	 *
	 * @param {string} filename
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {jQuery} Page content DOM
	 *         Rejected parameters:
	 *         - {string} Error message
	 */
	getPageContent: function( filename ) {
		var self = this,
			deferred = $.Deferred();

		this._query( filename, 'revisions', {
			rvprop: 'content',
			rvparse: 1
		} )
		.done( function( page ) {
			var error = self._checkPageResponse( page );
			if( error ) {
				deferred.reject( error );
				return;
			}

			if( !page.revisions || page.revisions.length === 0 || !page.revisions[0]['*'] ) {
				deferred.reject( 'Unable to resolve revisions' );
				return;
			}

			deferred.resolve( $( '<div/>' ).html( page.revisions[0]['*'] ) );
		} )
		.fail( function( message, jqXHR ) {
			deferred.reject( message );
		} );

		return deferred.promise();
	},

	/**
	 * Retrieves the categories of a specific file.
	 *
	 * @param {string} filename
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {string[]} The file's categories.
	 *         Rejected parameters:
	 *         - {string} Error message
	 */
	getCategories: function( filename ) {
		var deferred = $.Deferred();

		this._query( filename, 'categories' )
		.done( function( page ) {
			if( !page.categories ) {
				deferred.reject( 'No categories found' );
				return;
			}

			var categories = [];
			$.each( page.categories, function( i, category ) {
				categories.push( category.title.replace( /^[^:]+:/ , '' ) );
			} );

			deferred.resolve( categories );
		} )
		.fail( function( message, jqXHR ) {
			deferred.reject( message );
		} );

		return deferred.promise();
	},

	/**
	 * Retrieves image information for a specific file according to a specific image size.
	 *
	 * @param {string} filename
	 * @param {number} size
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {Object} The file's image information.
	 *         Rejected parameters:
	 *         - {string} Error message
	 */
	getImageInfo: function( filename, size ) {
		var self = this,
			deferred = $.Deferred();

		this._query( filename, 'imageinfo', {
			iiprop: 'url',
			iiurlwidth: size,
			iiurlheight: size
		} )
		.done( function( page ) {
			var error = self._checkPageResponse( page );
			if( error ) {
				deferred.reject( error );
				return;
			}

			if( !page.imageinfo || page.imageinfo.length === 0 ) {
				deferred.reject( 'No image information returned' );
			}
			deferred.resolve( page.imageinfo[0] );
		} )
		.fail( function( message, jqXHR ) {
			deferred.reject( message );
		} );

		return deferred.promise();
	},

	/**
	 * Retrieves a file's media type.
	 *
	 * @param {string} filename
	 * @return {Object} jQuery Promise:
	 *         Resolved parameters:
	 *         - {string} The file's media type.
	 *         Rejected parameters:
	 *         - {string} Error message
	 */
	_getMediaType: function( filename ) {
		var self = this,
			deferred = $.Deferred();

		this._query( filename, 'imageinfo', {
			iiprop: 'mediatype'
		} )
		.done( function( page ) {
			var error = self._checkPageResponse( page );
			if( error ) {
				deferred.reject( error );
				return;
			}

			for( var i = 0; i < page.imageinfo.length; i++ ) {
				var mediaType = page.imageinfo[i].mediatype;
				if( mediaType ) {
					deferred.resolve( mediaType.toLowerCase() );
					return;
				}
			}

			deferred.reject( 'Unable to resolve media type' );

		} )
		.fail( function( message ) {
			deferred.reject( message );
		} );

		return deferred;
	},

	/**
	 * Performs basic page response checks.
	 *
	 * @param {Object} page
	 * @return {string|null}
	 */
	_checkPageResponse: function( page ) {
		if( page.missing !== undefined ) {
			return 'Unable to locate the specified file';
		} else if( page.invalid !== undefined ) {
			return 'Invalid input';
		}
		return null;
	},

	/**
	 * Issues an API call querying for a specific property of a file.
	 *
	 * @param {string} filename
	 * @param {string} property
	 * @param {Object} [params] API request parameter overwrites or additional parameters.
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {Object} Single page JSON regarding the specified property.
	 *         Rejected parameters:
	 *         - {string} Error message
	 *         - {jqXHR} jqXHR object
	 */
	_query: function( filename, property, params ) {
		var deferred = $.Deferred();

		params = $.extend( {
			action: 'query',
			prop: property,
			cllimit: 500,
			titles: 'File:' + filename,
			format: 'json'
		}, params );

		$.getJSON( this._url, params )
		.done( function( response, textStatus, jqXHR ) {
			if( response.query === undefined || response.query.pages == undefined ) {
				deferred.reject( 'The API returned an unexpected response', jqXHR );
				return;
			}

			$.each( response.query.pages, function( id, page ) {
				deferred.resolve( page );
			} );

			if( deferred.state !== 'resolved' ) {
				deferred.reject( 'The API returned a corrupted result', jqXHR );
			}
		} )
		.fail( function( jqXHR, textStatus ) {
			deferred.reject( textStatus, jqXHR )
		} );

		return deferred.promise();
	}

} );

return Api;

} );

}( define ) );
