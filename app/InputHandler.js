/**
 * @licence GNU GPL v3
 * @author snater.com < wikimedia@snater.com >
 */
define( ['jquery', 'app/ApplicationError'], function( $, ApplicationError ) {
'use strict';

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
	 * If no Wikimedia URL is detected, the resolved promise's parameter is the original input
	 * string.
	 *
	 * @param {string|jQuery.Event} input May be a Commons URL or a drop event.
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {string|ImageInfo[]}
	 *         [- {string} wikiUrl]
	 *         Rejected parameters:
	 *         - {ApplicationError}
	 */
	getFilename: function( input ) {
		var self = this,
			deferred = $.Deferred();

		if( input instanceof $.Event ) {
			this._getUrlFromEvent( input )
			.done( function( url ) {
				self._evaluate( url )
				.done( function( prefixedFilenameOrImageInfos, wikiUrl ) {
					deferred.resolve( prefixedFilenameOrImageInfos, wikiUrl );
				} )
				.fail( function( error ) {
					deferred.reject( error );
				} );
			} )
			.fail( function( error ) {
				deferred.reject( error );
			} );
		} else if( typeof input === 'string' ) {
			return this._evaluate( input );
		} else {
			deferred.reject( new ApplicationError( 'input-invalid' ) );
		}

		return deferred.promise();
	},

	/**
	 * Extracts the URL from a drop event.
	 *
	 * @param {jQuery.Event} event
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {string} File URL
	 *         Rejected parameters:
	 *         - {ApplicationError}
	 */
	_getUrlFromEvent: function( event ) {
		var deferred = $.Deferred();

		if( event.type !== 'drop' || !event.dataTransfer ) {
			deferred.reject( new ApplicationError( 'event-unsupported' ) );
			return deferred.promise();
		}

		if(
			event.dataTransfer.items !== undefined
			&& event.dataTransfer.items[0] !== undefined
			&& event.dataTransfer.items[0].getAsString !== undefined
		) {
			event.dataTransfer.items[0].getAsString( function( url ) {
				deferred.resolve( url );
			} );
		} else {
			var img = event.dataTransfer.getData( 'text/html' );
			deferred.resolve( $( '<div/>' ).html( img ).find( 'img' ).attr( 'src' ) );
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

		if(
			url.indexOf( '.wikipedia.org/w' ) !== -1
			|| url.indexOf( 'upload.wikimedia.org/wikipedia/' ) !== -1
				&& url.indexOf( '/wikipedia/commons/' ) === -1
		) {
			return this._getWikipediaPageImagesFileInfo( url );
		} else if( url.indexOf( '.wikimedia.org/' ) !== -1 ) {
			var urlInfo = this._splitUrl( url );
			deferred.resolve( urlInfo.title, urlInfo.wikiUrl );
		} else {
			deferred.resolve( url );
		}

		return deferred.promise();
	},

	/**
	 * Extracts a prefixed filename (MediaWiki page title) out of an URL string.
	 *
	 * @param {string} url
	 * @param {boolean} [forcePrefix]
	 *        Default: true
	 * @return {string}
	 */
	_extractPageTitle: function( url, forcePrefix ) {
		var filename,
			prefixedFilename;

		if( forcePrefix === undefined ) {
			forcePrefix = true;
		}

		filename = this._extractFilename( url );

		prefixedFilename = decodeURIComponent( filename );
		if( prefixedFilename.indexOf( ':' ) === -1 && forcePrefix ) {
			prefixedFilename = 'File:' + prefixedFilename;
		}

		return prefixedFilename;
	},

	/**
	 * Extracts filename or mediawiki page title
	 *
	 * @param {string} url
	 * @return {string}
	 */
	_extractFilename: function( url ) {
		var key,
			keyLoc,
			matches,
			segments;

		key = '#mediaviewer/';
		keyLoc = url.indexOf( key );

		if( keyLoc !== -1 ) {
			return url.substr( keyLoc + key.length );
		}

		key = '#/media/';
		keyLoc = url.indexOf( key );

		if( keyLoc !== -1 ) {
			return url.substr( keyLoc + key.length );
		}

		if( url.indexOf( 'title=' ) !== -1 ) {
			matches = url.match( /title=([^&]+)/i );
			return matches[1];
		}

		key = 'wiki/';
		keyLoc = url.indexOf( key );

		if( keyLoc !== -1 ) {
			return url.substr( keyLoc + key.length );
		}

		segments = url.split( '/' );
		return ( $.inArray( 'thumb', segments ) !== -1 )
			? segments[segments.length - 2]
			: segments[segments.length - 1];
	},

	/**
	 * Splits a URL into the base URL of a Wiki and the asset title.
	 *
	 * @param {string} url
	 * @return {Object}
	 */
	_splitUrl: function( url ) {
		var regExp0 = /upload.wikimedia\.org\/wikipedia\/([-a-z]{2,})\//i,
			regExp1 = /([-a-z]{2,}\.wikipedia\.org)\//i,
			regExp2 = /\/wikipedia\/([^/]+)\//,
			matches,
			wikiUrl,
			title;

		if( url.indexOf( 'commons.wikimedia.org/' ) !== -1 ) {
			wikiUrl = 'https://commons.wikimedia.org/';
			title = this._extractPageTitle( url );
		} else if( regExp0.test( url ) ) {
			matches = url.match( regExp0 );
			var domain = ( matches[1] === 'commons' ) ? 'wikimedia' : 'wikipedia';
			wikiUrl = 'https://' + matches[1] + '.' + domain + '.org/';
			title = this._extractPageTitle( url );
		} else if( regExp1.test( url ) ) {
			matches = url.match( regExp1 );
			wikiUrl = 'https://' + matches[1] + '/';

			title = url.indexOf( 'title=' ) !== -1
				? url.match( /title=([^&]+)/i )[1]
				: this._extractPageTitle( url.replace( /\?.+$/, '' ), false );

		} else if( regExp2.test( url ) ) {
			matches = url.match( regExp2 );
			wikiUrl = 'https://' + matches[1] + '.wikipedia.org/';
			title = this._extractPageTitle( url );
		}

		return {
			wikiUrl: wikiUrl,
			title: title
		};
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
			deferred = $.Deferred(),
			urlInfo = this._splitUrl( url ),
			wikiUrl = urlInfo.wikiUrl;

		if( !wikiUrl ) {
			deferred.reject( new ApplicationError( 'url-invalid' ) );
			return deferred.promise();
		}

		this._api.getWikipediaPageImageInfo( decodeURI( urlInfo.title ), wikiUrl )
		.done( function( prefixedFilenameOrImageInfos, url ) {
			// Overwrite initial information if the asset is not stored in the local Wiki:
			var evaluatedUrlInfo = self._splitUrl( url );
			if( evaluatedUrlInfo.wikiUrl !== wikiUrl ) {
				urlInfo = self._splitUrl( url );
				deferred.resolve( urlInfo.title, urlInfo.wikiUrl );
			} else {
				deferred.resolve( prefixedFilenameOrImageInfos, wikiUrl );
			}
		} )
		.fail( function( error ) {
			deferred.reject( error );
		} );

		return deferred.promise();
	}
} );

return InputHandler;

} );
