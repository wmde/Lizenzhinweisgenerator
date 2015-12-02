'use strict';

QUnit.module( 'Licence Detection' );

var $ = require( 'jquery' ),
	LicenceStore = require( '../../js/app/LicenceStore' ),
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

QUnit.test( 'detects CC BY SA 1.0', function( assert ) {
	assert.equal( licences.detectLicence( 'Cc-by-sa-1.0' ).getName(), 'CC BY-SA 1.0' );
} );

QUnit.test( 'detects ported CC BY-SA 1.0', function( assert ) {
	assert.equal( licences.detectLicence( 'Cc-by-sa-1.0-nl' ).getId(), 'cc-by-sa-1.0-ported' );
} );

QUnit.test( 'detects ported CC BY 1.0', function( assert ) {
	assert.equal( licences.detectLicence( 'Cc-by-1.0-nl' ).getId(), 'cc-by-1.0-ported' );
} );

QUnit.test( 'detects ported CC BY 2.0', function( assert ) {
	assert.equal( licences.detectLicence( 'Cc-by-2.0-at' ).getId(), 'cc-by-2.0-ported' );
} );

QUnit.test( 'detects ported CC BY 2.5', function( assert ) {
	assert.equal( licences.detectLicence( 'Cc-by-2.5-au' ).getId(), 'cc-by-2.5-ported' );
} );

QUnit.test( 'detects ported CC BY 3.0', function( assert ) {
	assert.equal( licences.detectLicence( 'Cc-by-3.0-hk' ).getId(), 'cc-by-3.0-ported' );
} );

QUnit.test( 'detects ported CC BY-SA 2.0', function( assert ) {
	assert.equal( licences.detectLicence( 'Cc-by-sa-2.0-uk' ).getId(), 'cc-by-sa-2.0-ported' );
} );

QUnit.test( 'detects ported CC BY-SA 2.5', function( assert ) {
	assert.equal( licences.detectLicence( 'Cc-by-sa-2.5-it' ).getId(), 'cc-by-sa-2.5-ported' );
} );

QUnit.test( 'detects ported CC BY-SA 3.0', function( assert ) {
	assert.equal( licences.detectLicence( 'Cc-by-sa-3.0-tw' ).getId(), 'cc-by-sa-3.0-ported' );
} );

QUnit.test( 'no compatible licences for cc by-sa 4.0', function( assert ) {
	assert.equal( licences.findCompatibilities( 'cc-by-sa-4.0' ).length, 0 );
} );

QUnit.test( 'compatible licences', function( assert ) {
	var compatibleLicences = {
		'cc-by-sa-3.0': [ 'cc-by-sa-3.0-de', 'cc-by-sa-4.0' ],
		'cc-by-sa-3.0-de': [ 'cc-by-sa-3.0', 'cc-by-sa-4.0' ],
		'cc-by-sa-2.5': [ 'cc-by-sa-3.0-de', 'cc-by-sa-3.0', 'cc-by-sa-4.0' ],
		'cc-by-sa-2.0': [ 'cc-by-sa-2.0-de', 'cc-by-sa-2.5', 'cc-by-sa-3.0-de', 'cc-by-sa-3.0', 'cc-by-sa-4.0' ],
		'cc-by-sa-2.0-de': [ 'cc-by-sa-2.0', 'cc-by-sa-2.5', 'cc-by-sa-3.0-de', 'cc-by-sa-3.0', 'cc-by-sa-4.0' ],
		'cc-by-sa-1.0': [ 'cc-by-sa-2.0', 'cc-by-sa-2.0-de', 'cc-by-sa-2.5', 'cc-by-sa-3.0-de', 'cc-by-sa-3.0', 'cc-by-sa-4.0' ],
		'cc-by-4.0': [ 'cc-by-sa-4.0' ],
		'cc-by-3.0': [ 'cc-by-3.0-de', 'cc-by-4.0', 'cc-by-sa-3.0-de', 'cc-by-sa-3.0' ],
		'cc-by-3.0-de': [ 'cc-by-3.0', 'cc-by-sa-3.0-de', 'cc-by-sa-3.0' ],
		'cc-by-2.5': [ 'cc-by-3.0-de', 'cc-by-3.0', 'cc-by-4.0', 'cc-by-sa-2.5', 'cc-by-sa-3.0-de', 'cc-by-sa-3.0', 'cc-by-sa-4.0' ],
		'cc-by-2.0': [ 'cc-by-2.0-de', 'cc-by-2.5', 'cc-by-3.0-de', 'cc-by-3.0', 'cc-by-4.0', 'cc-by-sa-2.0-de', 'cc-by-sa-2.0' ],
		'cc-by-2.0-de': [ 'cc-by-2.0', 'cc-by-2.5', 'cc-by-3.0-de', 'cc-by-3.0', 'cc-by-4.0', 'cc-by-sa-2.0-de', 'cc-by-sa-2.0' ],
		'cc-by-1.0': [ 'cc-by-2.0-de', 'cc-by-2.0', 'cc-by-2.5', 'cc-by-3.0-de', 'cc-by-3.0', 'cc-by-4.0', 'cc-by-sa-1.0' ]
	};

	$.each( compatibleLicences, function( input, compatibles ) {
		var actual = licences.findCompatibilities( input );
		assert.equal( actual.length, compatibles.length );

		$.each( actual, function( _, licence ) {
			assert.ok( compatibles.indexOf( licence.getId() ) !== -1 );
		} );
	} );
} );
