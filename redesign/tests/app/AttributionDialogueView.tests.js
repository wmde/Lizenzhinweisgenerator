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
