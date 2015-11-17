'use strict';

QUnit.module( 'DialogueEvaluation' );

var $ = require( 'jquery' ),
	DialogueEvaluation = require( '../../js/app/DialogueEvaluation' ),
	Asset = require( '../../js/app/Asset' ),
	LicenceStore = require( '../../js/app/LicenceStore' ),
	licences = new LicenceStore( require( '../../js/app/LICENCES' ) ),
	Author = require( '../../js/app/Author' );

function newEvaluation( asset, dialogueData ) {
	return new DialogueEvaluation(
		new Asset(
			'',
			'',
			asset.licence || licences.getLicence( 'cc' ),
			asset.title || '',
			asset.authors || [ '' ],
			asset.url || ''
		),
		dialogueData || {}
	);
}

function attributionContains( evaluation, text ) {
	return evaluation.getAttribution().indexOf( text ) !== -1;
}

QUnit.test( 'responds to getAttribution', function( assert ) {
	assert.ok( typeof newEvaluation( {} ).getAttribution() === 'string' );
} );

QUnit.test( 'attribution contains asset title', function( assert ) {
	assert.ok( attributionContains( newEvaluation( { title: 'Test' } ), 'Test' ) );
} );

QUnit.test( 'attribution contains asset url for use in print', function( assert ) {
	var url = 'https://commons.wikimedia.org/wiki/File:Eichh%C3%B6rnchen_D%C3%BCsseldorf_Hofgarten_edit.jpg',
		evaluation = newEvaluation( { url: url }, { 'type-of-use': { type: 'print' } } );
	assert.ok( attributionContains( evaluation, url ) );
} );

QUnit.test( 'print attribution contains licence URL', function( assert ) {
	var licence = licences.getLicence( 'cc-by-3.0' ),
		evaluation = newEvaluation( { licence: licence }, { 'type-of-use': { type: 'print' } } );
	assert.ok( attributionContains( evaluation, licence.getUrl() ) );
} );

QUnit.test( 'use different licence URL if the user edited the asset and uses a compatible licence', function( assert ) {
	var licence = licences.getLicence( 'cc-by-3.0' ),
		compatibleLicence = licences.getLicence( 'cc-by-3.0-de' ),
		evaluation = newEvaluation(
			{ licence: licence },
			{
				'type-of-use': { type: 'print' },
				'editing': { edited: 'true' },
				'licence': { licence: compatibleLicence.getId() }
			} );
	assert.ok( attributionContains( evaluation, compatibleLicence.getUrl() ) );
} );

QUnit.test( 'attribution contains the author', function( assert ) {
	var authorName = 'Meh',
		author = new Author( $( '<div>' + authorName + '</div>' ) ),
		evaluation = newEvaluation( { authors: [ author ] } ),
		printEvaluation = newEvaluation( { authors: [ author ] }, { 'type-of-use': { type: 'print' } } );
	assert.ok( attributionContains( evaluation, authorName ) );
	assert.ok( attributionContains( printEvaluation, authorName ) );
} );

QUnit.test( 'attribution contains editing information if it was edited', function( assert ) {
	var licence = licences.getLicence( 'cc-by-3.0' ),
		evaluation = newEvaluation(
			{},
			{
				'type-of-use': { type: 'print' },
				editing: { edited: 'true' },
				licence: { licence: licence.getId() },
				change: { change: 'zugeschnitten' },
				creator: { name: 'Meh' }
			}
		);

	assert.ok( attributionContains( evaluation, 'zugeschnitten von Meh, ' + licence.getUrl() ) );
} );

QUnit.test( 'online attribution contains author\'s html', function( assert ) {
	var authorHtml = '<a href="#meh">Meh</a>',
		evaluation = newEvaluation( { authors: [ new Author( $( authorHtml ) ) ] } );
	assert.ok( attributionContains( evaluation, authorHtml ) );
} );

QUnit.test( 'online attribution contains link to asset from title', function( assert ) {
	var url = 'http://example.com/foo.jpg',
		title = 'bar',
		evaluation = newEvaluation( { url: url, title: title } );
	assert.ok( attributionContains( evaluation, '<a href="' + url + '">' + title + '</a>' ) );
} );

QUnit.test( 'online attribution contains link to licence', function( assert ) {
	var licence = licences.getLicence( 'cc-by-3.0' ),
		evaluation = newEvaluation( { licence: licence } );
	assert.ok( attributionContains( evaluation, '<a href="' + licence.getUrl() + '">' + licence.getName() + '</a>' ) );
} );

QUnit.test( 'online attribution contains editing information', function( assert ) {
	var licence = licences.getLicence( 'cc-by-3.0' ),
			evaluation = newEvaluation(
					{},
					{
						'type-of-use': { type: 'online' },
						editing: { edited: 'true' },
						licence: { licence: licence.getId() },
						change: { change: 'zugeschnitten' },
						creator: { name: 'Meh' }
					}
			);

	assert.ok( attributionContains( evaluation, 'zugeschnitten von Meh, ' ) );
} );
