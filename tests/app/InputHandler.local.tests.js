/**
 * @licence GNU GPL v3
 * @author Leszek Manicki < leszek.manicki@wikimedia.de >
 */

'use strict';

var $ = require( 'jquery' ),
	ImageInfo = require( '../../js/app/ImageInfo' ),
	InputHandler = require( '../../js/app/InputHandler' ),
	LocalApi = require( '../LocalApi' ),
	Messages = require( '../../js/app/Messages' );

QUnit.module( 'InputHandler' );

var api = new LocalApi( 'fixtures' );

var testCases = [
	{
		input: [
			'http://commons.wikimedia.org/wiki/File:Helene_Fischer_2010.jpg',
			'commons.wikimedia.org/wiki/File:Helene_Fischer_2010.jpg',
			'http://commons.wikimedia.org/w/index.php?title=File:Helene_Fischer_2010.jpg',
			'http://upload.wikimedia.org/wikipedia/commons/8/84/Helene_Fischer_2010.jpg',
			'http://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Helene_Fischer_2010.jpg/171px-Helene_Fischer_2010.jpg',
			'upload.wikimedia.org/wikipedia/commons/thumb/8/84/Helene_Fischer_2010.jpg/171px-Helene_Fischer_2010.jpg',
			'http://commons.wikimedia.org/wiki/File:Helene_Fischer_2010.jpg#mediaviewer/File:Helene_Fischer_2010.jpg',
			'commons.wikimedia.org/wiki/File:Helene_Fischer_2010.jpg?uselang=de',
			'https://commons.wikimedia.org/w/index.php?title=File:Helene_Fischer_2010.jpg&uselang=de',
			'commons.wikimedia.org/wiki/File:Helene_Fischer_2010.jpg?foo=bar'
		],
		expected: {
			file: 'File:Helene_Fischer_2010.jpg',
			wikiUrl: 'https://commons.wikimedia.org/'
		}
	}, {
		input: [
			'http://fr.wikipedia.org/wiki/Wikip%C3%A9dia:Le_Bistro/24_f%C3%A9vrier_2012#mediaviewer/Fichier:Helene_Fischer_2010.jpg'
		],
		expected: {
			file: 'File:Helene_Fischer_2010.jpg',
			wikiUrl: 'https://commons.wikimedia.org/'
		}
	}, {
		input: [
			'http://commons.wikimedia.org/wiki/File:JapaneseToiletControlPanel.jpg',
			'http://commons.wikimedia.org/w/index.php?title=File:JapaneseToiletControlPanel.jpg',
			'http://upload.wikimedia.org/wikipedia/commons/e/e4/JapaneseToiletControlPanel.jpg',
			'http://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/JapaneseToiletControlPanel.jpg/320px-JapaneseToiletControlPanel.jpg',
			'http://commons.wikimedia.org/wiki/File:JapaneseToiletControlPanel.jpg#mediaviewer/File:JapaneseToiletControlPanel.jpg',
			'http://commons.wikimedia.org/wiki/User:Chris_73/Gallery_001#mediaviewer/File:JapaneseToiletControlPanel.jpg'
		],
		expected: {
			file: 'File:JapaneseToiletControlPanel.jpg',
			wikiUrl: 'https://commons.wikimedia.org/'
		}
	}, {
		input: [
			'http://commons.wikimedia.org/wiki/File:Gerardus_t%27_Hooft_at_Harvard.jpg',
			'http://commons.wikimedia.org/w/index.php?title=File:Gerardus_t%27_Hooft_at_Harvard.jpg',
			'http://upload.wikimedia.org/wikipedia/commons/f/f4/Gerardus_t%27_Hooft_at_Harvard.jpg',
			'http://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Gerardus_t%27_Hooft_at_Harvard.jpg/180px-Gerardus_t%27_Hooft_at_Harvard.jpg',
			'http://commons.wikimedia.org/wiki/File:Gerardus_t%27_Hooft_at_Harvard.jpg#mediaviewer/File:Gerardus_t%27_Hooft_at_Harvard.jpg',
			'http://commons.wikimedia.org/wiki/Gerardus_%27t_Hooft#mediaviewer/File:Gerardus_t%27_Hooft_at_Harvard.jpg'
		],
		expected: {
			file: 'File:Gerardus_t\'_Hooft_at_Harvard.jpg',
			wikiUrl: 'https://commons.wikimedia.org/'
		}
	}, {
		input: [
			'http://de.wikipedia.org/wiki/File:1_FC_Bamberg_-_1_FC_N%C3%BCrnberg_1901.jpg',
			'de.wikipedia.org/wiki/File:1_FC_Bamberg_-_1_FC_N%C3%BCrnberg_1901.jpg',
			'http://de.wikipedia.org/w/index.php?title=File:1_FC_Bamberg_-_1_FC_N%C3%BCrnberg_1901.jpg',
			'http://upload.wikimedia.org/wikipedia/de/f/fb/1_FC_Bamberg_-_1_FC_N%C3%BCrnberg_1901.jpg',
			'http://upload.wikimedia.org/wikipedia/de/thumb/f/fb/1_FC_Bamberg_-_1_FC_N%C3%BCrnberg_1901.jpg/320px-1_FC_Bamberg_-_1_FC_N%C3%BCrnberg_1901.jpg',
			'upload.wikimedia.org/wikipedia/de/thumb/f/fb/1_FC_Bamberg_-_1_FC_N%C3%BCrnberg_1901.jpg/320px-1_FC_Bamberg_-_1_FC_N%C3%BCrnberg_1901.jpg',
			'http://upload.wikimedia.org/wikipedia/de/thumb/f/fb/1_FC_Bamberg_-_1_FC_N%C3%BCrnberg_1901.jpg/320px-1_FC_Bamberg_-_1_FC_N%C3%BCrnberg_1901.jpg'
		],
		expected: {
			file: 'File:1_FC_Bamberg_-_1_FC_Nürnberg_1901.jpg',
			wikiUrl: 'https://de.wikipedia.org/'
		}
	}, {
		input: [
			'http://de.wikipedia.org/wiki/Datei:1_FC_Bamberg_-_1_FC_N%C3%BCrnberg_1901.jpg',
			'de.wikipedia.org/wiki/Datei:1_FC_Bamberg_-_1_FC_N%C3%BCrnberg_1901.jpg',
			'http://de.wikipedia.org/w/index.php?title=Datei:1_FC_Bamberg_-_1_FC_N%C3%BCrnberg_1901.jpg',
			'de.wikipedia.org/w/index.php?title=Datei:1_FC_Bamberg_-_1_FC_N%C3%BCrnberg_1901.jpg',
			'http://de.wikipedia.org/wiki/1._FC_Bamberg#mediaviewer/Datei:1_FC_Bamberg_-_1_FC_N%C3%BCrnberg_1901.jpg',
			'http://de.wikipedia.org/wiki/Datei:1_FC_Bamberg_-_1_FC_N%C3%BCrnberg_1901.jpg#mediaviewer/Datei:1_FC_Bamberg_-_1_FC_N%C3%BCrnberg_1901.jpg'
		],
		expected: {
			file: 'Datei:1_FC_Bamberg_-_1_FC_Nürnberg_1901.jpg',
			wikiUrl: 'https://de.wikipedia.org/'
		}
	}, {
		input: [
			'https://de.wikipedia.org/wiki/Commodore_Plus/4#/media/File:Commodore_Plus_4_Knurri.png'
		],
		expected: {
			file: 'File:Commodore_Plus_4_Knurri.png',
			wikiUrl: 'https://commons.wikimedia.org/'
		}
	}, {
		input: [
			'https://commons.wikimedia.org/wiki/File:A_Punjab_Village,_1925.webm'
		],
		expected: {
			file: 'File:A_Punjab_Village,_1925.webm',
			wikiUrl: 'https://commons.wikimedia.org/'
		}
	}
];

