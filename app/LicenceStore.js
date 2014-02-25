( function( define ) {
'use strict';

define( ['app/Licence'], function( Licence ) {

/**
 * Licence store storing an ordered list of licences.
 * @constructor
 *
 * @param {Licence} licences
 */
var LicenceStore = function( licences ) {
	this._licences = [];

	licences = licences || [];

	for( var i = 0; i < licences.length; i++ ) {
		this.appendLicence( licences[i] );
	}
};

$.extend( LicenceStore.prototype, {
	/**
	 * @type {Licence[]}
	 */
	_licences: null,

	/**
	 * Returns all stored licences.
	 *
	 * @return {Licence[]}
	 */
	getLicences: function() {
		return this._licences;
	},

	/**
	 * Appends a licence to the store.
	 *
	 * @param {Licence} licence
	 *
	 * @throws {Error} if parameter is not a proper Licence object.
	 */
	appendLicence: function( licence ) {
		if( !( licence instanceof Licence ) ) {
			throw new Error( 'Licence is not a proper Licence object' );
		}
		this._licences.push( licence );
	},

	/**
	 * Returns a licence by id.
	 *
	 * @param {string} id
	 * @return {Licence|null}
	 */
	getLicence: function( id ) {
		for( var i = 0; i < this._licences.length; i++ ) {
			if( this._licences[i].getId() === id ) {
				return this._licences[i];
			}
		}
		return null;
	},

	/**
	 * Returns a licence by trying to match on one string or on one string our of a list of strings.
	 *
	 * @param {string|string[]} strings
	 * @return {Licence|null}
	 */
	detectLicence: function( strings ) {
		if( typeof strings === 'string' ) {
			strings = [strings];
		}

		var detectedLicences = [];

		for( var i = 0; i < strings.length; i++ ) {
			var string = strings[i];

			for( var j = 0; j < this._licences.length; j++ ) {
				var licence = this._licences[j];

				if( licence.match( string ) ) {
					if( licence.isAbstract() ) {
						licence = Licence.newFromAbstract( licence, string );
					}
					detectedLicences.push( licence );
				}
			}
		}

		if( detectedLicences.length === 0 ) {
			return null;
		} else if( detectedLicences.length === 1 ) {
			return detectedLicences[0];
		}

		// Return the first licence according to the order the licences are stored:
		for( i = 0; i < this._licences.length; i++ ) {
			for( j = 0; j < detectedLicences.length; j++ ) {
				if( this._licences[i] === detectedLicences[j] ) {
					return this._licences[i];
				}
			}
		}

	}

} );

return LicenceStore;

} );

}( define ) );
