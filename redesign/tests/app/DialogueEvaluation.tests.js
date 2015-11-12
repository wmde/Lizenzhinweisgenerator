'use strict';

QUnit.module( 'DialogueEvaluation' );

var DialogueEvaluation = require( '../../js/app/DialogueEvaluation' );

QUnit.test( 'responds to getAttribution', function( assert ) {
	assert.ok( typeof new DialogueEvaluation().getAttribution() === 'string' );
} );
