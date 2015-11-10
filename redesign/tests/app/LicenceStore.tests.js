'use strict';

QUnit.module( 'Licence Detection' );

var LicenceStore = require( '../../js/app/LicenceStore' ),
	licences = new LicenceStore( require( '../../js/app/LICENCES' ) );

QUnit.test( 'detects Public Domain', function( assert ) {
	assert.equal( licences.detectLicence( 'PD-self' ).getName(), 'Public Domain' );
} );
