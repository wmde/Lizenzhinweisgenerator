'use strict';

QUnit.module( 'AttributionDialogue' );

var $ = require( 'jquery' ),
	AttributionDialogue = require( '../../js/app/AttributionDialogue' ),
	Messages = require( '../../js/app/Messages' ),
	Author = require( '../../js/app/Author' ),
	Asset = require( '../../js/app/Asset' );

QUnit.test( 'should have 4 steps by default', function( assert ) {
	var dialogue = new AttributionDialogue( new Asset( '', '', null, null, [] ) );
	dialogue.init();
	assert.equal( dialogue._steps.length, 4 );
} );

QUnit.test( 'should have only 3 steps if the author is known', function( assert ) {
	var asset = new Asset( '', '', null, null, [ new Author( $( 'Meh' ) ) ] ),
		dialogue = new AttributionDialogue( asset );
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
	var dialogue = new AttributionDialogue( new Asset( '', '', null, null, [] ) );
	dialogue.init();
	var initialNumber = dialogue._steps.length;
	completeEditingStep( dialogue, { edited: 'true' } );
	assert.equal( dialogue._steps.length, initialNumber + 3 );
} );

QUnit.test( 'should not add 3 more steps when not editing', function( assert ) {
	var dialogue = new AttributionDialogue( new Asset( '', '', null, null, [] ) );
	dialogue.init();
	var initialNumber = dialogue._steps.length;
	completeEditingStep( dialogue, { edited: 'false' } );
	assert.equal( dialogue._steps.length, initialNumber );
} );

function currentStepContains( dialogue, message ) {
	return dialogue
			.currentStep()
			.render()
			.text()
			.indexOf( Messages.t( message ) ) > -1;
}

QUnit.test( 'Steps content', function( assert ) {
	var dialogue = new AttributionDialogue( new Asset( '', '', null, null, [] ) );
	dialogue.init();

	assert.ok( currentStepContains( dialogue, 'dialogue.type-of-use-headline' ) );
	dialogue.currentStep().complete();

	assert.ok( currentStepContains( dialogue, 'dialogue.author-headline' ) );
	dialogue.currentStep().complete();

	assert.ok( currentStepContains( dialogue, 'dialogue.compilation-headline' ) );
	dialogue.currentStep().complete();

	assert.ok( currentStepContains( dialogue, 'dialogue.editing-headline' ) );
	dialogue.currentStep().complete( { edited: 'true' } );

	assert.ok( currentStepContains( dialogue, 'dialogue.change-headline' ) );
	dialogue.currentStep().complete();

	assert.ok( currentStepContains( dialogue, 'dialogue.creator-headline' ) );
	dialogue.currentStep().complete();

	assert.ok( currentStepContains( dialogue, 'dialogue.licence-headline' ) );
	dialogue.currentStep().complete();
} );
