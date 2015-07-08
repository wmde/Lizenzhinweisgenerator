/**
 * @licence GNU GPL v3
 * @author Leszek Manicki <leszek.manicki@wikimedia.de>
 */
( function( QUnit ) {
	'use strict';

	define(
		[ 'jquery', 'app/QuestionnairePage', 'app/QuestionnaireState', 'tests/assets' ],
		function( $, QuestionnairePage, QuestionnaireState, testAssets ) {

			QUnit.module( 'QuestionnairePage' );

			QUnit.test( 'getNextPageId()', function( assert ) {

				var testCases = [
					{
						input: {
							assetId: 'JapaneseToiletControlPanel.jpg',
							page: '2',
							answer: 1
						},
						expected: '3'
					},
					{
						input: {
							assetId: 'JapaneseToiletControlPanel.jpg',
							page: '2',
							answer: 9
						},
						expected: 'result-note-cc0'
					},
					{
						input: {
							assetId: 'https://www.wikimedia.de/w/images.homepage/d/d6/Pavel_Richter_WMDE.JPG',
							page: '2',
							answer: 1
						},
						expected: 'form-author'
					},
					{
						input: {
							assetId: 'https://www.wikimedia.de/w/images.homepage/d/d6/Pavel_Richter_WMDE.JPG',
							page: 'form-author',
							answer: 2
						},
						expected: 'form-title'
					}
				];

				function testGetNextPageId( data, expected ) {
					var questionnairePage = new QuestionnairePage(
						data.page,
						$(),
						testAssets[ data.assetId ],
						new QuestionnaireState( data.page, testAssets[ 'JapaneseToiletControlPanel.jpg' ] )
					);
					assert.equal( questionnairePage.getNextPageId( data.answer ), expected );
				}

				$.each( testCases, function( i, testCase ) {
					testGetNextPageId( testCase.input, testCase.expected );
				} );

			} );
		} );
}( QUnit ) );