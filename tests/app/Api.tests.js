/**
 * @licence GNU GPL v3
 * @author snater.com < wikimedia@snater.com >
 */
( function( QUnit ) {
'use strict';

define(
	['jquery', 'app/Api', 'app/Author', 'tests/assets'],
	function( $, Api, Author, testAssets ) {

	QUnit.module( 'Api' );

	var api = new Api( '//commons.wikimedia.org/' );

	/**
	 * Returns a nodes HTML as plain text.
	 *
	 * @param {jQuery|null} $node
	 * @return {string|null}
	 */
	function getHtmlText( $node ) {
		return $node ? $( '<div/>' ).append( $node ).html() : null;
	}

	QUnit.test( 'Check scraped asset', function( assert ) {

		$.each( testAssets, function( filename, testAsset ) {

			QUnit.stop();

			api.getAsset( 'File:' + filename, testAsset.getWikiUrl() )
			.done( function( asset ) {

				assert.equal(
					asset.getFilename(),
					testAsset.getFilename(),
					'Filename "' + asset.getFilename() + '" matches.'
				);

				assert.equal(
					asset.getTitle(),
					testAsset.getTitle(),
					'Title "' + asset.getTitle() + '" matches.'
				);

				$.each( asset.getAuthors(), function( i, author ) {

					assert.equal(
						author.getText(),
						testAsset.getAuthors()[i].getText(),
						'"' + testAsset.getFilename() + '": Author text "' + author.getText()
							+ '" matches.'
					);

					var authorHtml = getHtmlText( author.getHtml() );

					assert.equal(
						authorHtml,
						getHtmlText( testAsset.getAuthors()[i].getHtml() ),
						'"' + testAsset.getFilename() + '": Author html "' + authorHtml
							+ '" matches.'
					);

				} );

				if( asset.getLicence() === null ) {
					assert.strictEqual(
						asset.getLicence(),
						testAsset.getLicence(),
						'No supported licence.'
					);
				} else {
					assert.equal(
						asset.getLicence().getId(),
						testAsset.getLicence().getId(),
						'Licence "' + asset.getLicence().getId() + '" matches.'
					);
				}

				assert.equal(
					getHtmlText( asset.getAttribution() ),
					getHtmlText( testAsset.getAttribution() ),
					'Dedicated attribution of "' + testAsset.getFilename() + '" matches.'
				);

			} )
			.fail( function() {
				assert.ok(
					false,
					'API call failed.'
				);
			} )
			.always( function() {
				QUnit.start();
			} );

		} );

	} );

	QUnit.test( 'getAsset() error handling', function( assert ) {
		var negativeTestCases = [
			'string that is not supposed to be the name of an existing image',
			'{invalid input}',
			// Not in "File:" namespace:
			'TimedText:Elephants_Dream.ogg.ca.srt'
		];

		/**
		 * @param {string} input
		 */
		function testAssetErrorHandling( input ) {
			QUnit.stop();

			api.getAsset( 'File:' + input )
			.done( function( parsedFilename ) {
				assert.ok(
					false,
					'Unexpected result: "' + parsedFilename + '".'
				);
			} ).fail( function( message ) {
				assert.ok(
					true,
					'Rejected input "' + input + '" with error message "' + message + '".'
				);
			} )
			.always( function() {
				QUnit.start();
			} );
		}

		for( var i = 0; i < negativeTestCases.length; i++ ) {
			testAssetErrorHandling(  negativeTestCases[i] );
		}
	} );

} );

}( QUnit ) );