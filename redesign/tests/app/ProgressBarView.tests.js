'use strict';

QUnit.module( 'Progress Bar UI' );

var ProgressBarView = require( '../../js/app/views/ProgressBarView' ),
	Asset = require( '../../js/app/Asset' ),
	Author = require( '../../js/app/Author' ),
	AttributionDialogue = require( '../../js/app/AttributionDialogue' ),
	$ = require( 'jquery' ),
	Helpers = require( '../TestHelpers' );

QUnit.test( 'should have 5 steps by default', function( assert ) {
	assert.equal( new ProgressBarView( Helpers.newDefaultAttributionDialogue() ).render().find( 'li' ).length, 5 );
} );

QUnit.test( 'should have only 4 steps if the author is known', function( assert ) {
	var asset = new Asset( '', '', null, null, [ new Author( $( 'Meh' ) ) ] ),
		dialogue = new AttributionDialogue( asset ),
		pb = new ProgressBarView( dialogue );
	dialogue.init();

	assert.equal( pb.render().find( 'li' ).length, 4 );
} );

QUnit.test( 'should add 3 substeps for editing', function( assert ) {
	var dialogue = Helpers.newDefaultAttributionDialogue(),
		pb = new ProgressBarView( dialogue );

	dialogue.currentStep().complete( {} );
	dialogue.currentStep().complete( {} );
	dialogue.currentStep().complete( {} );
	dialogue.currentStep().complete( { edited: 'true' } );

	assert.equal( pb.render().find( 'li' ).length, 8 );
	assert.equal( pb.render().find( 'li.sub' ).length, 3 );
} );

QUnit.test( 'should mark first step as active at the start', function( assert ) {
	assert.equal( new ProgressBarView( Helpers.newDefaultAttributionDialogue() ).render().find( 'li.active' ).length, 1 );
} );

QUnit.test( 'should mark step < current step as completed and current step as active', function( assert ) {
	var dialogue = Helpers.newDefaultAttributionDialogue(),
		pb = new ProgressBarView( dialogue );

	assert.equal( pb.render().find( 'li.active' ).length, 1 );
	assert.equal( pb.render().find( 'li.completed' ).length, 0 );

	dialogue.currentStep().complete( {} );
	assert.equal( pb.render().find( 'li.active' ).length, 1 );
	assert.equal( pb.render().find( 'li.completed' ).length, 1 );

	dialogue.currentStep().complete( {} );
	assert.equal( pb.render().find( 'li.active' ).length, 1 );
	assert.equal( pb.render().find( 'li.completed' ).length, 2 );
} );

QUnit.test( 'should mark all steps completed when the attribution is shown', function( assert ) {
	var dialogue = Helpers.newDefaultAttributionDialogue(),
		pb = new ProgressBarView( dialogue );
	dialogue.currentStep().complete( {} );
	dialogue.currentStep().complete( {} );
	dialogue.currentStep().complete( {} );
	dialogue.currentStep().complete( {} );

	assert.equal( pb.render().find( 'li.active' ).length, 1 );
	assert.equal( pb.render().find( 'li.completed' ).length, 4 );
} );

QUnit.test( 'go back using by clicking on a progress bar item', function( assert ) {
	var dialogueView = Helpers.newDefaultAttributionDialogueView(),
		dialogue = dialogueView._dialogue,
		pb = new ProgressBarView( dialogue, dialogueView ),
		initialStep = dialogue.currentStep();

	dialogue.currentStep().complete( {} );
	pb.render().find( 'li a' )[ 0 ].click();
	assert.equal( dialogue.currentStep(), initialStep );
} );

QUnit.test( 'going to steps that were not previously completed should not be possible', function( assert ) {
	var dialogueView = Helpers.newDefaultAttributionDialogueView(),
		dialogue = dialogueView._dialogue,
		pb = new ProgressBarView( dialogue, dialogueView ),
		initialStep = dialogue.currentStep();

	pb.render().find( 'li a' )[ 2 ].click();
	assert.equal( dialogue.currentStep(), initialStep );
} );

QUnit.test( 'should remove 3 editing substeps when going back further than editing', function( assert ) {
	var dialogueView = Helpers.newDefaultAttributionDialogueView(),
		dialogue = dialogueView._dialogue,
		pb = new ProgressBarView( dialogue, dialogueView );

	dialogue.currentStep().complete( {} );
	dialogue.currentStep().complete( {} );
	dialogue.currentStep().complete( {} );
	dialogue.currentStep().complete( { edited: 'true' } );

	assert.equal( dialogue.getSteps().length, 7 );
	pb.render().find( 'li a' )[ 2 ].click();
	assert.equal( dialogue.getSteps().length, 4 );
} );
