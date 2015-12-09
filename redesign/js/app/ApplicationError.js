/**
 * @licence GNU GPL v3
 * @author snater.com < wikimedia@snater.com >
 */
'use strict';

var $ = require( 'jquery' ),
	Messages = require( './Messages' );

/**
 * Application Error
 * @constructor
 *
 * @param {string} code
 *
 * @throws {Error} if a required parameter is not defined properly.
 */
var ApplicationError = function( code ) {
	if( !code || typeof code !== 'string' ) {
		throw new Error( 'Required parameters are nor properly defined' );
	}

	this._code = code;
};

$.extend( ApplicationError.prototype, {
	/**
	 * @param {string}
	 */
	_code: null,

	/**
	 * Returns the error's localized message.
	 *
	 * @return {string}
	 */
	getMessage: function() {
		return Messages.t( 'error.' + this._code );
	},

	/**
	 * Returns the error's code.
	 *
	 * @return {string}
	 */
	getCode: function() {
		return this._code;
	}

} );

module.exports = ApplicationError;
