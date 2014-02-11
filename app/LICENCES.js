( function( define ) {
'use strict';

define( ['Licence'], function( Licence ) {

/**
 * Array of licences. The licence will be detected by order: If an asset features multiple licences,
 * only the first one featured in this list will be detected.
 * @type {Licence[]}
 */
return [
	new Licence( 'PD', 'ohne Urheberrechtsschutz', /^(PD|Public domain)\b/i ),
//	new Licence( 'CeCILL', 'CeCILL', 'http://www.cecill.info/licences/Licence_CeCILL_V2-en.html' ),
//	new Licence( 'FAL', 'FAL', 'http://artlibre.org/licence/lal/en' ),
//	new Licence( 'GPL', 'GPL', 'http://www.gnu.org/copyleft/gpl-3.0.html' ),
//	new Licence( 'LPGL', 'LGPL', 'http://www.gnu.org/licenses/lgpl.html' ),
//	new Licence( 'AGPL', 'AGPL', 'http://www.gnu.org/licenses/agpl.html' ),
//	new Licence( 'GDFL', 'GFDL', 'http://commons.wikimedia.org/wiki/Commons:GNU_Free_Documentation_License_1.2' ),

	new Licence( 'cc-zero', 'CC0 1.0', 'http://creativecommons.org/publicdomain/zero/1.0/' ),

	new Licence( 'cc-by-2.0-de', 'CC BY 2.0 DE', 'http://creativecommons.org/licenses/by/2.0/de/' ),
	new Licence( 'cc-by-3.0-de', 'CC BY 3.0 DE', 'http://creativecommons.org/licenses/by/3.0/de/' ),
	new Licence( 'cc-by-3.0', 'CC BY 3.0', 'http://creativecommons.org/licenses/by/3.0/' ),

	new Licence( 'cc-by-sa-2.0-de', 'CC BY-SA 2.0 DE', 'http://creativecommons.org/licenses/by-sa/2.0/de/' ),
	new Licence( 'cc-by-sa-3.0-de', 'CC BY-SA 3.0 DE', 'http://creativecommons.org/licenses/by-sa/3.0/de/'),
	new Licence( 'cc-by-sa-3.0', 'CC BY-SA 3.0', /^CC-BY-SA-3.0(-migrated)*$/i, 'http://creativecommons.org/licenses/by-sa/3.0/' ),

	new Licence( 'CC*', /^CC-([A-Z-]+)-([0-9.]+)[A-Z-]*(,.+)*/i, 'http://creativecommons.org/licenses/' )

//	new Licence( /^CC-([A-Z-]+)-([0-9.]+)([A-Z-]*(,.+)*){1}/i, 'http://creativecommons.org/licenses/$1/$2/$3' ),
//	new Licence( /^CC-([A-Z-]+)-([0-9.]+)/i, 'http://creativecommons.org/licenses/$1/$2' ),
];

} );

}( define ) );
