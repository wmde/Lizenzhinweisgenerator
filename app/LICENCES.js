app.LICENCES = ( function( app ) {
'use strict';

var Licence = app.Licence;

return [
	new Licence( /^(PD|Public domain)\b/i, {
		'outputTemplate': 'in the public domain'
	} ),
	new Licence( 'CECILL', 'http://www.cecill.info/licences/Licence_CeCILL_V2-en.html' ),
	new Licence( 'FAL', 'http://artlibre.org/licence/lal/en' ),
	new Licence( 'GPL', 'http://www.gnu.org/copyleft/gpl-3.0.html' ),
	new Licence( 'LGPL', 'http://www.gnu.org/licenses/lgpl.html' ),
	new Licence( 'AGPL', 'http://www.gnu.org/licenses/agpl.html' ),
	new Licence( 'GFDL', 'http://commons.wikimedia.org/wiki/Commons:GNU_Free_Documentation_License_1.2' ),
	new Licence( 'OS OPENDATA', 'http://www.ordnancesurvey.co.uk/oswebsite/opendata/licence/docs/licence.pdf', {
		'outputTemplate': 'licenced under {{name}}'
	} ),
	new Licence( /^CC-([A-Z-]+)-([0-9.]+)([A-Z-]*(,.+)*){1}/i, 'http://creativecommons.org/licenses/$1/$2/$3' ),
	new Licence( /^CC-([A-Z-]+)-([0-9.]+)/i, 'http://creativecommons.org/licenses/$1/$2' ),
	new Licence( 'CC-PD-Mark', 'http://creativecommons.org/publicdomain/mark/1.0/' ),
	new Licence( 'CC-Zero', 'http://creativecommons.org/publicdomain/zero/1.0/' )
];

}( app ) );
