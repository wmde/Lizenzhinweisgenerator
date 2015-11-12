'use strict';

QUnit.module( 'DialogueEvaluation' );

var DialogueEvaluation = require( '../../js/app/DialogueEvaluation' ),
	Asset = require( '../../js/app/Asset' ),
	LICENCES = require( '../../js/app/LICENCES' );

function newEvaluation( asset ) {
	return new DialogueEvaluation( new Asset(
		'',
		'',
		asset.licence || LICENCES[ 0 ],
		asset.title || '',
		asset.authors || [ '' ]
	) );
}

QUnit.test( 'responds to getAttribution', function( assert ) {
	assert.ok( typeof newEvaluation( {} ).getAttribution() === 'string' );
} );

QUnit.test( 'attribution contains asset title', function( assert ) {
	assert.ok( newEvaluation( { title: 'Test' } ).getAttribution().indexOf( 'Test' ) !== -1 );
} );
