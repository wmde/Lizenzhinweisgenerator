/**
 * @licence GNU GPL v3
 * @author snater.com < wikimedia@snater.com >
 */
'use strict';

var $ = require( 'jquery' ),
	ApplicationError = require( './ApplicationError' );

/**
 * Returns a filename by analyzing input.
 * @constructor
 *
 * @param {Api} api
 *
 * @throws {Error} if required parameters have not been specified properly.
 */
var InputHandler = function( api ) {
	if( !api ) {
		throw new Error( 'Improper specification of required parameters' );
	}
	this._api = api;
};

$.extend( InputHandler.prototype, {
	/**
	 * @type {Api}
	 */
	_api: null,

	/**
	 * Tries to retrieve a filename evaluating the input parameter. If the referred Wikipedia page
	 * does not refer to an asset itself, the promise will contain ImageInfo objects for all images
	 * on that Wikipedia page instead of an asset filename.
	 *
	 * @param {string} input
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {string|ImageInfo[]}
	 *         [- {string} wikiUrl]
	 *         Rejected parameters:
	 *         - {ApplicationError}
	 */
	getFilename: function( input ) {
		var deferred = $.Deferred();

		if( typeof input === 'string' ) {
			return this._evaluate( input );
		} else {
			deferred.reject( new ApplicationError( 'input-invalid' ) );
		}

		return deferred.promise();
	},

	/**
	 * Evaluates an URL an extracts the filename (MediaWiki title) from it, if the URL refers to a
	 * specific file. If the URL corresponds to a Wikipedia page, file info objects for the images
	 * used on the page are returned in the promise object.
	 * If no Wikimedia URL is detected, the resolved promise's parameter is the original input
	 * string.
	 *
	 * @param url
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {string|ImageInfo[]}
	 *         [- {string} wikiUrl]
	 *         Rejected parameters:
	 *         - {ApplicationError}
	 */
	_evaluate: function( url ) {
		var deferred = $.Deferred();

		if( this._isWikiUrl( url ) ) {
			return this._getWikipediaPageImagesFileInfo( url );
		} else {
			deferred.reject( new ApplicationError( 'no-wiki-url' ) );
		}

		return deferred.promise();
	},

	/**
	 * @param {string} url
	 * @return {boolean}
	 */
	_isWikiUrl: function( url ) {
		return url.indexOf( '.wikipedia.org/w' ) !== -1
			|| (
				url.indexOf( 'upload.wikimedia.org/wikipedia/' ) !== -1 && url.indexOf( '/wikipedia/commons/' ) === -1
			)
			|| url.indexOf( 'wikimedia.org/' ) !== -1;
	},

	/**
	 * Extracts a prefixed filename (MediaWiki page title) out of an URL string.
	 *
	 * @param {string} url
	 * @param {string} [wikiUrl]
	 * @param {boolean} [forcePrefix]
	 *        Default: true
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {string}
	 *         Rejected parameters:
	 *         - {ApplicationError}
	 */
	_extractPageTitle: function( url, wikiUrl, forcePrefix ) {
		var deferred = $.Deferred();

		if( forcePrefix === undefined ) {
			forcePrefix = true;
		}

		this._extractFilename( url, wikiUrl )
			.done( function( filename ) {
				var prefixedFilename = decodeURIComponent( filename );
				if( prefixedFilename.indexOf( ':' ) === -1 && forcePrefix ) {
					prefixedFilename = 'File:' + prefixedFilename;
				}

				deferred.resolve(  prefixedFilename );
			} )
			.fail( function( error ) {
				deferred.reject( error );
			} );

		return deferred.promise();
	},

	/**
	 * Extracts filename or mediawiki page title
	 *
	 * @param {string} url
	 * @param {string} [wikiUrl]
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {string}
	 *         Rejected parameters:
	 *         - {ApplicationError}
	 */
	_extractFilename: function( url, wikiUrl ) {
		var deferred = $.Deferred(),
			key,
			keyLoc,
			matches,
			segments,
			pageId;

		if( url.indexOf( 'curid=' ) !== -1 ) {
			matches = url.match( /curid=([^&=]+)/i );
			pageId = matches[ 1 ];
			this._api.getTitleFromPageId( pageId, wikiUrl )
				.done( function( title ) {
					deferred.resolve( title );
				} )
				.fail( function( error ) {
					deferred.reject( error );
				} );
			return deferred.promise();
		}

		if( url.indexOf( 'title=' ) !== -1 ) {
			matches = url.match( /title=([^&]+)/i );
			deferred.resolve( matches[ 1 ] );
			return deferred.promise();
		}
		url = url.replace( /\?.+$/, '' );

		key = '#mediaviewer/';
		keyLoc = url.indexOf( key );

		if( keyLoc !== -1 ) {
			deferred.resolve( url.substr( keyLoc + key.length ) );
			return deferred.promise();
		}

		key = '#/media/';
		keyLoc = url.indexOf( key );

		if( keyLoc !== -1 ) {
			deferred.resolve( url.substr( keyLoc + key.length ) );
			return deferred.promise();
		}

		key = 'wiki/';
		keyLoc = url.indexOf( key );

		if( keyLoc !== -1 ) {
			deferred.resolve( url.substr( keyLoc + key.length ) );
			return deferred.promise();
		}

		segments = url.split( '/' );
		if( $.inArray( 'thumb', segments ) !== -1 ) {
			deferred.resolve( segments[ segments.length - 2 ] );
		} else {
			deferred.resolve( segments[ segments.length - 1 ] );
		}

		return deferred.promise();
	},

	/**
	 * Splits a URL into the base URL of a Wiki and the asset title.
	 *
	 * @param {string} url
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {Object} Contains keys wikiUrl and title
	 *         Rejected parameters:
	 *         - {ApplicationError}
	 */
	_splitUrl: function( url ) {
		var deferred = $.Deferred(),
			regExp0 = /upload.wikimedia\.org\/wikipedia\/([-a-z]{2,})\//i,
			regExp1 = /([-a-z]{2,})(\.m)?\.wikipedia\.org\//i,
			regExp2 = /\/wikipedia\/([^/]+)\//,
			matches,
			wikiUrl;

		if( url.indexOf( 'commons.wikimedia.org/' ) !== -1 || url.indexOf( 'commons.m.wikimedia.org/' ) !== -1 ) {
			wikiUrl = 'https://commons.wikimedia.org/';
			this._extractPageTitle( url )
				.done( function( title ) {
					deferred.resolve( {
						wikiUrl: wikiUrl,
						title: title
					} );
				} )
				.fail( function( error ) {
					deferred.reject( error );
				} );
			return deferred.promise();
		}

		if( regExp0.test( url ) ) {
			matches = url.match( regExp0 );
			var domain = ( matches[ 1 ] === 'commons' ) ? 'wikimedia' : 'wikipedia';
			wikiUrl = 'https://' + matches[ 1 ] + '.' + domain + '.org/';
			this._extractPageTitle( url )
				.done( function( title ) {
					deferred.resolve( {
						wikiUrl: wikiUrl,
						title: title
					} );
				} )
				.fail( function( error ) {
					deferred.reject( error );
				} );
			return deferred.promise();
		}

		if( regExp1.test( url ) ) {
			matches = url.match( regExp1 );
			wikiUrl = 'https://' + matches[ 1 ] + '.wikipedia.org/';

			this._extractPageTitle( url, wikiUrl, false )
				.done( function( title ) {
					deferred.resolve( {
						wikiUrl: wikiUrl,
						title: title
					} );
				} )
				.fail( function( error ) {
					deferred.reject( error );
				} );
			return deferred.promise();
		}

		if( regExp2.test( url ) ) {
			matches = url.match( regExp2 );
			wikiUrl = 'https://' + matches[ 1 ] + '.wikipedia.org/';
			this._extractPageTitle( url )
				.done( function( title ) {
					deferred.resolve( {
						wikiUrl: wikiUrl,
						title: title
					} );
				} )
				.fail( function( error ) {
					deferred.reject( error );
				} );
			return deferred.promise();
		}

		deferred.reject( new ApplicationError( 'url-invalid' ) );

		return deferred.promise();
	},

	/**
	 * Retrieves file info for all images used on a specific Wikipedia page. If the page is an
	 * image description page, the promise will transmit the prefixed filename (MediaWiki page
	 * title).
	 *
	 * @param {string} url
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {ImageInfo[]|string}
	 *         - {string} wikiUrl
	 *         Rejected parameters:
	 *         - {ApplicationError}
	 */
	_getWikipediaPageImagesFileInfo: function( url ) {
		var self = this,
			deferred = $.Deferred();

		this._splitUrl( url )
			.done( function( urlInfo ) {
				var wikiUrl = urlInfo.wikiUrl;
				self._api.getWikipediaPageImageInfo( decodeURI( urlInfo.title ), wikiUrl )
					.done( function( prefixedFilenameOrImageInfos, url ) {
						// Overwrite initial information if the asset is not stored in the local Wiki:
						self._splitUrl( url )
							.done( function( evaluatedUrlInfo ) {
								if( evaluatedUrlInfo.wikiUrl !== wikiUrl ) {
									deferred.resolve( evaluatedUrlInfo.title, evaluatedUrlInfo.wikiUrl );
								} else {
									deferred.resolve( prefixedFilenameOrImageInfos, wikiUrl );
								}
							} )
							.fail( function( error ) {
								deferred.reject( error );
							} );
					} )
					.fail( function( error ) {
						deferred.reject( error );
					} );
			} )
			.fail( function() {
				deferred.reject( new ApplicationError( 'url-invalid' ) );
			} );

		return deferred.promise();
	}
} );

module.exports = InputHandler;
