'use strict';

QUnit.module( 'AttributionDialogue' );

var AttributionDialogue = require( '../../js/app/AttributionDialogue' );

QUnit.test( 'should have 4 steps by default', function( assert ) {
	assert.equal( 4, new AttributionDialogue()._dialogue._steps.length );
} );
