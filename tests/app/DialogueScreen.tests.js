'use strict';

QUnit.module( 'DialogueScreen' );

var Asset = require( '../../js/app/Asset' ),
	DialogueScreen = require( '../../js/app/views/DialogueScreen' ),
	ImageInfo = require( '../../js/app/ImageInfo' ),
	LicenceStore = require( '../../js/app/LicenceStore' ),
	licences = new LicenceStore( require( '../../js/app/LICENCES' ) ),
	Messages = require( '../../js/app/Messages' ),
	$ = require( 'jquery' );

function newDialogueScreenForLicence( licenceId ) {
	return new DialogueScreen(
		new ImageInfo( 'foo', 'bar', 1337, { url: 'baz', width: 1337, height: 1337 } ),
		new Asset( '', '', licences.getLicence( licenceId ), null, [] )
	);
}

function dialogueHeaderContains( $dialogue, text ) {
	return $dialogue.find( '.dialogue-header' ).text().indexOf( Messages.t( text ) ) > -1;
}

QUnit.test( 'Given Public Domain asset, no atribution obligation information is displayed', function( assert ) {
	var $dialogue = $( '<div/>' );
	newDialogueScreenForLicence( 'PD' ).render( $dialogue );
	assert.ok( dialogueHeaderContains( $dialogue, 'dialogue.no-attribution-needed' ) );
} );

QUnit.test( 'Given CC0 asset, no atribution obligation information is displayed', function( assert ) {
	var $dialogue = $( '<div/>' );
	newDialogueScreenForLicence( 'cc-zero' ).render( $dialogue );
	assert.ok( dialogueHeaderContains( $dialogue, 'dialogue.no-attribution-needed' ) );
} );

QUnit.test( 'Given asset licenced under CC-BY-SA-4.0, the dialogue is displayed', function( assert ) {
	var $dialogue = $( '<div/>' );
	newDialogueScreenForLicence( 'cc-by-sa-4.0' ).render( $dialogue );
	assert.ok( dialogueHeaderContains( $dialogue, 'dialogue.adjust-attribution-for-usage' ) );
} );
