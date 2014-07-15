/**
 * @licence GNU GPL v3
 * @author snater.com < wikimedia@snater.com >
 */
define( ['jquery'], function( $ ) {
'use strict';

/**
 * Generator for attribution texts.
 * @constructor
 *
 * @option {string|null} editor
 *         Editor of the asset.
 *         Default: null
 *
 * @option {string} format
 *         May either be "text" or "html".
 *         Default: 'text'
 *
 * @option {boolean} licenceOnly
 *         Whether to only display the licence without author, title and other attributions.
 *         Default: false
 *
 * @option {boolean} licenceLink
 *         Whether to show the link / link the licence to the licence's legal code. Instead of a
 *         link, the plain licence name will be shown in any case.
 *         Default: true
 *
 * @param {Asset} asset
 * @param {Object} [options]
 */
var AttributionGenerator = function( asset, options ) {
	this._asset = asset;

	this._options = $.extend( {
		editor: null,
		format: 'text',
		licenceOnly: false,
		licenceLink: true
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
	 * @return {Asset}
	 */
	getAsset: function() {
		return this._asset;
	},

	/**
	 * @return {Object}
	 */
	getOptions: function() {
		return this._options;
	},

	/**
	 * Checks whether another AttributionGenerator instance equals this one.
	 *
	 * @param {AttributionGenerator} attributionGenerator
	 * @return {boolean}
	 */
	equals: function( attributionGenerator ) {
		if( !( attributionGenerator instanceof AttributionGenerator ) ) {
			return false;
		}

		if( !attributionGenerator.getAsset().equals( this._asset ) ) {
			return false;
		}

		var otherOptions = attributionGenerator.getOptions(),
			mismatch = false;

		$.each( this._options, function( k, v ) {
			if( otherOptions[k] !== v ) {
				mismatch = true;
				return false;
			}
		} );

		return !mismatch;
	},

	/**
	 * Generates an attribution tag line from the current set of answers. Returns "null" if the
	 * asset's licence does not require a tag line.
	 *
	 * @param {boolean} [raw] If "true", no styles and no DOM structure at all is applied to the
	 *        licence text.
	 * @return {jQuery|null}
	 */
	generate: function( raw ) {
		var licenceId = this._asset.getLicence().getId();

		if( licenceId === 'PD' || licenceId === 'cc-zero' ) {
			return null;
		}

		var format = raw ? 'text' : this._options.format,
			$attribution = $( '<div/>' ).addClass( 'attribution' ),
			$licence = this._generateLicence( format, this._options.licenceLink );

		if( !this._options.licenceOnly ) {
			var $author = this._generateAuthor( format ),
				$title = this._generateTitle( format ),
				$editor = this._generateEditor();

			$attribution
			.append( $author );

			if( format === 'text' && this._asset.getUrl() ) {
				$attribution
				.append( document.createTextNode( ' ' ) )
				.append( $( '<span/>' ).addClass( 'attribution-url' )
					.append( document.createTextNode( '(' ) )
					.append( document.createTextNode( this._asset.getUrl() ) )
					.append( document.createTextNode( ')' ) )
				);
			}

			$attribution
			.append( document.createTextNode( ', ' ) )
			.append( $title );

			if( this._options.editor ) {
				$attribution
				.append( document.createTextNode( ', ' ) )
				.append( $editor );
			}

			$attribution.append( document.createTextNode( ', ' ) );
		}

		$attribution.append( $licence );

		return raw ? $attribution.text() : $attribution;
	},

	/**
	 * Generates the author(s) DOM to be used in the tag line.
	 *
	 * @param {string} format
	 * @return {jQuery}
	 */
	_generateAuthor: function( format ) {
		// Prefer attribution over author:
		var $attribution = this._asset.getAttribution();
		if( $attribution ) {
			return format === 'html' ? $attribution : $attribution.text();
		}

		var authors = this._asset.getAuthors(),
			$authors = $( '<span/>' ).addClass( 'attribution-author' );

		for( var i = 0; i < authors.length; i++ ) {
			var author = authors[i];

			if( i > 0 ) {
				$authors.append( document.createTextNode( ', ' ) );
			}

			$authors.append( format === 'html' ? author.getHtml() : author.getText() );
		}

		return $authors;
	},

	/**
	 * Generates the licence DOM to be used in the tag line.
	 *
	 * @param {string} format
	 * @param {boolean} licenceLink
	 * @return {jQuery}
	 */
	_generateLicence: function( format, licenceLink ) {
		var licence = this._asset.getLicence(),
			$licence = $( '<span/>' ).addClass( 'attribution-licence' );

		if( !licenceLink ) {
			return $licence.text( licence.getName() );
		}

		if( format === 'html' ) {
			$licence.append(
				$( '<a/>' ).attr( 'href', licence.getUrl() ).text( licence.getName() )
			);
		} else {
			$licence.text( licence.getUrl() );
		}

		return $licence;
	},

	/**
	 * Generates the asset title DOM to be used in the tag line.
	 *
	 * @return {jQuery}
	 */
	_generateTitle: function( format ) {
		var title = '„' + this._asset.getTitle() + '“',
		$title = $( '<span/>' ).addClass( 'attribution-title' );

		if( format === 'html' ) {
			$title.append( $( '<a/>' ).attr( 'href', this._asset.getUrl() ).text( title ) );
		} else {
			$title.text( title );
		}

		return $title;
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
			$editor = $( '<span/>' ).addClass( 'attribution-editor' ).text( editor );
		}

		return $editor;
	}

} );

return AttributionGenerator;

} );
