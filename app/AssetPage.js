this.app = this.app || {};

app.AssetPage = ( function( $, app ) {
'use strict';

function toCapitalCase( string ) {
	return string.substring( 0, 1 ).toUpperCase() + string.substring( 1 );
}

/**
 * Represents a Commons asset page.
 *
 * @param {string} title
 * @param {jQuery} $dom
 * @constructor
 */
var AssetPage = function( title, $dom ) {
	this._title = title;
	this._$dom = $dom;
};

$.extend( AssetPage.prototype, {
	/**
	 * The page's title.
	 * @type {string}
	 */
	_title: null,

	/**
	 * The page content DOM.
	 * @type {jQuery}
	 */
	_$dom: null,

	/**
	 * @type {Asset}
	 */
	_asset: null,

	/**
	 * Extracts all attributes from the DOM.
	 */
	scrape: function() {
		this._asset = new app.Asset( this._scrapeTitle() || this._title, {
			descriptions: this._scrapeDescriptions(),
			authors: this._scrapeAuthors(),
			source: this._scrapeSource(),
			attribution: this._scrapeAttribution()
		} );
	},

	/**
	 * Returns the asset represented by the page.
	 *
	 * @return {Asset}
	 */
	getAsset: function() {
		if( !this._asset ) {
			this.scrape();
		}
		return this._asset;
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
			d.push( toCapitalCase(
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
	 * @return {app.Author[]}
	 */
	_scrapeAuthors: function() {
		var creator = this._scrapeCreator();

		if( creator ) {
			return [creator];
		}

		var $td = this._$dom.find( '#fileinfotpl_aut' ).next(),
			authors = [];

		$td.find( 'a' ).each( function() {
			var $a = $( this ),
				isUser = ( $a.attr( 'title' ) || '' ).match( /^User:(.+)$/i );

			var url = isUser
				? '//commons.wikimedia.org' + $a.attr( 'href' )
				: $a.attr( 'href' );

			authors.push( new app.Author( $a.text(), url ) );
		} );

		return authors;
	},

	/**
	 * Extracts the creator from the DOM.
	 *
	 * @return {app.Author[]|null}
	 */
	_scrapeCreator: function() {
		var $creator = this._$dom.find( '#creator' );

		if( $creator.length === 0 ) {
			return null;
		}

		var $a = $creator.find( 'a' );

		if( $a.length === 0 ) {
			return [new app.Author( $creator.text() )];
		}

		var href = $a.attr( 'href' ),
			url;

		if ( href.match( /^\/wiki\// ) ) {
			url = '//commons.wikimedia.org' + href;
		} else if( !href.match( /^https{0,1}:/i ) ) {
			url = href;
		}

		return [new app.Author( $a.text(), url )];
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
	 * @return {string}
	 */
	_scrapeAttribution: function() {
		return $.trim( this._$dom.find( '.licensetpl_attr' ).first().html() );
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

}( jQuery, app ) );
