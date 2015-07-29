/**
 * @licence GNU GPL v3
 * @author Leszek Manicki < leszek.manicki@wikimedia.de >
 */
( function( QUnit ) {
'use strict';

define( [
	'jquery', 'app/Author', 'tests/LocalApi', 'app/WikiAsset', 'tests/assets'
],
function(
	$, Author, LocalApi, WikiAsset, testAssets
) {

	QUnit.module( 'Api local' );

	var api = new LocalApi( 'fixtures' );

	/**
	 * Returns a nodes HTML as plain text.
	 *
	 * @param {jQuery|null} $node
	 * @return {string|null}
	 */
	function getHtmlText( $node ) {
		return $node ? $( '<div/>' ).append( $node ).html() : null;
	}

	QUnit.test( 'Check scraped asset', function ( assert ) {

		$.each( testAssets, function ( filename, testAsset ) {
			if( !( testAsset instanceof WikiAsset ) ) {
				return true;
			}

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

} );

}( QUnit ) );