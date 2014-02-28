( function( define ) {
'use strict';

define( ['jquery', 'app/AssetPage', 'app/ImageInfo', 'dojo/_base/config', 'app/ApiError'],
	function( $, AssetPage, ImageInfo, config, ApiError ) {

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
	 *         - {ApiError}
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
				.fail( function( error ) {
					deferred.reject( error );
				} );
			} )
			.fail( function( error ) {
				deferred.reject( error );
			} );

		} )
		.fail( function( error ) {
			deferred.reject( error );
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
	 *         - {ApiError}
	 */
	_getPageContent: function( prefixedFilename, wikiUrl ) {
		var self = this,
			deferred = $.Deferred();

		this._query( prefixedFilename, 'revisions', wikiUrl, {
			rvprop: 'content',
			rvparse: 1
		} )
		.done( function( page, ajaxOptions ) {
			if( !page.revisions || page.revisions.length === 0 || !page.revisions[0]['*'] ) {
				deferred.reject( new ApiError( 'revision-invalid', ajaxOptions ) );
				return;
			}

			deferred.resolve( $( '<div/>' ).html( page.revisions[0]['*'] ) );
		} )
		.fail( function( error ) {
			deferred.reject( error );
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
	 *         - {ApiError}
	 */
	_getPageTemplates: function( prefixedFilename, wikiUrl ) {
		var deferred = $.Deferred();

		this._query( prefixedFilename, 'templates', wikiUrl, {
			tlnamespace: 10,
			tllimit: 100
		} )
		.done( function( page, ajaxOptions ) {
			if( !page.templates ) {
				deferred.reject( new ApiError( 'templates-missing', ajaxOptions ) );
				return;
			}

			var templates = [];
			$.each( page.templates, function( i, template ) {
				templates.push( template.title.replace( /^[^:]+:/ , '' ) );
			} );

			deferred.resolve( templates );
		} )
		.fail( function( error ) {
			deferred.reject( error );
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
	 *         - {ApiError}
	 */
	getImageInfo: function( prefixedFilename, size, wikiUrl ) {
		var self = this,
			deferred = $.Deferred();

		this._query( prefixedFilename, 'imageinfo', wikiUrl, {
			iiprop: 'url',
			iiurlwidth: size,
			iiurlheight: size
		} )
		.done( function( page, ajaxOptions ) {
			if( !page.imageinfo || page.imageinfo[0].length === 0 ) {
				deferred.reject( new ApiError( 'imageinfo-missing', ajaxOptions ) );
				return;
			}
			deferred.resolve( ImageInfo.newFromMediaWikiImageInfoJson( page.imageinfo[0] ) );
		} )
		.fail( function( error ) {
			deferred.reject( error );
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
	 *         - {string}
	 *         Rejected parameters:
	 *         - {ApiError}
	 */
	_getMediaType: function( prefixedFilename, wikiUrl ) {
		var self = this,
			deferred = $.Deferred();

		this._query( prefixedFilename, 'imageinfo', wikiUrl, {
			iiprop: 'mediatype',
			iilimit: 1
		} )
		.done( function( page, ajaxOptions ) {
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

			deferred.reject( new ApiError( 'mediatype-missing', ajaxOptions ) );
		} )
		.fail( function( error ) {
			deferred.reject( error );
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
	 *         - {ApiError}
	 */
	getWikipediaPageImageInfo: function( title, wikiUrl ) {
		var self = this,
			deferred = $.Deferred();

		this._getMediaType( title, wikiUrl )
		.done( function( mediaType ) {
			if( $.inArray( mediaType, config.custom.supportedMediaTypes ) !== -1 ) {
				deferred.resolve( title );
				return;
			}

			self._getWikipediaPageImages( title, wikiUrl )
			.done( function( imageTitles ) {
				self._getWikipediaImageInfos( imageTitles, wikiUrl )
				.done( function( imageUrls ) {
					deferred.resolve( imageUrls );
				} )
				.fail( function( error ) {
					deferred.reject( error );
				} );
			} )
			.fail( function( error ) {
				deferred.reject( error );
			} );
		} )
		.fail( function( error ) {
			deferred.reject( error );
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
	 *         - {ApiError}
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
		.fail( function( error ) {
			deferred.reject( error );
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
	 *         - {ApiError}
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
		.fail( function( error ) {
			deferred.reject( error );
		} );

		return deferred.promise();
	},

	/**
	 * Issues a call to the Commons API of a Wikipedia API querying for a specific property of a
	 * file.
	 *
	 * @param {string|string[]} title Page title(s)
	 * @param {string} property
	 * @param {string} [wikiUrl]
	 * @param {Object} [params] API request parameter overwrites or additional parameters.
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {Object[]}
	 *         - {Object} Options $.ajax() has been initiated with
	 *         Rejected parameters:
	 *         - {ApiError}
	 */
	_query: function( title, property, wikiUrl, params ) {
		var deferred = $.Deferred();

		params = $.extend( {
			action: 'query',
			prop: property,
			titles: $.isArray( title ) ? title.join( '|' ) : title,
			format: 'json'
		}, params );

		var ajaxOptions = {
			url: ( wikiUrl || this._defaultUrl ) + 'w/api.php',
			crossDomain: true,
			dataType: 'jsonp',
			data: params,
			timeout: 5000
		};

		$.ajax( ajaxOptions )
		.done( function( response ) {
			if( response.query === undefined || response.query.pages == undefined ) {
				deferred.reject( new ApiError( 'response-unexpected', ajaxOptions ) );
				return;
			}

			var pages = [],
				errorCode;

			$.each( response.query.pages, function( id, page ) {

				if( page.missing !== undefined ) {
					errorCode = 'page-missing';
				} else if( page.invalid !== undefined ) {
					errorCode = 'page-invalid';
				} else {
					pages.push( page );
				}

			} );

			if( pages.length === 1 ) {
				deferred.resolve( pages[0], ajaxOptions );
			} else if( pages.length > 0 ) {
				deferred.resolve( pages, ajaxOptions );
			} else if( errorCode ) {
				deferred.reject( new ApiError( errorCode, ajaxOptions ) );
			} else {
				deferred.reject( new ApiError( 'response-corrupted', ajaxOptions ) );
			}
		} )
		.fail( function() {
			// Since there is no error handling for jsonp requests, the error is a timeout in any
			// and it does not make any sense to analyze the jqXHR object.
			deferred.reject( new ApiError( '*', ajaxOptions ) );
		} );

		return deferred.promise();
	}

} );

return Api;

} );

}( define ) );
