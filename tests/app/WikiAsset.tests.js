/**
 * @licence GNU GPL v3
 * @author Leszek Manicki < leszek.manicki@wikimedia.de >
 */
( function( QUnit ) {
'use strict';

define( ['jquery', 'app/WikiAsset', 'tests/assets'], function( $, WikiAsset, testAssets ) {

	QUnit.module( 'WikiAsset' );

	QUnit.test( 'getUrl()', function( assert ) {

		var testCases = {
			'LRO_Tycho_Central_Peak.jpg': {
				expected: 'https://commons.wikimedia.org/wiki/File:LRO_Tycho_Central_Peak.jpg'
			},
			'Helene Fischer 2010.jpg': {
				expected: 'https://commons.wikimedia.org/wiki/File:Helene_Fischer_2010.jpg'
			},
			'Hektor_Philippi.JPG': {
				expected: 'https://de.wikipedia.org/wiki/Datei:Hektor_Philippi.JPG'
			}
		};

		$.each( testCases, function ( filename, testCase ) {
			var asset = testAssets[filename];
			assert.ok( asset.getUrl(), testCase.expected, 'URL "' + asset.getUrl() + '" matches.' );
		} );

	} );

} );

}( QUnit ) );