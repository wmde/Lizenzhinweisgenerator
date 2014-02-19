( function( define ) {
'use strict';

define(
	['jquery', 'Asset', 'LICENCES', 'Licence', 'Author'],
	function( $, Asset, LICENCES, Licence, Author ) {

function capitalize( string ) {
	return string.substring( 0, 1 ).toUpperCase() + string.substring( 1 );
}

/**
 * Represents a Commons asset page.
 * @constructor
 *
 * @param {string} filename
 * @param {jQuery} $dom
 * @param {string[]} categories
 * @param {Api} api
 *
 * @throws {Error} if a required parameter is not specified.
 */
var AssetPage = function( filename, $dom, categories, api ) {
	if( !filename || !$dom || !categories || !api ) {
		throw new Error( 'Unable to instantiate object' );
	}
	this._filename = filename;
	this._$dom = $dom;
	this._categories = categories;
	this._api = api;
};

$.extend( AssetPage.prototype, {
	/**
	 * The page's filename.
	 * @type {string}
	 */
	_filename: null,

	/**
	 * The page content DOM.
	 * @type {jQuery}
	 */
	_$dom: null,

	/**
	 * The page's categories.
	 * @type {string[]}
	 */
	_categories: null,

	/**
	 * @type {Api}
	 */
	_api: null,

	/**
	 * @type {Asset}
	 */
	_asset: null,

	/**
	 * Returns the asset represented by the page.
	 *
	 * @return {Asset}
	 */
	getAsset: function() {
		if( !this._asset ) {
			this._asset = new Asset(
				this._filename,
				this._scrapeTitle() || this._filename.replace ( /\.[^.]+$/ , '' ),
				this._detectLicence(),
				this._api,
				{
					descriptions: this._scrapeDescriptions(),
					authors: this._scrapeAuthors(),
					source: this._scrapeSource(),
					attribution: this._scrapeAttribution()
				}
			);
		}
		return this._asset;
	},

	/**
	 * Detects a licence by analyzing the page's categories and returns it. Returns "null" if no
	 * licence is detected.
	 *
	 * @return {Licence|null}
	 */
	_detectLicence: function() {
		for( var i = 0; i < this._categories.length; i++ ) {
			var category = this._categories[i];

			for( var j = 0; j < LICENCES.length; j++ ) {
				var licence = LICENCES[j];

				if( licence.match( category ) ) {
					if( licence.isAbstract() ) {
						licence = Licence.newFromAbstract( licence, category );
					}
					return licence;
				}
			}
		}

		return null;
	},

	/**
	 * Extracts the title from the DOM.
	 *
	 * @return {string}
	 */
	_scrapeTitle: function() {
		var $td = this._$dom.find( '#fileinfotpl_art_title' );

		if( $td.length === 0 ) {
			$td = this._$dom.find( '#fileinfotpl_title' );
		}

		return this._getNextText( $td );
	},

	/**
	 * Extracts the descriptions from the DOM.
	 *
	 * @return {Object} Descriptions in different languages indexed by language code. The key "*"
	 *         contains the default description text.
	 */
	_scrapeDescriptions: function() {
		var $td = this._$dom.find( '#fileinfotpl_desc' ).next();

		var descriptions = {
			'*': $td.text()
		};

		$td.find( 'div.description' ).each( function( i, node ) {
			// Do not alter the source DOM:
			var $clonedNode = $( node ).clone(),
				lang = $clonedNode.attr( 'lang' );

			$clonedNode.find( 'span.language' ).remove();
			$clonedNode.find( 'span.langlabel-' + lang ).remove();

			descriptions[lang] = $clonedNode.html();

			if( i === 0 ) {
				// Update the default description text:
				descriptions['*'] = descriptions[lang];
			}
		} );

		if( descriptions['*'] === '' ) {
			// No description at all yet, gather other attributes:
			var d = [];
			d.push( capitalize(
				this._getNextText( this._$dom.find( '#fileinfotpl_art_medium' ) )
			) );
			d.push( this._getNextText( this._$dom.find( '#fileinfotpl_date' ) ) );
			d.push( this._getNextText( this._$dom.find( '#fileinfotpl_art_dimensions' ) ) );
			descriptions['*'] = d.join( '; ' ).replace( /\s+/g, ' ' );
		}

		return descriptions;
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
	 * Sanitizes every link node with the specified jQuery wrapped nodes.
	 *
	 * @param {jQuery} $nodes
	 * @return {jQuery}
	 */
	_sanitizeUrls: function( $nodes ) {
		var $clonedNodes = $nodes.clone();

		$clonedNodes.each( function() {
			var $node = $( this );

			if( $node.get( 0 ).nodeName === 'A' ) {
				var href = $node.attr( 'href' );
				if( href.indexOf( '/w/index.php?title=User:' ) === 0 ) {
					href = href.replace(
						/^\/w\/index\.php\?title\=([^&]+).*$/,
						'http://commons.wikimedia.org/wiki/$1'
					);
				} else if( href.indexOf( '/wiki/User:' ) === 0 ) {
					href = 'http://commons.wikimedia.org' + href;
				}

				$node.attr( 'href', href );
				$node.removeAttr( 'class' );
				$node.removeAttr( 'title' );
			}
		} );

		return $clonedNodes;
	},

	/**
	 * Extracts the asset's source from the DOM.
	 *
	 * @return {string}
	 */
	_scrapeSource: function() {
		return this._getNextText( this._$dom.find( '#fileinfotpl_src' ) );
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
	},

	/**
	 * Returns the trimmed next node's text.
	 *
	 * @param {jQuery} $node
	 * @return {string}
	 */
	_getNextText: function( $node ) {
		return $.trim( $node.next().text() );
	}

} );

return AssetPage;

} );

}( define ) );
