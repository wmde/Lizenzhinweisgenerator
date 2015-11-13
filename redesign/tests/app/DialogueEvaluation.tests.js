'use strict';

QUnit.module( 'DialogueEvaluation' );

var DialogueEvaluation = require( '../../js/app/DialogueEvaluation' ),
	Asset = require( '../../js/app/Asset' ),
	LICENCES = require( '../../js/app/LICENCES' );

function newEvaluation( asset, dialogueData ) {
	return new DialogueEvaluation(
		new Asset(
			'',
			'',
			asset.licence || LICENCES[ 0 ],
			asset.title || '',
			asset.authors || [ '' ],
			asset.url || ''
		),
		dialogueData || {}
	);
}

QUnit.test( 'responds to getAttribution', function( assert ) {
	assert.ok( typeof newEvaluation( {} ).getAttribution() === 'string' );
} );

QUnit.test( 'attribution contains asset title', function( assert ) {
	assert.ok( newEvaluation( { title: 'Test' } ).getAttribution().indexOf( 'Test' ) !== -1 );
} );

QUnit.test( 'attribution contains asset url for use in print', function( assert ) {
	var url = 'https://commons.wikimedia.org/wiki/File:Eichh%C3%B6rnchen_D%C3%BCsseldorf_Hofgarten_edit.jpg',
		evaluation = newEvaluation( { url: url }, { 'type-of-use': { type: 'print' } } );
	assert.ok( evaluation.getAttribution().indexOf( url ) !== -1 );
} );
