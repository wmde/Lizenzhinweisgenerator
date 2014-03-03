define( ['jquery', 'app/ApplicationError', 'dojo/i18n!./nls/AjaxError'],
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
var AjaxError = function( code, ajaxOptions ) {
	ApplicationError.call( this, code );

	if( !ajaxOptions ) {
		throw new Error( ajaxOptions );
	}

	this._ajaxOptions = ajaxOptions;
};

$.extend( AjaxError.prototype, ApplicationError.prototype, {
	constructor: AjaxError,

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

return AjaxError;

} );
