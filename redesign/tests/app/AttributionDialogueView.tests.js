'use strict';

QUnit.module( 'AttributionDialogueView' );

var $ = require( 'jquery' ),
	AttributionDialogueView = require( '../../js/app/views/AttributionDialogueView' ),
	Messages = require( '../../js/app/Messages' );

function dialogueContains( $dialogue, message ) {
	return $dialogue.text().indexOf( Messages.t( message ) ) > -1;
}

QUnit.test( 'render should show the first step', function( assert ) {
	var $dialogue = $( '<div/>' );
	new AttributionDialogueView().render( $dialogue );

	assert.ok( dialogueContains( $dialogue, 'dialogue.type-of-use-headline' ) );
} );

QUnit.test( 'first step has two radio buttons', function( assert ) {
	var $dialogue = $( '<div/>' );
	new AttributionDialogueView().render( $dialogue );

	assert.equal( $dialogue.find( 'input[type="radio"]' ).length, 2 );
} );

QUnit.test( 'clicking a radio button on first step submits and saves data', function( assert ) {
	var $dialogue = $( '<div/>' ),
		dialogue = new AttributionDialogueView();
	dialogue.render( $dialogue );

	$dialogue.find( 'input:radio' )[ 0 ].click();
	assert.equal( dialogue._dialogue.getData()[ 'typeOfUse' ][ 'type' ], 'print' );
} );

QUnit.test( 'submitting the form should renders second step', function( assert ) {
	var $dialogue = $( '<div/>' );
	new AttributionDialogueView().render( $dialogue );

	$dialogue.find( 'input[type="radio"]' )[ 0 ].click();
	assert.ok( dialogueContains( $dialogue, 'dialogue.author-headline' ) );
	assert.notOk( dialogueContains( $dialogue, 'dialogue.type-of-use-headline' ) );
} );

QUnit.test( 'Dialogue walkthrough', function( assert ) {
	var $dialogue = $( '<div/>' ),
		dialogue = new AttributionDialogueView();
	dialogue.render( $dialogue );

	// Type of Use Step
	$dialogue.find( 'input:radio' )[ 1 ].click();
	assert.equal( dialogue._dialogue.getData()[ 'typeOfUse' ][ 'type' ], 'online' );

	// Author Step
	assert.equal( $dialogue.find( 'input:radio' ).length, 1 );
	assert.equal( $dialogue.find( 'input:text' ).length, 1 );

	$dialogue.find( 'input:text' ).val( 'Blah' );
	$dialogue.find( 'button' ).click();
	assert.equal( dialogue._dialogue.getData()[ 'author' ][ 'author' ], 'Blah' );

	// Compilation Step
	assert.equal( $dialogue.find( 'input:radio' ).length, 2 );

	$dialogue.find( 'input:radio' )[ 0 ].click();
	assert.equal( dialogue._dialogue.getData()[ 'compilation' ][ 'compilation' ], 'true' );

	// Editing Step
	assert.equal( $dialogue.find( 'input:radio' ).length, 2 );

	$dialogue.find( 'input:radio' )[ 0 ].click();
	assert.equal( dialogue._dialogue.getData()[ 'editing' ][ 'edited' ], 'true' );

	// Change Substep
	assert.equal( $dialogue.find( 'input:text' ).length, 1 );

	$dialogue.find( 'input:text' ).val( 'cropped' );
	$dialogue.find( 'button' ).click();
	assert.equal( dialogue._dialogue.getData()[ 'change' ][ 'change' ], 'cropped' );

	// Creator Substep
	assert.equal( $dialogue.find( 'input:text' ).length, 1 );

	$dialogue.find( 'input:text' ).val( 'Meh' );
	$dialogue.find( 'button' ).click();
	assert.equal( dialogue._dialogue.getData()[ 'creator' ][ 'name' ], 'Meh' );
} );
