/**
 * @licence GNU GPL v3
 * @author snater.com < wikimedia@snater.com >
 */
define(
	['jquery', 'app/Author', 'app/WikiAsset', 'dojo/_base/config'],
	function( $, Author, WikiAsset, config ) {
'use strict';

/**
 * Represents a Commons asset page.
 * @constructor
 *
 * @param {string} prefixedFilename
 * @param {string} mediaType
 * @param {jQuery} $dom
 * @param {string[]} templates
 * @param {Api} api
 * @param {string} [wikiUrl]
 *
 * @throws {Error} if a required parameter is not specified.
 */
var WikiAssetPage = function(
	prefixedFilename,
	mediaType,
	$dom,
	templates,
	api,
	wikiUrl
) {
	if( !prefixedFilename || !mediaType || !$dom || !templates || !api ) {
		throw new Error( 'Unable to instantiate object' );
	}
	this._prefixedFilename = prefixedFilename;
	this._mediaType = mediaType;
	this._$dom = $dom;
	this._templates = templates;
	this._api = api;
	this._wikiUrl = wikiUrl || api.getDefaultUrl();
};

$.extend( WikiAssetPage.prototype, {
	/**
	 * The page's filename.
	 * @type {string}
	 */
	_prefixedFilename: null,

	/**
	 * The asset's media type.
	 * @type {string}
	 */
	_mediaType: null,

	/**
	 * @type {string}
	 */
	_wikiUrl: null,

	/**
	 * The page content DOM.
	 * @type {jQuery}
	 */
	_$dom: null,

	/**
	 * The page's templates.
	 * @type {string[]}
	 */
	_templates: null,

	/**
	 * @type {Api}
	 */
	_api: null,

	/**
	 * @type {WikiAsset}
	 */
	_asset: null,

	/**
	 * Returns the asset represented by the page.
	 *
	 * @return {WikiAsset}
	 */
	getAsset: function() {
		if( !this._asset ) {
			this._asset = new WikiAsset(
				this._prefixedFilename,
				this._mediaType,
				config.custom.licenceStore.detectLicence( this._templates ),
				this._prefixedFilename
					.replace( /^[^:]+:/ , '' )
					.replace( /\.[^.]+$/ , '' )
					.replace( /_/g, ' '),
				this._scrapeAuthors(),
				null,
				this._scrapeAttribution(),
				this._api,
				this._wikiUrl
			);
		}
		return this._asset;
	},

	/**
	 * Extracts the author(s) from the DOM.
	 *
	 * @return {Author[]}
	 */
	_scrapeAuthors: function() {
		var $td = this._$dom.find( '#fileinfotpl_aut' ).next(),
			authors = [];

		if( $td.length === 0 ) {
			return authors;
		}

		var $author = this._sanitizeUrls( $td.contents() );

		// Remove useless wrapping nodes:
		if( $author.length === 1 ) {
			var nodeName = $author.get( 0 ).nodeName;

			if( nodeName !== 'A' && nodeName !== '#text' ) {
				$author = $author.contents();
			}
		}

		// Remove "talk" link:
		$author.each( function( i ) {
			var $node = $( this );
			if( this.nodeName === 'A' && $node.text() === 'talk' ) {
				$author = $author
					.not( $author.eq( i + 1 ) )
					.not( $node )
					.not( $author.eq( i - 1 ) );
			}
		} );

		$author = this._trimNodeList( $author );

		return [new Author( $author )];
	},

	/**
	 * Sanitizes every link node with the specified jQuery wrapped nodes.
	 *
	 * @param {jQuery} $nodes
	 * @return {jQuery}
	 */
	_sanitizeUrls: function( $nodes ) {
		var $clonedNodes = $nodes.clone(),
			$container = $( '<div/>' ).append( $clonedNodes );

		$container.find( 'a' ).each( function() {
			var $node = $( this ),
				href = $node.attr( 'href' );

			if( href.indexOf( '/w/index.php?title=User:' ) === 0 ) {
				href = href.replace(
					/^\/w\/index\.php\?title\=([^&]+).*$/,
					'http://commons.wikimedia.org/wiki/$1'
				);
			} else if( href.indexOf( '/wiki/User:' ) === 0 ) {
				href = 'http://commons.wikimedia.org' + href;
			} else if( href.indexOf( '//' ) === 0 ) {
				href = 'http:' + href;
			}

			$node.attr( 'href', href );
			$node.removeAttr( 'class' );
			$node.removeAttr( 'title' );
		} );

		return $container.contents();
	},

	/**
	 * Removes edge nodes if they contain white space.
	 *
	 * @param {jQuery} $nodes
	 * @return {jQuery}
	 */
	_trimNodeList: function( $nodes ) {
		if( $.trim( $nodes.eq( 0 ).text() ) === '' ) {
			$nodes = $nodes.not( $nodes.eq( 0 ) );
		}

		if( $.trim( $nodes.eq( $nodes.length - 1 ).text() ) === '' ) {
			$nodes = $nodes.not( $nodes.eq( $nodes.length - 1 ) );
		}

		return $nodes;
	},

	/**
	 * Extracts the attribution notice from the DOM.
	 *
	 * @return {jQuery|null}
	 */
	_scrapeAttribution: function() {
		var $attribution = this._$dom.find( '.licensetpl_attr' ).first();

		if( $attribution.length === 0 ) {
			return null;
		}

		var $clonedAttribution = $attribution.contents().clone();

		return this._trimNodeList( this._sanitizeUrls( $clonedAttribution ) );
	}

} );

return WikiAssetPage;

} );
