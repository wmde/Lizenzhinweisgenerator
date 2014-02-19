( function( define ) {
'use strict';

define( ['jquery', 'OptionsContainer'], function( $, OptionsContainer ) {

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

		if( attributionGenerator.getAsset().getFilename() !== this._asset.getFilename() ) {
			return false;
		}

		var jsonOptions = JSON.stringify( this._options ),
			otherJsonOptions = JSON.stringify( attributionGenerator.getOptions() );

		return jsonOptions === otherJsonOptions;
	},

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
			.append( $author );

			if( useCase === 'print' ) {
				$attribution
				.append( document.createTextNode( ' (' ) )
				.append( document.createTextNode( this._asset.getUrl() ) )
				.append( document.createTextNode( ')' ) );
			}

			$attribution
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

		if( mode === 'inline' ) {
			return this._convertToInlineStyles( $attribution );
		}

		return mode === 'raw' ? $attribution.text() : $attribution;
	},

	/**
	 * Converts the styles applied via css classes to inline styles.
	 *
	 * @param {jQuery} $attribution
	 * @return {jQuery}
	 */
	_convertToInlineStyles: function( $attribution ) {
		var cssRules = [];

		for( var i = 0; i < document.styleSheets.length; i++ ) {
			$.merge( cssRules, document.styleSheets[i].cssRules );
		}

		$attribution.find( '*' ).each( function() {
			var classAttr = $( this ).attr( 'class' );
			if( !classAttr ) {
				return true;
			}

			var classes = classAttr.split( ' ' ),
				cssText = '';

			for( var i = 0; i < classes.length; i++ ) {
				for( var j = 0; j < cssRules.length; j++ ) {
					var cssRule = cssRules[j],
						selectorText = cssRule.selectorText,
						isAttributionStyle = selectorText.indexOf( '.attribution' ) !== -1,
						hasClass = selectorText.indexOf( '.' + classes[i] ) !== -1;

					if( isAttributionStyle && hasClass ) {
						cssText += cssRule.cssText.replace( /^([^{]+)\{([^}]+)\}$/, '$2' );
					}
				}
			}

			if( cssText !== '' ) {
				this.style.cssText = cssText;
			}

			$( this ).removeAttr( 'class' );
		} );

		return $attribution;
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

			$authors.append( useCase === 'html' ? author.getHtml() : author.getText() );
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
