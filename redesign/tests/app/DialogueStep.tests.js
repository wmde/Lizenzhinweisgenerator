'use strict';

QUnit.module( 'DialogueStep' );

var DialogueStep = require( '../../js/app/DialogueStep' );

QUnit.test( 'should have a name', function( assert ) {
	assert.equal( new DialogueStep( 'typeOfUse' ).getName(), 'typeOfUse' );
} );

QUnit.test( 'should contain data once completed', function( assert ) {
	var step = new DialogueStep( 'test' );
	step.complete( { foo: 'bar' } );
	assert.ok( step._data, '_data attribute contained data' );
} );

QUnit.test( 'should make data accessible', function( assert ) {
	var data = { foo: 'bar' },
		step = new DialogueStep( 'test' );
	step.complete( data );
	assert.equal( data, step.getData() );
} );
