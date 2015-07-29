/**
 * @licence GNU GPL v3
 * @author snater.com < wikimedia@snater.com >
 */
define( ['dojo/_base/config'], function( config ) {
	'use strict';

	/**
	 * Languages/locales that have full template support. (It is assumed that there is no point in
	 * having partial template support.) If a locale is not supported the default templates in the
	 * "templates" root directory will be used.
	 * @type {Object}
	 */
	var supportedLanguages = {
		'de': true
	};

	/**
	 * Returns the template directory for a specific locale. If the locale is not supported, the
	 * default templates will be returned.
	 *
	 * @param {string} subDir
	 * @return {string}
	 */
	return {
		getDir: function( subDir ) {
			var dir = config.baseUrl + 'templates/' + subDir + '/';

			if( supportedLanguages[config.locale] ) {
				return dir + config.locale + '/';
			}

			if( config.locale.indexOf( '-' ) !== -1 ) {
				var languageCode = config.locale.split( '-' )[0];
				if( supportedLanguages[languageCode] ) {
					return dir + languageCode + '/';
				}
			}

			return dir;
		}
	};

} );
