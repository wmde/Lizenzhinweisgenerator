( function( define ) {
'use strict';

define( ['jquery', 'app/AssetPage', 'app/ImageInfo'], function( $, AssetPage, ImageInfo ) {

/**
 * Commons API Handler.
 * @constructor
 *
 * @param {string} defaultUrl
 * @param {LicenceStore} licenceStore
 *
 * @throws {Error} if a required parameter is omitted.
 */
var Api = function( defaultUrl, licenceStore ) {
	if( !defaultUrl || !licenceStore ) {
		throw new Error( 'A required parameter has been omitted' );
	}
	this._defaultUrl = defaultUrl;
	this._licenceStore = licenceStore;
};

$.extend( Api.prototype, {
	/**
	 * Default API URL.
	 * @type {string}
	 */
	_defaultUrl: null,

	/**
	 * @param {LicenceStore|null}
	 */
	_licenceStore: null,

	/**
	 * Returns the API's default URL.
	 * @return {string}
	 */
	getDefaultUrl: function() {
		return this._defaultUrl;
	},

	/**
	 * @return {LicenceStore|null}
	 */
	getLicenceStore: function() {
		return this._licenceStore;
	},

	/**
	 * Generates an Asset object for a specific filename.
	 *
	 * @param {string} prefixedFilename
	 * @param {string} [wikiUrl]
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {Asset}
	 *         Rejected parameters:
	 *         - {string} Error message
	 */
	getAsset: function( prefixedFilename, wikiUrl ) {
		var self = this,
			deferred = $.Deferred();

		this._getMediaType( prefixedFilename, wikiUrl )
		.done( function( mediaType ) {

			self._getPageContent( prefixedFilename, wikiUrl )
			.done( function( $dom ) {

				self._getPageTemplates( prefixedFilename, wikiUrl )
				.done( function( templates ) {
					var assetPage = new AssetPage(
						prefixedFilename, mediaType, $dom, templates, self, wikiUrl
					);

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
	 * @param {string} prefixedFilename
	 * @param {string} [wikiUrl]
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {jQuery} Page content DOM
	 *         Rejected parameters:
	 *         - {string} Error message
	 */
	_getPageContent: function( prefixedFilename, wikiUrl ) {
		var self = this,
			deferred = $.Deferred();

		this._query( prefixedFilename, 'revisions', wikiUrl, {
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
		.fail( function( message ) {
			deferred.reject( message );
		} );

		return deferred.promise();
	},

	/**
	 * Retrieves the Wikipage templates used on a specific file's description page.
	 *
	 * @param {string} prefixedFilename
	 * @param {string} [wikiUrl]
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {string[]}
	 *         Rejected parameters:
	 *         - {string} Error message
	 */
	_getPageTemplates: function( prefixedFilename, wikiUrl ) {
		var deferred = $.Deferred();

		this._query( prefixedFilename, 'templates', wikiUrl, {
			tlnamespace: 10,
			tllimit: 100
		} )
		.done( function( page ) {
			if( !page.templates ) {
				deferred.reject( 'No templates found' );
				return;
			}

			var templates = [];
			$.each( page.templates, function( i, template ) {
				templates.push( template.title.replace( /^[^:]+:/ , '' ) );
			} );

			deferred.resolve( templates );
		} )
		.fail( function( message ) {
			deferred.reject( message );
		} );

		return deferred.promise();
	},

	/**
	 * Retrieves image information for a specific file according to a specific image size.
	 *
	 * @param {string} prefixedFilename
	 * @param {number} size
	 * @param {string} [wikiUrl]
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {ImageInfo}
	 *         Rejected parameters:
	 *         - {string} Error message
	 */
	getImageInfo: function( prefixedFilename, size, wikiUrl ) {
		var self = this,
			deferred = $.Deferred();

		this._query( prefixedFilename, 'imageinfo', wikiUrl, {
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
			deferred.resolve( ImageInfo.newFromMediaWikiImageInfoJson( page.imageinfo[0] ) );
		} )
		.fail( function( message ) {
			deferred.reject( message );
		} );

		return deferred.promise();
	},

	/**
	 * Retrieves a file's media type.
	 *
	 * @param {string} prefixedFilename
	 * @param {string} [wikiUrl]
	 * @return {Object} jQuery Promise:
	 *         Resolved parameters:
	 *         - {string} The file's media type.
	 *         Rejected parameters:
	 *         - {string} Error message
	 */
	_getMediaType: function( prefixedFilename, wikiUrl ) {
		var self = this,
			deferred = $.Deferred();

		this._query( prefixedFilename, 'imageinfo', wikiUrl, {
			iiprop: 'mediatype',
			iilimit: 1
		} )
		.done( function( page ) {
			var error = self._checkPageResponse( page );
			if( error ) {
				deferred.reject( error );
				return;
			}

			if( !page.imageinfo ) {
				deferred.resolve( 'unknown' );
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
	 * Checks a specific Wikipedia page for images returning the image info for each image used on
	 * the page. If the page itself is a description page of an image, the resolved promise
	 * transmits the title the function was called with.
	 *
	 * @param {string} title
	 * @param {string} [wikiUrl]
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {ImageInfo[]|string}
	 *         Rejected parameters:
	 *         - {string} Error message
	 */
	getWikipediaPageImageInfo: function( title, wikiUrl ) {
		var self = this,
			deferred = $.Deferred();

		this._getMediaType( title, wikiUrl )
		.done( function( mediaType ) {
			if( mediaType === 'bitmap' || mediaType === 'drawing' ) {
				deferred.resolve( title );
				return;
			}

			self._getWikipediaPageImages( title, wikiUrl )
			.done( function( imageTitles ) {
				self._getWikipediaImageInfos( imageTitles, wikiUrl )
				.done( function( imageUrls ) {
					deferred.resolve( imageUrls );
				} )
				.fail( function( jqXHR, textStatus ) {
					deferred.reject( textStatus );
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
	 * Retrieves the titles of the images used on an specific Wikipedia page.
	 *
	 * @param {string} title
	 * @param {string} [wikiUrl]
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {string[]}
	 *         Rejected parameters:
	 *         - {string} Error message
	 */
	_getWikipediaPageImages: function( title, wikiUrl ) {
		var self = this,
			deferred = $.Deferred();

		var params = {
			imlimit: 100,
			titles: title,
			format: 'json'
		};

		this._query( title, 'images', wikiUrl, params )
		.done( function( page ) {
			var imageTitles = [];

			for( var i = 0; i < page.images.length; i++ ) {
				imageTitles.push( page.images[i].title );
			}

			deferred.resolve( imageTitles );
		} )
		.fail( function( jqXHR, textStatus ) {
			deferred.reject( textStatus );
		} );

		return deferred.promise();
	},

	/**
	 * Retrieves image info for a list of images used on a specific Wikipedia.
	 *
	 * @param {string[]} imageTitles
	 * @param {string} [wikiUrl]
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {ImageInfo[]}
	 *         Rejected parameters:
	 *         - {string} Error message
	 */
	_getWikipediaImageInfos: function( imageTitles, wikiUrl ) {
		var deferred = $.Deferred();

		if( imageTitles.length === 0 ) {
			deferred.resolve( [] );
			return deferred.promise();
		}

		var params = {
			iiprop: 'url',
			iilimit: 1,
			iiurlwidth: 300,
			iiurlheight: 300
		};

		this._query( imageTitles, 'imageinfo', wikiUrl, params )
		.done( function( pages ) {
			var imageInfos = [];

			$.each( pages, function( index, page ) {
				imageInfos.push( ImageInfo.newFromMediaWikiImageInfoJson( page.imageinfo[0] ) );
			} );

			deferred.resolve( imageInfos );
		} )
		.fail( function( jqXHR, textStatus ) {
			deferred.reject( textStatus );
		} );

		return deferred.promise();
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
	 * @param {string|string[]} title Page title(s)
	 * @param {string} property
	 * @param {string} [wikiUrl]
	 * @param {Object} [params] API request parameter overwrites or additional parameters.
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {Object} Single page JSON regarding the specified property.
	 *         Rejected parameters:
	 *         - {string} Error message
	 *         - {jqXHR} jqXHR object
	 */
	_query: function( title, property, wikiUrl, params ) {
		var deferred = $.Deferred();

		params = $.extend( {
			action: 'query',
			prop: property,
			titles: $.isArray( title ) ? title.join( '|' ) : title,
			format: 'json'
		}, params );

		$.ajax( {
			url: ( wikiUrl || this._defaultUrl ) + 'w/api.php',
			crossDomain: true,
			dataType: 'jsonp',
			data: params
		} )
		.done( function( response, textStatus, jqXHR ) {
			if( response.query === undefined || response.query.pages == undefined ) {
				deferred.reject( 'The API returned an unexpected response', jqXHR );
				return;
			}

			var pages = [];

			$.each( response.query.pages, function( id, page ) {
				pages.push( page );
			} );

			if( pages.length === 1 ) {
				deferred.resolve( pages[0] );
			} else if( pages.length > 0 ) {
				deferred.resolve( pages );
			} else {
				deferred.reject( 'The API returned a corrupted result', jqXHR );
			}
		} )
		.fail( function( jqXHR, textStatus ) {
			deferred.reject( textStatus, jqXHR );
		} );

		return deferred.promise();
	}

} );

return Api;

} );

}( define ) );
