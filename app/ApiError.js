define( [ 'jquery', 'app/ApplicationError', 'dojo/i18n!./nls/ApiError' ],
	function( $, ApplicationError, messages ) {
'use strict';

/**
 * API Error
 * @constructor
 *
 * @param {string} code
 * @param {Object} ajaxOptions
 *
 * @throws {Error} if a required parameter is not defined.
 */
var ApiError = function( code, ajaxOptions ) {
	ApplicationError.call( this, code );

	if( !ajaxOptions ) {
		throw new Error( ajaxOptions );
	}

	this._ajaxOptions = ajaxOptions;
};

$.extend( ApiError.prototype, ApplicationError.prototype, {
	constructor: ApiError,

	/**
	 * @type {Object}
	 */
	_ajaxOptions: null,

	/**
	 * @see ApplicationError.getMessage
	 */
	getMessage: function() {
		// (Re-implemented to access correct messages.)
		return messages[this._code] || messages['*'];
	}

} );

return ApiError;

} );
