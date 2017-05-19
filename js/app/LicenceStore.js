/**
 * @licence GNU GPL v3
 * @author snater.com < wikimedia@snater.com >
 */

'use strict';

var $ = require( 'jquery' ),
	Licence = require( './Licence' );

/**
 * Licence store storing a list of licences.
 * @constructor
 *
 * @param {Licence[]} licences
 * @param {Object} portedLicences - map of lowercase licence names to URLs
 */
var LicenceStore = function( licences, portedLicences ) {
	this._licences = [];
	this._portedLicences = portedLicences;

	licences = licences || [];

	for( var i = 0; i < licences.length; i++ ) {
		this.appendLicence( licences[ i ] );
	}
};

$.extend( LicenceStore.prototype, {
	/**
	 * @type {Licence[]}
	 */
	_licences: null,

	/**
	 * @type {Object}
	 */
	_portedLicences: null,

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
			if( this._licences[ i ].getId() === id ) {
				return this._licences[ i ];
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
			strings = [ strings ];
		}

		var detectedLicences = [],
			i,
			j;

		for( i = 0; i < strings.length; i++ ) {
			var string = strings[ i ];

			for( j = 0; j < this._licences.length; j++ ) {
				var licence = this._licences[ j ];

				if( licence.match( string ) ) {
					if( licence.isAbstract() ) {
						licence = Licence.newFromAbstract( licence, string );
					} else if( this._isKnownPortedLicence( licence, string ) ) {
						licence = this._buildKnownPortedLicence( licence, string );
					}
					detectedLicences.push( licence );
				}
			}
		}

		if( detectedLicences.length === 0 ) {
			return null;
		} else if( detectedLicences.length === 1 ) {
			return detectedLicences[ 0 ];
		}

		// Return the first licence according to the order the licences are stored:
		for( i = 0; i < this._licences.length; i++ ) {
			for( j = 0; j < detectedLicences.length; j++ ) {
				if( this._licences[ i ].getId() === detectedLicences[ j ].getId() ) {
					return detectedLicences[ j ];
				}
			}
		}

		return null;
	},

	/**
	 * @param {Licence} licence
	 * @param {string} licenceString
	 */
	_isKnownPortedLicence: function( licence, licenceString ) {
		return licence.isInGroup( 'ported' ) && this._getUrlFromPortedLicenceName( licenceString );
	},

	/**
	 * @param {Licence} licence
	 * @param {string} licenceString
	 */
	_buildKnownPortedLicence: function( licence, licenceString ) {
		var name = licenceString
			.toUpperCase()
			.split( '-' )
			.join( ' ' )
			.replace( 'BY SA', 'BY-SA' );

		return new Licence(
			licence.getId(), // keep the generic ID so that it is detected as a valid licence in LicenceStore
			licence.getGroups().concat( [ 'knownPorted' ] ),
			[],
			name,
			null,
			this._getUrlFromPortedLicenceName( licenceString )
		);
	},

	/**
	 * @param {string} licenceString
	 */
	_getUrlFromPortedLicenceName: function( licenceString ) {
		return this._portedLicences[ licenceString.toLowerCase() ];
	},

	/**
	 * Finds a list of compatible licences for a given licence ID
	 * @param licence
	 * @return {Licence[]}
	 */
	findCompatibilities: function( licence ) {
		var self = this;

		return this.getLicence( licence ).getCompatibleLicenceIds().map( function( id ) {
			return self.getLicence( id );
		} );
	}
} );

module.exports = LicenceStore;
