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
		step1 = new DialogueStep( 'test1' ),
		step2 = new DialogueStep( 'test2' ),
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

QUnit.test( 'completing a step should increment the current step pointer', function( assert ) {
	var dialogue = new Dialogue,
		step1 = new DialogueStep( 'first' ),
		step2 = new DialogueStep( 'second' );

	dialogue.addStep( step1 );
	dialogue.addStep( step2 );

	assert.equal( dialogue.currentStep().getName(), 'first' );
	step1.complete( {} );
	assert.equal( dialogue.currentStep().getName(), 'second' );
} );

QUnit.test( 'setStep sets current step pointer', function( assert ) {
	var dialogue = new Dialogue();
	dialogue.setStep( 3 );

	assert.equal( dialogue._currentStep, 3 );
} );
