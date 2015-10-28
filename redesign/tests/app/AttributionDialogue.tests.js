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

function completeEditingStep( dialogue, data ) {
	var editingStep = dialogue._steps.find( function( step ) {
		return step.getName() === 'editing';
	} );
	editingStep.complete( data );
}

QUnit.test( 'should add 3 more steps for editing', function( assert ) {
	var dialogue = new AttributionDialogue();
	dialogue.init();
	var initialNumber = dialogue._steps.length;
	completeEditingStep( dialogue, { edited: true } );
	assert.equal( dialogue._steps.length, initialNumber + 3 );
} );

QUnit.test( 'should not add 3 more steps when not editing', function( assert ) {
	var dialogue = new AttributionDialogue();
	dialogue.init();
	var initialNumber = dialogue._steps.length;
	completeEditingStep( dialogue, { edited: false } );
	assert.equal( dialogue._steps.length, initialNumber );
} );