QUnit.test( 'getFilename()', function( assert ) {
	var inputHandler = new InputHandler( api );

	/**
	 * @param {Object} testCase
	 * @param {string} currentInput
	 */
	function testGetFilename( testCase, currentInput ) {
		QUnit.stop();

		inputHandler.getFilename( currentInput )
			.done( function( prefixedFilenameOrImageInfos, wikiUrl ) {
				assert.equal(
					prefixedFilenameOrImageInfos,
					testCase.expected.file,
					'Detected correct filename "' + testCase.expected.file + '" on input "'
					+ currentInput + '".'
				);

				assert.strictEqual(
					wikiUrl,
					testCase.expected.wikiUrl,
					'Detected correct wiki URL "' + testCase.expected.wikiUrl + '" on '
					+ 'input "' + currentInput + '".'
				);
			} )
			.fail( function( message ) {
				assert.ok(
					false,
					'Parsing input "' + currentInput + '" failed with message "' + message
					+ '".'
				);
			} )
			.always( function() {
				QUnit.start();
			} );
	}

	for( var i = 0; i < testCases.length; i++ ) {
		var testCase = testCases[ i ];

		for( var j = 0; j < testCase.input.length; j++ ) {
			testGetFilename( testCase, testCase.input[ j ] );
		}
	}
} );

