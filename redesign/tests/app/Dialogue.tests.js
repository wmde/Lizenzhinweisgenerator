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

QUnit.test( 'addStep connects step and dialogue', function( assert ) {
	var dialogue = new Dialogue,
		step = new DialogueStep( 'test1' );

	assert.notOk( step._dialogue );
	dialogue.addStep( step );
	assert.ok( step._dialogue );
} );

QUnit.test( 'getData should return data from all completed steps', function( assert ) {
	var dialogue = new Dialogue,
		step1 = new DialogueStep( 'test1', dialogue ),
		step2 = new DialogueStep( 'test2', dialogue ),
		step1Data = { foo: 'bar' },
		step2Data = { omg: 'bbq' };
	dialogue.addStep( step1 );
	dialogue.addStep( step2 );
	step1.complete( step1Data );
	step2.complete( step2Data );

	var data = dialogue.getData();
	assert.equal( step1Data, data[ step1.getName() ] );
	assert.equal( step2Data, data[ step2.getName() ] );
} );
