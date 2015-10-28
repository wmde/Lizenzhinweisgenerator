'use strict';

QUnit.module( 'DialogueStep' );

var DialogueStep = require( '../../js/app/DialogueStep' ),
	Dialogue = require( '../../js/app/Dialogue' );

QUnit.test( 'should have a name', function( assert ) {
	assert.equal( new DialogueStep( 'typeOfUse', new Dialogue() ).getName(), 'typeOfUse' );
} );

QUnit.test( 'should contain data once completed', function( assert ) {
	var step = new DialogueStep( 'test' );

	new Dialogue().addStep( step );
	step.complete( { foo: 'bar' } );
	assert.ok( step._data, '_data attribute contained data' );
} );

QUnit.test( 'should make data accessible', function( assert ) {
	var data = { foo: 'bar' },
		step = new DialogueStep( 'test' );

	new Dialogue().addStep( step );
	step.complete( data );
	assert.equal( data, step.getData() );
} );

QUnit.test( 'should push its data to its Dialogue on completion', function( assert ) {
	var dialogue = new Dialogue(),
		step = new DialogueStep( 'test', dialogue );

	dialogue.addStep( step );
	step.complete( { foo: 'bar' } );
	assert.equal( step._data, dialogue._data[ step.getName() ] );
} );
