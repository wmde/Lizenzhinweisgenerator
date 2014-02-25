define( function() {

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
	 * @return {string}
	 */
	return {
		getDir: function( locale ) {
			var dir = 'templates/';

			if( supportedLanguages[locale] ) {
				return dir + locale + '/';
			}

			if( locale.indexOf( '-' ) !== -1 ) {
				var languageCode = locale.split( '-' )[0];
				if( supportedLanguages[languageCode] ) {
					return dir + languageCode + '/';
				}
			}

			return dir;
		}
	}

} );
