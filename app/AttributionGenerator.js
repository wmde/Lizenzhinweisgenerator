( function( define ) {
'use strict';

define( ['jquery'], function( $ ) {

/**
 * Generator for attribution texts.
 * @constructor
 *
 * @option {string|null} editor
 *         Editor of the asset.
 *         Default: null
 *
 * @option {boolean} licenceOnly
 *         Whether to only display the licence without author, title and other attributions.
 *         Default: false
 *
 * @option {boolean} licenceLink
 *         Whether to show the link / link the licence to the licence's legal code.
 *         Default: true
 *
 * @option {string} useCase
 *         May either be "print" or "html".
 *         Default: 'print'
 *
 * @param {Asset} asset
 * @param {Object} [options]
 */
var AttributionGenerator = function( asset, options ) {
	this._asset = asset;

	this._options = $.extend( {
		editor: null,
		licenceOnly: false,
		licenceLink: true,
		useCase: 'print'
	}, options );
};

$.extend( AttributionGenerator.prototype, {
	/**
	 * @type {Asset}
	 */
	_asset: null,

	/**
	 * @type {Object}
	 */
	_options: null,

	/**
	 * Generates an attribution tag line from the current set of answers.
	 *
	 * @param {string} [mode] May be "raw" to not apply any styles or DOM structure at all or
	 *        "inline" to apply inline styles instead of using css classes. If the parameter is
	 *        omitted, css classes will be applied to style the output.
	 * @return {jQuery}
	 */
	generate: function( mode ) {
		mode = mode || 'default';

		var useCase = mode === 'raw' ? 'text' : this._options.useCase,
			$attribution = $( '<div/>' ).addClass( 'attribution' ),
			$licence = this._generateLicence( useCase );

		if( !this._options.licenceOnly ) {
			var $author = this._generateAuthor( useCase ),
				$title = this._generateTitle(),
				$editor = this._generateEditor();

			$attribution
			.append( $author )
			.append( document.createTextNode( ', ' ) )
			.append( $title );

			if( this._options.editor ) {
				$attribution
				.append( document.createTextNode( ' ' ) )
				.append( $editor );
			}

			$attribution.append( document.createTextNode( ', ' ) );
		}

		if( this._options.licenceLink === false ) {
			$attribution.append( document.createTextNode ( this._asset.getLicence() ) ) ;
		} else {
			$attribution.append( $licence );
		}

		return mode === 'raw' ? $attribution.text() : $attribution;
	},

	/**
	 * Generates the author(s) DOM to be used in the tag line.
	 *
	 * @param {string} useCase
	 * @return {jQuery}
	 */
	_generateAuthor: function( useCase ) {
		var authors = this._asset.getAuthors(),
			$authors = $( '<span/>' ).addClass( 'author' );

		for( var i = 0; i < authors.length; i++ ) {
			var author = authors[i];

			if( i > 0 ) {
				$authors.append( document.createTextNode( ', ' ) );
			}

			if( !author.getUrl() ) {
				$authors.append( document.createTextNode( author.getName() ) );
				continue;
			}

			var authorUrl = author.getUrl();
			if( authorUrl.substr( 0, 2 ) === '//' ) {
				authorUrl = 'http:' + authorUrl;
			}

			if( useCase === 'html' ) {
				$authors.append( $( '<a/>' ).attr( 'href', authorUrl ).text( author.getName() ) );
			} else {
				$authors
					.append( document.createTextNode( author.getName() ) )
					.append( document.createTextNode( ' (' + authorUrl + ')' ) );
			}
		}

		return $authors;
	},

	/**
	 * Generates the licence DOM to be used in the tag line.
	 *
	 * @param {string} useCase
	 * @return {jQuery}
	 */
	_generateLicence: function( useCase ) {
		var licence = this._asset.getLicence();

		return ( useCase === 'html' )
			? $( '<a/>' ).addClass( 'licence' )
				.attr( 'href', licence.getUrl() ).text( licence.getName() )
			: $( '<span/>' ).addClass( 'licence' ).text( licence.getUrl() );
	},

	/**
	 * Generates the asset title DOM to be used in the tag line.
	 *
	 * @return {jQuery}
	 */
	_generateTitle: function() {
		return $( '<span/>' ).addClass( 'title' ).text( '„' + this._asset.getTitle() + '“' );
	},

	/**
	 * Generates the editor DOM to be use in the tag line. If no editor is specified, an empty
	 * jQuery object will be returned.
	 *
	 * @return {jQuery}
	 */
	_generateEditor: function() {
		var editor = this._options.editor,
			$editor = $();

		if( editor ) {
			$editor = $( '<span/>' ).addClass( 'editor' ).text( editor );
		}

		return $editor;
	}

} );

return AttributionGenerator;

} );

}( define ) );