QUnit.test( 'getFilename() returning ImageInfo objects', function( assert ) {
	var inputHandler = new InputHandler( api );

	var testCases = [
		{
			input: [
				'http://en.wikipedia.org/wiki/K%C3%B6nigsberg,_Bavaria',
				'http://en.wikipedia.org/w/index.php?title=K%C3%B6nigsberg,_Bavaria'
			],
			expected: {
				wikiUrl: 'https://en.wikipedia.org/'
			}
		}, {
			input: [
				'http://de.wikipedia.org/wiki/K%C3%B6nigsberg_in_Bayern',
				'http://de.wikipedia.org/wiki/K%C3%B6nigsberg_in_Bayern?uselang=en',
				'de.wikipedia.org/wiki/K%C3%B6nigsberg_in_Bayern',
				'de.wikipedia.org/wiki/K%C3%B6nigsberg_in_Bayern?uselang=de',
				'http://de.wikipedia.org/w/index.php?title=K%C3%B6nigsberg_in_Bayern',
				'http://de.wikipedia.org/w/index.php?title=K%C3%B6nigsberg_in_Bayern&uselang=de',
				'de.wikipedia.org/w/index.php?title=K%C3%B6nigsberg_in_Bayern',
				'de.wikipedia.org/w/index.php?title=K%C3%B6nigsberg_in_Bayern&uselang=de'
			],
			expected: {
				wikiUrl: 'https://de.wikipedia.org/'
			}
		}, {
			input: [
				'https://commons.wikimedia.org/wiki/User:Seeteufel',
				'commons.wikimedia.org/wiki/User:Seeteufel'
			],
			expected: {
				wikiUrl: 'https://commons.wikimedia.org/'
			}
		}
	];

	/**
	 * @param {Object} testCase
	 * @param {string} currentInput
	 */
	function assertReturnedImageObjects( testCase, currentInput ) {
		QUnit.stop();

		inputHandler.getFilename( currentInput )
			.done( function( prefixedFilenameOrImageInfos, wikiUrl ) {
				assert.ok(
					$.isArray( prefixedFilenameOrImageInfos )
					&& prefixedFilenameOrImageInfos[ 0 ] instanceof ImageInfo,
					'Received ImageInfo objects for input "' + currentInput + '".'
				);

				assert.strictEqual(
					wikiUrl,
					testCase.expected.wikiUrl,
					'Detected correct wiki URL "' + testCase.expected.wikiUrl + '" on '
					+ 'input "' + currentInput + '".'
				);
			} )
			.fail( function( error ) {
				assert.ok(
					false,
					'Parsing input "' + currentInput + '" failed with message "' + error.getMessage()
					+ '".'
				);
			} )
			.always( function() {
				QUnit.start();
			} );
	}

	for( var i = 0; i < testCases.length; i++ ) {
		var testCase = testCases[ i ];

		for( var j = 0; j < testCase.input.length; j++ ) {
			assertReturnedImageObjects( testCase, testCase.input[ j ] );
		}

	}
} );

QUnit.test( 'getFilename returns an error when given non-wikimedia/wikipedia URL', function( assert ) {
	var inputHandler = new InputHandler( api );

	var testCases = [
		'https://www.wikimedia.de/w/images.homepage/d/d6/Pavel_Richter_WMDE.JPG',
		'https://www.wikimedia.de/w/images.homepage/d/d6/',
		'http://foo.bar'
	];

	/**
	 * @param {string} input
	 */
	function testGetFilenameRejectsInput( input ) {
		QUnit.stop();

		inputHandler.getFilename( input )
			.done( function() {
				assert.ok( false, 'Parsing "' + input + '" succeeded while error has been expected' );
			} )
			.fail( function( error ) {
				assert.equal( error.getMessage(), Messages.t( 'error.url-invalid' ) );
			} )
			.always( function() {
				QUnit.start();
			} );
	}

	for( var i = 0; i < testCases.length; i++ ) {
		testGetFilenameRejectsInput( testCases[ i ] );
	}
} );
