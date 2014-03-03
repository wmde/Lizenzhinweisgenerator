( function( QUnit ) {
'use strict';

define(
	['jquery', 'app/Questionnaire', 'app/AttributionGenerator', 'tests/assets'],
	function( $, Questionnaire, AttributionGenerator, testAssets ) {

QUnit.module( 'Questionnaire' );

/**
 * Object containing the test cases for the Questionnaire constructur. The "la" sub-object is used
 * to overwrite the Questionnaire's _loggedAnswers object.
 * @type {Object}
 */
var testSets = {
	'Helene Fischer 2010.jpg': [ {
		la: {}, // Assertion #1
		templates: ['result-note-text', 'result-restrictions']
	},
	// 1st level:
	{
		la: { '3': { 1: true } },
		templates: ['result-note-html', 'result-restrictions'],
		attrGenOpt: { format: 'html' }
	}, {
		la: { '3': { 2: true } },
		templates: ['result-note-text', 'result-restrictions']
	}, {
		la: { '3': { 3: true } }, // exit
		templates: ['result-note-privateUse']
	}, {
		la: { '3': { 4: true } },
		templates: ['result-note-text', 'result-restrictions']
	}, {
		la: { '3': { 5: true } }, // exit
		templates: []
	},
	// 2nd level:
	{
		la: { '3': { 1: true }, '7': { 1: true } },
		templates: ['result-note-html', 'result-restrictions', 'result-note-collection'],
		attrGenOpt: { format: 'html' }
	}, {
		la: { '3': { 1: true }, '7': { 2: true } },
		templates: ['result-note-html', 'result-restrictions'],
		attrGenOpt: { format: 'html' }
	}, {
		la: { '3': { 2: true }, '7': { 1: true } },
		templates: ['result-note-text', 'result-restrictions', 'result-note-collection']
	}, { // #10
		la: { '3': { 2: true }, '7': { 2: true } },
		templates: ['result-note-text', 'result-restrictions']
	}, {
		la: { '3': { 4: true }, '5': { 1: true } }, // restart
		templates: ['result-note-text', 'result-restrictions']
	}, {
		la: { '3': { 4: true }, '5': { 2: true } }, //exit
		templates: ['result-note-text', 'result-restrictions']
	},
	// 3rd level:
	{
		la: { '3': { 1: true }, '7': { 1: true }, '12a': { 1: true } }, // exit
		templates: ['result-note-html', 'result-restrictions', 'result-note-collection'],
		attrGenOpt: { format: 'html' }
	}, {
		la: { '3': { 1: true }, '7': { 1: true }, '12a': { 2: true } },
		templates: ['result-note-html', 'result-restrictions', 'result-note-collection'],
		attrGenOpt: { editor: '(bearbeitet)', format: 'html' }
	}, {
		la: { '3': { 1: true }, '7': { 2: true }, '12a': { 1: true } }, // exit
		templates: ['result-note-html', 'result-restrictions'],
		attrGenOpt: { format: 'html' }
	}, {
		la: { '3': { 1: true }, '7': { 2: true }, '12a': { 2: true } },
		templates: ['result-note-html', 'result-restrictions'],
		attrGenOpt: { editor: '(bearbeitet)', format: 'html' }
	}, {
		la: { '3': { 2: true }, '7': { 1: true }, '8': { 1: true } },
		templates: ['result-note-text', 'result-restrictions', 'result-note-collection', 'result-note-fullLicence'],
		attrGenOpt: { licenceLink: false }
	}, {
		la: { '3': { 2: true }, '7': { 1: true }, '8': { 2: true } },
		templates: ['result-note-text', 'result-restrictions', 'result-note-collection']
	}, {
		la: { '3': { 2: true }, '7': { 2: true }, '8': { 1: true } },
		templates: ['result-note-text', 'result-restrictions', 'result-note-fullLicence'],
		attrGenOpt: { licenceLink: false }
	}, { // #20
		la: { '3': { 2: true }, '7': { 2: true }, '8': { 2: true } },
		templates: ['result-note-text', 'result-restrictions']
	},
	// 4th level:
	{
		la: { '3': { 1: true }, '7': { 1: true }, '12a': { 2: true }, '12b': { 1: true } },
		templates: ['result-note-html', 'result-restrictions', 'result-note-collection'],
		attrGenOpt: { editor: '(bearbeitet)', format: 'html' }
	}, {
		la: { '3': { 1: true }, '7': { 2: true }, '12a': { 2: true }, '12b': { 1: true } },
		templates: ['result-note-html', 'result-restrictions'],
		attrGenOpt: { editor: '(bearbeitet)', format: 'html' }
	}, {
		la: { '3': { 1: true }, '7': { 1: true }, '12a': { 2: true }, '12b': { 2: true } }, // exit (unsupported)
		templates: ['result-note-html', 'result-restrictions', 'result-note-collection'],
		attrGenOpt: { editor: '(bearbeitet)', format: 'html' }
	}, {
		la: { '3': { 1: true }, '7': { 2: true }, '12a': { 2: true }, '12b': { 2: true } }, // exit (unsupported)
		templates: ['result-note-html', 'result-restrictions'],
		attrGenOpt: { editor: '(bearbeitet)', format: 'html' }
	}, {
		la: { '3': { 1: true }, '7': { 1: true }, '12a': { 2: true }, '12b': { 3: true } }, // exit (unsupported)
		templates: ['result-note-html', 'result-restrictions', 'result-note-collection'],
		attrGenOpt: { editor: '(bearbeitet)', format: 'html' }
	}, {
		la: { '3': { 1: true }, '7': { 2: true }, '12a': { 2: true }, '12b': { 3: true } }, // exit (unsupported)
		templates: ['result-note-html', 'result-restrictions'],
		attrGenOpt: { editor: '(bearbeitet)', format: 'html' }
	}, {
		la: { '3': { 2: true }, '7': { 1: true }, '8': { 1: true }, '12a': { 1: true } }, // exit
		templates: ['result-note-text', 'result-restrictions', 'result-note-collection', 'result-note-fullLicence'],
		attrGenOpt: { licenceLink: false }
	}, {
		la: { '3': { 2: true }, '7': { 2: true }, '8': { 1: true }, '12a': { 1: true } }, // exit
		templates: ['result-note-text', 'result-restrictions', 'result-note-fullLicence'],
		attrGenOpt: { licenceLink: false }
	}, {
		la: { '3': { 2: true }, '7': { 1: true }, '8': { 2: true }, '12a': { 1: true } }, // exit
		templates: ['result-note-text', 'result-restrictions', 'result-note-collection']
	}, { // #30
		la: { '3': { 2: true }, '7': { 2: true }, '8': { 2: true }, '12a': { 1: true } }, // exit
		templates: ['result-note-text', 'result-restrictions']
	}, {
		la: { '3': { 2: true }, '7': { 1: true }, '8': { 1: true }, '12a': { 2: true } },
		templates: ['result-note-text', 'result-restrictions', 'result-note-collection', 'result-note-fullLicence'],
		attrGenOpt: { editor: '(bearbeitet)', licenceLink: false }
	}, {
		la: { '3': { 2: true }, '7': { 2: true }, '8': { 1: true }, '12a': { 2: true } },
		templates: ['result-note-text', 'result-restrictions', 'result-note-fullLicence'],
		attrGenOpt: { editor: '(bearbeitet)', licenceLink: false }
	}, {
		la: { '3': { 2: true }, '7': { 1: true }, '8': { 2: true }, '12a': { 2: true } },
		templates: ['result-note-text', 'result-restrictions', 'result-note-collection'],
		attrGenOpt: { editor: '(bearbeitet)' }
	}, {
		la: { '3': { 2: true }, '7': { 2: true }, '8': { 2: true }, '12a': { 2: true } },
		templates: ['result-note-text', 'result-restrictions'],
		attrGenOpt: { editor: '(bearbeitet)' }
	},
	// 5th level:
	{
		la: { '3': { 1: true }, '7': { 1: true }, '12a': { 2: true }, '12b': { 1: true }, '13': { 1: 'Editor' } }, // exit
		templates: ['result-note-html', 'result-restrictions', 'result-note-collection'],
		attrGenOpt: { editor: 'Editor', format: 'html' }
	}, {
		la: { '3': { 1: true }, '7': { 2: true }, '12a': { 2: true }, '12b': { 1: true }, '13': { 1: 'Editor' } }, // exit
		templates: ['result-note-html', 'result-restrictions'],
		attrGenOpt: { editor: 'Editor', format: 'html' }
	}, {
		la: { '3': { 2: true }, '7': { 1: true }, '8': { 1: true }, '12a': { 2: true }, '12b': { 1: true } },
		templates: ['result-note-text', 'result-restrictions', 'result-note-collection', 'result-note-fullLicence'],
		attrGenOpt: { editor: '(bearbeitet)', licenceLink: false }
	}, {
		la: { '3': { 2: true }, '7': { 2: true }, '8': { 1: true }, '12a': { 2: true }, '12b': { 1: true } },
		templates: ['result-note-text', 'result-restrictions', 'result-note-fullLicence'],
		attrGenOpt: { editor: '(bearbeitet)', licenceLink: false }
	}, {
		la: { '3': { 2: true }, '7': { 1: true }, '8': { 2: true }, '12a': { 2: true }, '12b': { 1: true } },
		templates: ['result-note-text', 'result-restrictions', 'result-note-collection'],
		attrGenOpt: { editor: '(bearbeitet)' }
	}, { // #40
		la: { '3': { 2: true }, '7': { 2: true }, '8': { 2: true }, '12a': { 2: true }, '12b': { 1: true } },
		templates: ['result-note-text', 'result-restrictions'],
			attrGenOpt: { editor: '(bearbeitet)' }
	}, {
		la: { '3': { 2: true }, '7': { 1: true }, '8': { 1: true }, '12a': { 2: true }, '12b': { 2: true } }, // exit & unsupported
		templates: ['result-note-text', 'result-restrictions', 'result-note-collection', 'result-note-fullLicence'],
		attrGenOpt: { editor: '(bearbeitet)', licenceLink: false }
	}, {
		la: { '3': { 2: true }, '7': { 2: true }, '8': { 1: true }, '12a': { 2: true }, '12b': { 2: true } }, // exit & unsupported
		templates: ['result-note-text', 'result-restrictions', 'result-note-fullLicence'],
		attrGenOpt: { editor: '(bearbeitet)', licenceLink: false }
	}, {
		la: { '3': { 2: true }, '7': { 1: true }, '8': { 2: true }, '12a': { 2: true }, '12b': { 2: true } }, // exit & unsupported
		templates: ['result-note-text', 'result-restrictions', 'result-note-collection'],
		attrGenOpt: { editor: '(bearbeitet)' }
	}, {
		la: { '3': { 2: true }, '7': { 2: true }, '8': { 2: true }, '12a': { 2: true }, '12b': { 2: true } }, // exit & unsupported
		templates: ['result-note-text', 'result-restrictions'],
		attrGenOpt: { editor: '(bearbeitet)' }
	}, {
		la: { '3': { 2: true }, '7': { 1: true }, '8': { 1: true }, '12a': { 2: true }, '12b': { 3: true } }, // exit & unsupported
		templates: ['result-note-text', 'result-restrictions', 'result-note-collection', 'result-note-fullLicence'],
		attrGenOpt: { editor: '(bearbeitet)', licenceLink: false }
	}, {
		la: { '3': { 2: true }, '7': { 2: true }, '8': { 1: true }, '12a': { 2: true }, '12b': { 3: true } }, // exit & unsupported
		templates: ['result-note-text', 'result-restrictions', 'result-note-fullLicence'],
		attrGenOpt: { editor: '(bearbeitet)', licenceLink: false }
	}, {
		la: { '3': { 2: true }, '7': { 1: true }, '8': { 2: true }, '12a': { 2: true }, '12b': { 3: true } }, // exit & unsupported
		templates: ['result-note-text', 'result-restrictions', 'result-note-collection'],
		attrGenOpt: { editor: '(bearbeitet)' }
	}, {
		la: { '3': { 2: true }, '7': { 2: true }, '8': { 2: true }, '12a': { 2: true }, '12b': { 3: true } }, // exit & unsupported
		templates: ['result-note-text', 'result-restrictions'],
		attrGenOpt: { editor: '(bearbeitet)' }
	},
	// 6th level:
	{
		la: { '3': { 2: true }, '7': { 1: true }, '8': { 1: true }, '12a': { 2: true }, '12b': { 1: true }, '13': { 1: 'Editor' } }, // exit
		templates: ['result-note-text', 'result-restrictions', 'result-note-collection', 'result-note-fullLicence'],
		attrGenOpt: { editor: 'Editor', licenceLink: false }
	}, { // #50
		la: { '3': { 2: true }, '7': { 2: true }, '8': { 1: true }, '12a': { 2: true }, '12b': { 1: true }, '13': { 1: 'Editor' } }, // exit
		templates: ['result-note-text', 'result-restrictions', 'result-note-fullLicence'],
		attrGenOpt: { editor: 'Editor', licenceLink: false }
	}, {
		la: { '3': { 2: true }, '7': { 1: true }, '8': { 2: true }, '12a': { 2: true }, '12b': { 1: true }, '13': { 1: 'Editor' } }, // exit
		templates: ['result-note-text', 'result-restrictions', 'result-note-collection'],
		attrGenOpt: { editor: 'Editor' }
	}, {
		la: { '3': { 2: true }, '7': { 2: true }, '8': { 2: true }, '12a': { 2: true }, '12b': { 1: true }, '13': { 1: 'Editor' } }, // exit
		templates: ['result-note-text', 'result-restrictions'],
		attrGenOpt: { editor: 'Editor' }
	} ],
	'Wien Karlsplatz3.jpg': [ {
		la: {},
		templates: ['result-note-text', 'result-restrictions-cc2']
	} ],
	'LRO_Tycho_Central_Peak.jpg': [ {
		la: {},
		templates: ['result-note-pd']
	} ],
	'Statue Andrrea Palladio Vicenza.jpg': [ {
		la: {},
		templates: ['result-note-cc0']
	} ]
};

QUnit.test( 'start()', function( assert ) {
	var questionnaire;

	$.each( testAssets, function( filename, testAsset ) {

		if( testAsset.getLicence() === null ) {
			assert.throws(
				function() {
					questionnaire = new Questionnaire( $( '<div/>' ), testAsset );
				},
				'(' + testAsset.getTitle() + ') Trying to instantiate a questionnaire for an '
					+ 'asset not featuring a proper licence fails.'
			);
		} else {
			questionnaire = new Questionnaire( $( '<div/>' ), testAsset, '..' );

			QUnit.stop();

			questionnaire.start()
			.done( function() {
				assert.ok(
					true,
					'(' + testAsset.getTitle() + ') Started questionnaire.'
				);
			} )
			.fail( function( message ) {
				assert.ok(
					false,
					'(' + testAsset.getTitle() + ') Failed starting questionnaire with error "'
						+ message + '".'
				);
			} )
			.always( function() {
				QUnit.start();
			} );
		}

	} );
} );

QUnit.test( 'exit()', function( assert ) {

	$.each( testAssets, function( filename, testAsset ) {

		if( testAsset.getLicence() === null ) {
			return true;
		}

		var questionnaire = new Questionnaire( $( '<div/>' ), testAsset, '..' ),
			issuedEvent = false;

		assert.throws(
			function() {
				questionnaire.exit();
			},
			'(' + testAsset.getTitle() + ') Throwing error when trying to exit the '
			+ 'questionnaire without it being started.'
		);

		// Overwrite function that only would generate API overhead and are not subject of this
		// test:
		questionnaire.generateSupplement = function() {
			return undefined;
		};
		questionnaire.getAttributionGenerator = function() {
			return undefined;
		};

		questionnaire.start();

		$( questionnaire ).on( 'exit', function() {
			issuedEvent = true;
		} );

		questionnaire.exit();

		assert.ok(
			issuedEvent,
			'(' + testAsset.getTitle() + ') Issuing "exit" function triggered "exit" event.'
		);

		$( questionnaire ).off( 'exit' );

	} );

} );

QUnit.test( 'generateSupplement()', function( assert ) {
	var testStack = [];

	function assertProperTemplateUsage( testAsset, testCase ) {
		var deferred = $.Deferred();

		var questionnaire = new Questionnaire( $( '<div/>' ), testAsset, '..' );

		// Circumvent applying functionality to the raw HTML pages to be able to compare expected
		// and resulting HTML easily:
		questionnaire._applyFunctionality = function( $page ) {
			return $page;
		};

		questionnaire.start().done( function() {
			questionnaire._loggedAnswers = testCase.la;

			questionnaire.generateSupplement()
			.done( function( $node ) {
				var $pages = $node.filter( '.page' ),
					error = false;

				if( $pages.length !== testCase.templates.length ) {
					error = true;
				} else {
					for( var i = 0; i < testCase.templates.length; i++ ) {
						var $page = $pages.filter( '.page-' + testCase.templates[i] );
						// Check if template exists and if it is in the expected position:
						if( $page.length === 0 || $page.get( 0 ) !== $pages.get( i ) ) {
							error = true;
							break;
						}
					}
				}

				assert.ok(
					!error,
					'(' + testAsset.getTitle() + ') Using expected templates ('
						+ testCase.templates.toString() + ').'
				);

			} )
			.fail( function( message ) {
				assert.ok(
					false,
					'(' + testAsset.getTitle() + ') Failed generating supplement '
						+ 'with error "' + message + '".'
				);
			} )
			.always( function() {
				deferred.resolve();
			} );

		} )
		.fail( function( message ) {
			assert.ok(
				false,
				'(' + testAsset.getTitle() + ') Failed starting questionnaire with error "'
					+ message + '".'
			);

			deferred.resolve();
		} );

		return deferred.promise();
	}

	/**
	 * @param {Function[]} testStack
	 * @param {Asset} testAsset
	 * @param {Object} testCase
	 * @return {Function[]}
	 */
	function pushToTestStack( testStack, testAsset, testCase ) {
		testStack.push( function() {
			return assertProperTemplateUsage( testAsset, testCase );
		} );
		return testStack;
	}

	$.each( testSets, function( filename, testCases ) {
		var testAsset = testAssets[filename];

		for( var i = 0; i < testCases.length; i++ ) {
			testStack = pushToTestStack( testStack, testAsset, testCases[i] );
		}
	} );

	function resolveStack( stack ) {
		if( stack.length === 0 ) {
			QUnit.start();
			return;
		}
		stack.shift()().done( function() {
			resolveStack( stack );
		} );
	}

	QUnit.stop();
	resolveStack( testStack );
} );

QUnit.test( 'getAttributionGenerator()', function( assert ) {

	// Validate default AttributionGenerator options since test case definitions assume these to
	// have particular values:
	$.each( testSets, function( filename ) {
		var defaultOptions = {
			editor: null,
			format: 'text',
			licenceOnly: false,
			licenceLink: true
		};

		var attributionGenerator = new AttributionGenerator( testAssets[filename] ),
			mismatch = false;

		$.each( attributionGenerator.getOptions(), function( k, v ) {
			if( defaultOptions[k] !== v ) {
				mismatch = true;
				return false;
			}
		} );

		if( mismatch ) {
			throw new Error( 'Default options mismatch' );
		}

		return false;
	} );

	var testStack = [];

	function assertProperAttributionGenerator( testAsset, testCase ) {
		var deferred = $.Deferred();

		var questionnaire = new Questionnaire( $( '<div/>' ), testAsset, '..' );

		questionnaire.start().done( function() {
			questionnaire._loggedAnswers = testCase.la;

			assert.ok(
				questionnaire.getAttributionGenerator().equals(
					new AttributionGenerator( testAsset, testCase.attrGenOpt )
				),
				'(' + testAsset.getTitle() + ') Validated AttributionGenerator.'
			);

		} )
		.fail( function( message ) {
			assert.ok(
				false,
				'(' + testAsset.getTitle() + ') Failed starting questionnaire with error "'
					+ message + '".'
			);

			deferred.resolve();
		} )
		.always( function() {
			deferred.resolve();
		} );

		return deferred.promise();
	}

	/**
	 * @param {Function[]} testStack
	 * @param {Asset} testAsset
	 * @param {Object} testCase
	 * @return {Function[]}
	 */
	function pushToTestStack( testStack, testAsset, testCase ) {
		testStack.push( function() {
			return assertProperAttributionGenerator( testAsset, testCase );
		} );
		return testStack;
	}

	$.each( testSets, function( filename, testCases ) {
		var testAsset = testAssets[filename];

		for( var i = 0; i < testCases.length; i++ ) {
			pushToTestStack( testStack, testAsset, testCases[i] );
		}
	} );

	function resolveStack( stack ) {
		if( stack.length === 0 ) {
			QUnit.start();
			return;
		}
		stack.shift()().done( function() {
			resolveStack( stack );
		} );
	}

	QUnit.stop();
	resolveStack( testStack );
} );

} );

}( QUnit ) );
