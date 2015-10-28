'use strict';

QUnit.module( 'AttributionDialogue' );

var AttributionDialogue = require( '../../js/app/AttributionDialogue' );

QUnit.test( 'should have 4 steps by default', function( assert ) {
	assert.equal( 4, new AttributionDialogue()._dialogue._steps.length );
} );

QUnit.test( 'should have only 3 steps if the author is known', function( assert ) {
	assert.equal( 3, new AttributionDialogue( 'Foo' )._dialogue._steps.length );
} );
