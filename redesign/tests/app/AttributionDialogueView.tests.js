'use strict';

QUnit.module( 'AttributionDialogueView' );

var $ = require( 'jquery' ),
	AttributionDialogueView = require( '../../js/app/views/AttributionDialogueView' ),
	Messages = require( '../../js/app/Messages' );

QUnit.test( 'render should show the first step', function( assert ) {
	var $dialogue = $( '<div/>' );
	new AttributionDialogueView().render( $dialogue );

	assert.ok( $dialogue.text().indexOf( Messages.t( 'dialogue.type-of-use-headline' ) ) > -1 );
} );

QUnit.test( 'first step has two radio buttons', function( assert ) {
	var $dialogue = $( '<div/>' );
	new AttributionDialogueView().render( $dialogue );

	assert.equal( $dialogue.find( 'input[type="radio"]' ).length, 2 );
} );
