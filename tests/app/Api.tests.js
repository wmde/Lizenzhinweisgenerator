( function( define, QUnit ) {

define(
	['jquery', 'app/Api', 'app/Author', 'app/LicenceStore', 'app/LICENCES', 'tests/assets'],
	function( $, Api, Author, LicenceStore, LICENCES, testAssets ) {

	QUnit.module( 'Api' );

	var api = new Api( '//commons.wikimedia.org/', new LicenceStore( LICENCES ) );

	/**
	 * Returns a nodes HTML as plain text.
	 *
	 * @param {jQuery|null} $node
	 * @return {string|null}
	 */
	function getHtmlText( $node ) {
		return $node ? $( '<div/>' ).append( $node ).html() : null
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
				QUnit.start()
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

		for( var i = 0; i < negativeTestCases.length; i++ ) {
			var input = negativeTestCases[i];

			QUnit.stop();

			( function( input ) {
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
			}( input ) );
		}
	} );

} );

}( define, QUnit ) );
