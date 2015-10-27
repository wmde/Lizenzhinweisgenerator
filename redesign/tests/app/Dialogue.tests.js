'use strict';

QUnit.module( 'Dialogue' );

var Dialogue = require( '../../js/app/Dialogue' ),
	DialogueStep = require( '../../js/app/DialogueStep' );

QUnit.test( 'can contain steps', function( assert ) {
	var dialogue = new Dialogue,
		step1 = new DialogueStep( 'test1' ),
		step2 = new DialogueStep( 'test2' );

	dialogue.addStep( step1 );
	dialogue.addStep( step2 );

	assert.equal( dialogue._steps.length, 2 );
} );
