( function( define ) {

define(
	['qunit', 'jquery', 'Questionnaire', 'tests/assets'],
	function( QUnit, $, Questionnaire, testAssets ) {

QUnit.module( 'Questionnaire' );

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

	/**
	 * Object containing the expected templates to be used in the supplement. "la" sub-object
	 * is used to overwrite the Questionnaire's _loggedAnswers object.
	 * @type {Object}
	 */
	var expectedTemplates = {
		'Helene Fischer 2010.jpg': [ {
			la: {}, // Assertion #1
			templates: ['r-note-text', 'r-restrictions']
		},
		// 1st level:
		{
			la: { '3': { 1: true } },
			templates: ['r-note-html', 'r-restrictions']
		}, {
			la: { '3': { 2: true } },
			templates: ['r-note-text', 'r-restrictions']
		}, {
			la: { '3': { 3: true } }, // exit
			templates: ['r-note-privateUse']
		}, {
			la: { '3': { 4: true } },
			templates: ['r-note-text', 'r-restrictions']
		}, {
			la: { '3': { 5: true } }, // exit
			templates: []
		},
		// 2nd level:
		{
			la: { '3': { 1: true }, '7': { 1: true } },
			templates: ['r-note-html', 'r-restrictions', 'r-note-collection']
		}, {
			la: { '3': { 1: true }, '7': { 2: true } },
			templates: ['r-note-html', 'r-restrictions']
		}, {
			la: { '3': { 2: true }, '7': { 1: true } },
			templates: ['r-note-text', 'r-restrictions', 'r-note-collection']
		}, { // #10
			la: { '3': { 2: true }, '7': { 2: true } },
			templates: ['r-note-text', 'r-restrictions']
		}, {
			la: { '3': { 4: true }, '5': { 1: true } }, // restart
			templates: ['r-note-text', 'r-restrictions']
		}, {
			la: { '3': { 4: true }, '5': { 2: true } }, //exit
			templates: ['r-note-text', 'r-restrictions']
		},
		// 3rd level:
		{
			la: { '3': { 1: true }, '7': { 1: true }, '12a': { 1: true } }, // exit
			templates: ['r-note-html', 'r-restrictions', 'r-note-collection']
		}, {
			la: { '3': { 1: true }, '7': { 1: true }, '12a': { 2: true } },
			templates: ['r-note-html', 'r-restrictions', 'r-note-collection']
		}, {
			la: { '3': { 1: true }, '7': { 2: true }, '12a': { 1: true } }, // exit
			templates: ['r-note-html', 'r-restrictions']
		}, {
			la: { '3': { 1: true }, '7': { 2: true }, '12a': { 2: true } },
			templates: ['r-note-html', 'r-restrictions']
		}, {
			la: { '3': { 2: true }, '7': { 1: true }, '8': { 1: true } },
			templates: ['r-note-text', 'r-restrictions', 'r-note-collection', 'r-note-fullLicence']
		}, {
			la: { '3': { 2: true }, '7': { 1: true }, '8': { 2: true } },
			templates: ['r-note-text', 'r-restrictions', 'r-note-collection']
		}, {
			la: { '3': { 2: true }, '7': { 2: true }, '8': { 1: true } },
			templates: ['r-note-text', 'r-restrictions', 'r-note-fullLicence']
		}, { // #20
			la: { '3': { 2: true }, '7': { 2: true }, '8': { 2: true } },
			templates: ['r-note-text', 'r-restrictions']
		},
		// 4th level:
		{
			la: { '3': { 1: true }, '7': { 1: true }, '12a': { 2: true }, '12b': { 1: true } },
			templates: ['r-note-html', 'r-restrictions', 'r-note-collection']
		}, {
			la: { '3': { 1: true }, '7': { 2: true }, '12a': { 2: true }, '12b': { 1: true } },
			templates: ['r-note-html', 'r-restrictions']
		}, {
			la: { '3': { 1: true }, '7': { 1: true }, '12a': { 2: true }, '12b': { 2: true } }, // exit (unsupported)
			templates: ['r-note-html', 'r-restrictions', 'r-note-collection']
		}, {
			la: { '3': { 1: true }, '7': { 2: true }, '12a': { 2: true }, '12b': { 2: true } }, // exit (unsupported)
			templates: ['r-note-html', 'r-restrictions']
		}, {
			la: { '3': { 1: true }, '7': { 1: true }, '12a': { 2: true }, '12b': { 3: true } }, // exit (unsupported)
			templates: ['r-note-html', 'r-restrictions', 'r-note-collection']
		}, {
			la: { '3': { 1: true }, '7': { 2: true }, '12a': { 2: true }, '12b': { 3: true } }, // exit (unsupported)
			templates: [ 'r-note-html', 'r-restrictions' ]
		}, {
			la: { '3': { 2: true }, '7': { 1: true }, '8': { 1: true }, '12a': { 1: true } }, // exit
			templates: ['r-note-text', 'r-restrictions', 'r-note-collection', 'r-note-fullLicence']
		}, {
			la: { '3': { 2: true }, '7': { 2: true }, '8': { 1: true }, '12a': { 1: true } }, // exit
			templates: ['r-note-text', 'r-restrictions', 'r-note-fullLicence']
		}, {
			la: { '3': { 2: true }, '7': { 1: true }, '8': { 2: true }, '12a': { 1: true } }, // exit
			templates: ['r-note-text', 'r-restrictions', 'r-note-collection']
		}, { // #30
			la: { '3': { 2: true }, '7': { 2: true }, '8': { 2: true }, '12a': { 1: true } }, // exit
			templates: ['r-note-text', 'r-restrictions']
		}, {
			la: { '3': { 2: true }, '7': { 1: true }, '8': { 1: true }, '12a': { 2: true } },
			templates: ['r-note-text', 'r-restrictions', 'r-note-collection', 'r-note-fullLicence']
		}, {
			la: { '3': { 2: true }, '7': { 2: true }, '8': { 1: true }, '12a': { 2: true } },
			templates: ['r-note-text', 'r-restrictions', 'r-note-fullLicence']
		}, {
			la: { '3': { 2: true }, '7': { 1: true }, '8': { 2: true }, '12a': { 2: true } },
			templates: ['r-note-text', 'r-restrictions', 'r-note-collection']
		}, {
			la: { '3': { 2: true }, '7': { 2: true }, '8': { 2: true }, '12a': { 2: true } },
			templates: ['r-note-text', 'r-restrictions']
		},
		// 5th level:
		{
			la: { '3': { 1: true }, '7': { 1: true }, '12a': { 2: true }, '12b': { 1: true }, '13': { 1: 'Editor' } }, // exit
			templates: ['r-note-html', 'r-restrictions', 'r-note-collection']
		}, {
			la: { '3': { 1: true }, '7': { 2: true }, '12a': { 2: true }, '12b': { 1: true }, '13': { 1: 'Editor' } }, // exit
			templates: ['r-note-html', 'r-restrictions']
		}, {
			la: { '3': { 2: true }, '7': { 1: true }, '8': { 1: true }, '12a': { 2: true }, '12b': { 1: true } },
			templates: ['r-note-text', 'r-restrictions', 'r-note-collection', 'r-note-fullLicence']
		}, {
			la: { '3': { 2: true }, '7': { 2: true }, '8': { 1: true }, '12a': { 2: true }, '12b': { 1: true } },
			templates: ['r-note-text', 'r-restrictions', 'r-note-fullLicence']
		}, {
			la: { '3': { 2: true }, '7': { 1: true }, '8': { 2: true }, '12a': { 2: true }, '12b': { 1: true } },
			templates: ['r-note-text', 'r-restrictions', 'r-note-collection']
		}, { // #40
			la: { '3': { 2: true }, '7': { 2: true }, '8': { 2: true }, '12a': { 2: true }, '12b': { 1: true } },
			templates: ['r-note-text', 'r-restrictions']
		}, {
			la: { '3': { 2: true }, '7': { 1: true }, '8': { 1: true }, '12a': { 2: true }, '12b': { 2: true } }, // exit & unsupported
			templates: ['r-note-text', 'r-restrictions', 'r-note-collection', 'r-note-fullLicence']
		}, {
			la: { '3': { 2: true }, '7': { 2: true }, '8': { 1: true }, '12a': { 2: true }, '12b': { 2: true } }, // exit & unsupported
			templates: ['r-note-text', 'r-restrictions', 'r-note-fullLicence']
		}, {
			la: { '3': { 2: true }, '7': { 1: true }, '8': { 2: true }, '12a': { 2: true }, '12b': { 2: true } }, // exit & unsupported
			templates: ['r-note-text', 'r-restrictions', 'r-note-collection']
		}, {
			la: { '3': { 2: true }, '7': { 2: true }, '8': { 2: true }, '12a': { 2: true }, '12b': { 2: true } }, // exit & unsupported
			templates: ['r-note-text', 'r-restrictions']
		}, {
			la: { '3': { 2: true }, '7': { 1: true }, '8': { 1: true }, '12a': { 2: true }, '12b': { 3: true } }, // exit & unsupported
			templates: ['r-note-text', 'r-restrictions', 'r-note-collection', 'r-note-fullLicence']
		}, {
			la: { '3': { 2: true }, '7': { 2: true }, '8': { 1: true }, '12a': { 2: true }, '12b': { 3: true } }, // exit & unsupported
			templates: ['r-note-text', 'r-restrictions', 'r-note-fullLicence']
		}, {
			la: { '3': { 2: true }, '7': { 1: true }, '8': { 2: true }, '12a': { 2: true }, '12b': { 3: true } }, // exit & unsupported
			templates: ['r-note-text', 'r-restrictions', 'r-note-collection']
		}, {
			la: { '3': { 2: true }, '7': { 2: true }, '8': { 2: true }, '12a': { 2: true }, '12b': { 3: true } }, // exit & unsupported
			templates: ['r-note-text', 'r-restrictions']
		},
		// 6th level:
		{
			la: { '3': { 2: true }, '7': { 1: true }, '8': { 1: true }, '12a': { 2: true }, '12b': { 1: true }, '13': { 1: 'Editor' } }, // exit
			templates: ['r-note-text', 'r-restrictions', 'r-note-collection', 'r-note-fullLicence']
		}, { // #50
			la: { '3': { 2: true }, '7': { 2: true }, '8': { 1: true }, '12a': { 2: true }, '12b': { 1: true }, '13': { 1: 'Editor' } }, // exit
			templates: ['r-note-text', 'r-restrictions', 'r-note-fullLicence']
		}, {
			la: { '3': { 2: true }, '7': { 1: true }, '8': { 2: true }, '12a': { 2: true }, '12b': { 1: true }, '13': { 1: 'Editor' } }, // exit
			templates: ['r-note-text', 'r-restrictions', 'r-note-collection']
		}, {
			la: { '3': { 2: true }, '7': { 2: true }, '8': { 2: true }, '12a': { 2: true }, '12b': { 1: true }, '13': { 1: 'Editor' } }, // exit
			templates: ['r-note-text', 'r-restrictions']
		} ],
		'Wien Karlsplatz3.jpg': [ {
			la: {},
			templates: ['r-note-text', 'r-restrictions-cc2']
		} ],
		'LRO_Tycho_Central_Peak.jpg': [ {
			la: {},
			templates: ['r-note-pd']
		} ],
		'Statue Andrrea Palladio Vicenza.jpg': [ {
			la: {},
			templates: ['r-note-cc0']
		} ]
	};

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

				if( error ) {
					console.error( $pages );
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

	$.each( expectedTemplates, function( filename, testCases ) {
		var testAsset = testAssets[filename];

		for( var i = 0; i < testCases.length; i++ ) {
			var testCase = testCases[i];

			( function( testStack, testAsset, testCase ) {
				testStack.push( function() {
					return assertProperTemplateUsage( testAsset, testCase );
				} );
			}( testStack, testAsset, testCase ) );

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

}( define ) );
