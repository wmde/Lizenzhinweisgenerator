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

QUnit.test( 'should mark step <= current step as completed/active', function( assert ) {
	var dialogue = Helpers.newDefaultAttributionDialogue(),
		pb = new ProgressBarView( dialogue );

	assert.equal( pb.render().find( 'li.active' ).length, 1 );

	dialogue.currentStep().complete( {} );
	assert.equal( pb.render().find( 'li.active' ).length, 2 );
} );
