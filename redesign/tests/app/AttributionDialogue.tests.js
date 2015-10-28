'use strict';

QUnit.module( 'AttributionDialogue' );

var AttributionDialogue = require( '../../js/app/AttributionDialogue' );

QUnit.test( 'should have 4 steps by default', function( assert ) {
	var dialogue = new AttributionDialogue();
	dialogue.init();
	assert.equal( 4, dialogue._steps.length );
} );

QUnit.test( 'should have only 3 steps if the author is known', function( assert ) {
	var dialogue = new AttributionDialogue( 'Foo' );
	dialogue.init();
	assert.equal( 3, dialogue._steps.length );
} );
