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

QUnit.test( 'detects CC BY 2.0', function( assert ) {
	assert.equal( licences.detectLicence( 'Cc-by-2.0' ).getName(), 'CC BY 2.0' );
} );

QUnit.test( 'detects CC BY 2.5', function( assert ) {
	assert.equal( licences.detectLicence( 'Cc-by-2.5' ).getName(), 'CC BY 2.5' );
} );

QUnit.test( 'detects CC BY SA 2.5', function( assert ) {
	assert.equal( licences.detectLicence( 'Cc-by-sa-2.5' ).getName(), 'CC BY-SA 2.5' );
} );

QUnit.test( 'detects CC BY SA 2.0', function( assert ) {
	assert.equal( licences.detectLicence( 'Cc-by-sa-2.0' ).getName(), 'CC BY-SA 2.0' );
} );

QUnit.test( 'detects ported CC BY 1.0', function( assert ) {
	assert.equal( licences.detectLicence( 'Cc-by-1.0-nl' ).getId(), 'cc-by-1.0-ported' );
} );
