this.app = this.app || {};

app.Licence = ( function( $ ) {
'use strict';

/**
 * Represents a licence.
 *
 * @param {string|RegExp} name The licence name. May be a regular expression to generate an
 *        "abstract" licence object that may itself be used to generate a proper licence using
 *        Licence.newFromAbstract().
 * @param {string|Object} [url] The url to the licence.
 * @param {Object} [options] Default options overwrites:
 *        - {string} outputTemplate: Text template specifying the actual text output of the licence
 *          information. {{name}} is replaced with the licence name.
 * @constructor
 */
var Licence = function( name, url, options ) {

	if( $.isPlainObject( url ) ) {
		options = url;
		url = undefined;
	}

	if( name instanceof RegExp ) {
		this._regExp = name;
	} else if( typeof name === 'string' ) {
		this._name = name;
		this._regExp = new RegExp( '/^' + name + '\b/i' );
	} else {
		throw new Error( 'Name needs to be specified' );
	}

	this._url = url || null;

	$.extend( this._options, ( options || {} ) );
};

$.extend( Licence.prototype, {
	/**
	 * @type {Object}
	 */
	_options: {
		'outputTemplate': 'released under {{name}}'
	},

	/**
	 * @type {string|null}
	 */
	_name: null,

	/**
	 * @type {RegExp}
	 */
	_regExp: null,

	/**
	 * @type {string}
	 */
	_url: null,

	/**
	 * @return {boolean}
	 */
	isAbstract: function() {
		return !this._name;
	},

	/**
	 * Checks whether a string matches the licence definition.
	 *
	 * @param {string} string
	 * @return {boolean}
	 */
	match: function( string ) {
		return this._regExp.test( string );
	},

	/**
	 * @return {string|null}
	 */
	getName: function() {
		return this._name;
	},

	/**
	 * @return {RegExp}
	 */
	getRegExp: function() {
		return this._regExp;
	},

	/**
	 * @return {string}
	 */
	getUrl: function() {
		return this._url;
	},

	/**
	 * Generates the plain text licence information.
	 *
	 * @return {string}
	 */
	getText: function() {
		if( this.isAbstract() ) {
			throw new Error( 'Cannot generate output text of an abstract licence' );
		}

		return this._options.outputTemplate.replace( /{{name}}/, this._name );
	},

	/**
	 * Generates the HTML licence information.
	 *
	 * @return {string}
	 */
	getHtml: function() {
		if( this.isAbstract() ) {
			throw new Error( 'Cannot generate output html of an abstract licence' );
		}

		return !this._url
			? this.getText()
			: this._options.outputTemplate.replace( /{{name}}/,
				$( '<div/>' ).append(
					$( '<a/>' ).attr( 'href', this._url ).text( this._name )
				).html()
			);
	}

} );

/**
 * Instantiates a Licence object from an abstract Licence using a specified text string.
 *
 * @param {app.Licence} abstractLicence
 * @param {string} rawText
 * @return {app.Licence}
 */
Licence.newFromAbstract = function( abstractLicence, rawText ) {
	var url = rawText.replace( abstractLicence.getRegExp(), abstractLicence.getUrl() );
	return new Licence( rawText, url );
};

return Licence;

}( jQuery ) );
