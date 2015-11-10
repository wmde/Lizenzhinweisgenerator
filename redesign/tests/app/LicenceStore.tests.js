'use strict';

QUnit.module( 'Licence Detection' );

var LicenceStore = require( '../../js/app/LicenceStore' ),
	licences = new LicenceStore( require( '../../js/app/LICENCES' ) );

QUnit.test( 'detects Public Domain', function( assert ) {
	assert.equal( licences.detectLicence( 'PD-self' ).getName(), 'Public Domain' );
} );

QUnit.test( 'detects CC BY 1.0', function( assert ) {
	assert.equal( licences.detectLicence( 'Cc-by-1.0' ).getName(), 'CC BY 1.0' );
} );
