'use strict';

QUnit.module( 'DialogueStep' );

var DialogueStep = require( '../../js/app/DialogueStep' );

QUnit.test( 'Step should have a name', function( assert ) {
	assert.equal( new DialogueStep( 'typeOfUse' ).getName(), 'typeOfUse' );
} );
