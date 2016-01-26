/**
 * @licence GNU GPL v3
 * @author snater.com < wikimedia@snater.com >
 */
'use strict';

var $ = require( 'jquery' ),
	config = require( '../config.json' ),
	ImageInfo = require( './ImageInfo' ),
	WikiAssetPage = require( './WikiAssetPage' ),
	ApplicationError = require( './ApplicationError' );

/**
 * Commons API Handler.
 * @constructor
 *
 * @param {string} defaultUrl
 *
 * @throws {Error} if a required parameter is omitted.
 */
var Api = function( defaultUrl ) {
	if( !defaultUrl ) {
		throw new Error( 'A required parameter has been omitted' );
	}
	this._defaultUrl = defaultUrl;
};

$.extend( Api.prototype, {
	/**
	 * Default API URL.
	 * @type {string}
	 */
	_defaultUrl: null,

	/**
	 * Returns the API's default URL.
	 * @return {string}
	 */
	getDefaultUrl: function() {
		return this._defaultUrl;
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
	 *         - {ApplicationError}
	 */
	getAsset: function( prefixedFilename, wikiUrl ) {
		var self = this,
			deferred = $.Deferred();

		this._getMetaData( prefixedFilename, wikiUrl )
			.done( function( metaData ) {

				self._getPageContent( prefixedFilename, wikiUrl )
					.done( function( $dom ) {

						self._getPageTemplates( prefixedFilename, wikiUrl )
							.done( function( templates ) {
								var assetPage = new WikiAssetPage(
									prefixedFilename, metaData.mediatype, $dom, templates, self, wikiUrl
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
	 *         - {ApplicationError}
	 */
	_getPageContent: function( prefixedFilename, wikiUrl ) {
		var deferred = $.Deferred();

		this._getResultsFromApi( prefixedFilename, 'revisions', wikiUrl, {
			rvprop: 'content',
			rvparse: 1
		} )
			.done( function( page ) {
				if( !page.revisions || page.revisions.length === 0 || !page.revisions[ 0 ][ '*' ] ) {
					deferred.reject( new ApplicationError( 'revision-invalid' ) );
					return;
				}

				deferred.resolve( $( '<div/>' ).html( page.revisions[ 0 ][ '*' ] ) );
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
	 *         - {ApplicationError}
	 */
	_getPageTemplates: function( prefixedFilename, wikiUrl ) {
		var deferred = $.Deferred();

		this._getResultsFromApi( prefixedFilename, 'templates', wikiUrl, {
			tlnamespace: 10,
			tllimit: 100
		}, 'tlcontinue' )
			.done( function( page ) {
				if( !page.templates ) {
					deferred.reject( new ApplicationError( 'templates-missing' ) );
					return;
				}

				var templates = [];
				$.each( page.templates, function( i, template ) {
					templates.push( template.title.replace( /^[^:]+:/, '' ) );
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
	 *         - {ApplicationError}
	 */
	getImageInfo: function( prefixedFilename, size, wikiUrl ) {
		var deferred = $.Deferred();

		this._getResultsFromApi( prefixedFilename, 'imageinfo', wikiUrl, {
			iiprop: 'url|size',
			iiurlwidth: size,
			iiurlheight: size
		} )
			.done( function( page ) {
				if( !page.imageinfo || page.imageinfo[ 0 ].length === 0 ) {
					deferred.reject( new ApplicationError( 'imageinfo-missing' ) );
					return;
				}
				deferred.resolve( ImageInfo.newFromMediaWikiImageInfoJson( page.imageinfo[ 0 ] ) );
			} )
			.fail( function( error ) {
				deferred.reject( error );
			} );

		return deferred.promise();
	},

	/**
	 * Retrieves a file's meta data.
	 *
	 * @param {string} prefixedFilename
	 * @param {string} [wikiUrl]
	 * @return {Object} jQuery Promise:
	 *         Resolved parameters:
	 *         - {Object}
	 *         Rejected parameters:
	 *         - {ApplicationError}
	 */
	_getMetaData: function( prefixedFilename, wikiUrl ) {
		var deferred = $.Deferred();

		this._getResultsFromApi( prefixedFilename, 'imageinfo', wikiUrl, {
			iiprop: 'mediatype|url',
			iilimit: 1
		} )
			.done( function( page ) {
				if( !page.imageinfo ) {
					deferred.resolve( 'unknown' );
					return;
				}

				for( var i = 0; i < page.imageinfo.length; i++ ) {
					var metaData = page.imageinfo[ i ];
					if( metaData.mediatype ) {
						metaData.mediatype = metaData.mediatype.toLowerCase();
					}
					deferred.resolve( metaData );
					return;
				}

				deferred.reject( new ApplicationError( 'mediatype-missing' ) );
			} )
			.fail( function( error ) {
				deferred.reject( error );
			} );

		return deferred;
	},

	/**
	 * Checks a specific Wikipedia page for images returning the image info for each image used on
	 * the page. If the page itself is a description page of an image, the resolved promise
	 * transmits the title the function was called with. The resolved promise's second parameter is
	 * the original wiki URL or the full asset URL if the asset is not stored on the local Wiki.
	 *
	 * @param {string} title
	 * @param {string} [wikiUrl]
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {ImageInfo[]|string}
	 *         - {string}
	 *         Rejected parameters:
	 *         - {ApplicationError}
	 */
	getWikipediaPageImageInfo: function( title, wikiUrl ) {
		var self = this,
			deferred = $.Deferred();

		this._getMetaData( title, wikiUrl )
			.done( function( metaData ) {
				if( typeof metaData === 'object' && metaData.mediatype ) {
					deferred.resolve( title, metaData.url );
					return;
				}

				self._getWikipediaPageImages( title, wikiUrl )
					.done( function( imageTitles ) {
						self._getWikipediaImageInfos( imageTitles, wikiUrl )
							.done( function( imageUrls ) {
								deferred.resolve( imageUrls, wikiUrl );
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
	 *         - {ApplicationError}
	 */
	_getWikipediaPageImages: function( title, wikiUrl ) {
		var deferred = $.Deferred();

		var params = {
			imlimit: 100,
			titles: title,
			format: 'json'
		};

		this._getResultsFromApi( title, 'images', wikiUrl, params )
			.done( function( page ) {
				if( page.images === undefined || page.images.length === 0  ) {
					deferred.reject( new ApplicationError( 'url-invalid' ) );
					return;
				}
				var imageTitles = [];

				for( var i = 0; i < page.images.length; i++ ) {
					imageTitles.push( page.images[ i ].title );
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
	 *         - {ApplicationError}
	 */
	_getWikipediaImageInfos: function( imageTitles, wikiUrl ) {
		var deferred = $.Deferred();

		if( imageTitles.length === 0 ) {
			deferred.resolve( [] );
			return deferred.promise();
		}

		this._getImageInfoBatch( imageTitles, wikiUrl, new $.Deferred(), [] )
			.done( function( imageInfos ) {
				deferred.resolve( imageInfos );
			} )
			.fail( function( error ) {
				deferred.reject( error );
			} );

		return deferred.promise();
	},

	/**
	 * Retrieves image info for a batch of (max 50) images. Continues with another batch if more images has been
	 * passed in.
	 *
	 * @param {string[]} titles
	 * @param {string} wikiUrl
	 * @param {Object} deferred jQuery Deferred object instance shared by consecutive queries
	 * @param {ImageInfo[]} imageInfos image info data collected by previous queries
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {ImageInfo[]}
	 *         Rejected parameters:
	 *         - {ApplicationError}
	 */
	_getImageInfoBatch: function( titles, wikiUrl, deferred, imageInfos ) {
		var params = {
			iiprop: 'url',
			iilimit: 1,
			iiurlheight: 300
		},
			self = this,
			titleLimit = 50,
			titleSubset = titles.slice( 0, Math.min( titleLimit, titles.length ) );

		this._getResultsFromApi( titleSubset, 'imageinfo', wikiUrl, params )
			.done( function( pages ) {
				if( !$.isArray( pages ) ) {
					pages = [ pages ];
				}

				$.each( pages, function( index, page ) {
					imageInfos.push( ImageInfo.newFromMediaWikiImageInfoJson( page.imageinfo[ 0 ] ) );
				} );

				if( titles.length > titleLimit ) {
					return self._getImageInfoBatch( titles.slice( titleSubset.length ), wikiUrl, deferred, imageInfos );
				}

				deferred.resolve( imageInfos );
			} )
			.fail( function( error ) {
				deferred.reject( error );
			} );

		return deferred.promise();
	},

	/**
	 * Issues a call to the Commons API or a Wikipedia API querying for a specific property of a
	 * file, and returns an array of Page data..
	 *
	 * @param {string|string[]} title Page title(s)
	 * @param {string} property
	 * @param {string} [wikiUrl]
	 * @param {Object} [params] API request parameter overwrites or additional parameters.
	 * @param {string|null} continuationParam name of the continuation parameter used in API requests and responses, or null if no continuation required
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {Object[]}
	 *         Rejected parameters:
	 *         - {ApplicationError}
	 */
	_getResultsFromApi: function( title, property, wikiUrl, params, continuationParam ) {
		var deferred = $.Deferred(),
			queryParams = $.extend( {
				action: 'query',
				prop: property,
				titles: $.isArray( title ) ? title.join( '|' ) : title,
				format: 'json'
			}, params );
		this._query( wikiUrl, queryParams, continuationParam, 0, new $.Deferred(), [] )
			.done( function( results ) {
				deferred.resolve( results );
			} )
			.fail( function( error ) {
				deferred.reject( error );
			} );
		return deferred.promise();
	},

	/**
	 * Send a query to Commons or Wikipedia API, and returns an array of page data.
	 * Performs multiple queries if contination parameter is provided, and size of API response requires continuation.
	 *
	 * @param {string|string[]} wikiUrl
	 * @param {string} params API request parameters
	 * @param {string|null} continuationParam name of the continuation parameter used in API requests and responses, or null if no continuation required
	 * @param {int|null} continuationCount number of API calls already done for the query, or null if no continuation required
	 * @param {Object} deferred jQuery Deferred object instance shared by consecutive queries (in case of continuation)
	 * @param {Array} results data collected by previous queries (in case of continuation)
	 * @returns {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {Object[]}
	 *         Rejected parameters:
	 *         - {ApplicationError}
	 */
	_query: function( wikiUrl, params, continuationParam, continuationCount, deferred, results ) {
		var ajaxOptions = {
				url: ( wikiUrl || this._defaultUrl ) + 'w/api.php',
				crossDomain: true,
				dataType: 'jsonp',
				data: params,
				timeout: 5000
			},
			self = this;

		$.ajax( ajaxOptions )
			.done( function( response ) {
				if( response.query === undefined || response.query.pages === undefined ) {
					deferred.reject( new ApplicationError( 'response-unexpected' ) );
					return;
				}

				var pages = [],
					errorCode;

				$.each( response.query.pages, function( id, page ) {
					var isSharedImage = params['prop'] === 'imageinfo' && page.imagerepository === 'shared';

					if( page.missing !== undefined && !isSharedImage ) {
						errorCode = 'page-missing';
					} else if( page.invalid !== undefined ) {
						errorCode = 'page-invalid';
					} else {
						pages.push( page );
					}

				} );

				pages = self._mergeResultArrays( results, pages );
				continuationCount++;

				if( self._continuationNeeded( response, continuationParam, continuationCount ) ) {
					params['tlcontinue'] = response.continue[continuationParam];
					return self._query( wikiUrl, params, continuationParam, continuationCount, deferred, pages );
				}

				if( pages.length === 1 ) {
					deferred.resolve( pages[ 0 ] );
				} else if( pages.length > 0 ) {
					deferred.resolve( pages );
				} else if( errorCode ) {
					deferred.reject( new ApplicationError( errorCode ) );
				} else {
					deferred.reject( new ApplicationError( 'response-corrupted' ) );
				}
			} )
			.fail( function() {
				// Since there is no error handling for jsonp requests, the error is a timeout in any
				// and it does not make any sense to analyze the jqXHR object.
				deferred.reject( new ApplicationError( 'generic-error' ) );
			} );

		return deferred.promise();
	},

	/**
	 * Checks if continuation queries are required
	 *
	 * @param {Array} response API response
	 * @param {string|null} continuationParam name of the continuation parameter used in API requests and responses, or null if no continuation required
	 * @param {int|null} continuationCount number of API calls already done for the query, or null if no continuation required
	 * @returns {boolean}
	 */
	_continuationNeeded: function( response, continuationParam, continuationCount ) {
		return continuationParam !== undefined && response.continue !== undefined && response.continue[continuationParam] !== undefined
			&& continuationCount < config.apiContinuationLimit;
	},

	/**
	 * Merges results collected by two API queries
	 *
	 * @param {Array} a
	 * @param {Array} b
	 * @returns {Array}
	 */
	_mergeResultArrays: function( a, b ) {
		var pageIds = $.map( a, function( x ) { return x.pageid;  } ),
			merged = $.extend( [], a ),
			self = this;
		$.each( b, function( i, page ) {
			var index = pageIds.indexOf( page.pageid );
			if( index > -1 ) {
				merged[index] = self._mergePageData( merged[index], page );
			} else {
				merged.push( page );
			}
		} );
		return merged;
	},

	/**
	 * Merges page data collected by two API queries. Array values of the same property are concatenated, other properties
	 * remain unchanged
	 *
	 * @param {Array} data current page data
	 * @param {Array} moarData page data to be added
	 * @returns {Array}
	 */
	_mergePageData: function( data, moarData ) {
		$.each( moarData, function( i, prop ) {
			if( Array.isArray( prop ) ) {
				data[i] = data[i].concat( prop );
			}
		} );
		return data;
	}

} );

module.exports = Api;
