define( [ 'jquery', 'dojo/i18n!./nls/ApplicationError' ], function( $, messages ) {
'use strict';

/**
 * Application Error
 * @constructor
 *
 * @param {string} code
 *
 * @throws {Error} if a required parameter is not defined.
 */
var ApplicationError = function( code ) {
	if( !code ) {
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
		return messages[this._code];
	}

} );

return ApplicationError;

} );
