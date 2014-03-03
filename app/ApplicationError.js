/**
 * @licence GNU GPL v3
 * @author snater.com < wikimedia@snater.com >
 */
define( ['jquery', 'dojo/i18n!./nls/ApplicationError'], function( $, messages ) {
'use strict';

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
		return messages[this._code] || messages['*'];
	}

} );

return ApplicationError;

} );
