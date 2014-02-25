( function( define ) {

define(
	['qunit', 'jquery', 'AttributionGenerator', 'tests/assets'],
	function( QUnit, $, AttributionGenerator, testAssets ) {

QUnit.module( 'AttributionGenerator' );

var testCasesDefinitions = {
	'LRO_Tycho_Central_Peak.jpg': [{
		expected: {
			raw: null,
			text: null,
			html: null
		}
	}],
	'Helene Fischer 2010.jpg': [{
		expected: {
			raw: $( document.createTextNode( 'Fleyx24 (http://commons.wikimedia.org/wiki/File:Helene Fischer 2010.jpg), „Helene Fischer 2010“, http://creativecommons.org/licenses/by-sa/3.0/legalcode/' ) ),
			text: $( '<div class="attribution"><span class="attribution-author">Fleyx24</span> <span class="attribution-url">(http://commons.wikimedia.org/wiki/File:Helene Fischer 2010.jpg)</span>, <span class="attribution-title">„Helene Fischer 2010“</span>, <span class="attribution-licence">http://creativecommons.org/licenses/by-sa/3.0/legalcode/</span></div>' ),
			html: $( '<div class="attribution"><span class="attribution-author"><a href="http://commons.wikimedia.org/wiki/User:Fleyx24">Fleyx24</a></span>, <span class="attribution-title"><a href="http://commons.wikimedia.org/wiki/File:Helene Fischer 2010.jpg">„Helene Fischer 2010“</a></span>, <span class="attribution-licence"><a href="http://creativecommons.org/licenses/by-sa/3.0/legalcode/">CC BY-SA 3.0</a></span></div>' )
		}
	}, {
		options: { editor: 'edited by Editor' },
		expected: {
			raw: $( document.createTextNode( 'Fleyx24 (http://commons.wikimedia.org/wiki/File:Helene Fischer 2010.jpg), „Helene Fischer 2010“ edited by Editor, http://creativecommons.org/licenses/by-sa/3.0/legalcode/' ) ),
			text: $( '<div class="attribution"><span class="attribution-author">Fleyx24</span> <span class="attribution-url">(http://commons.wikimedia.org/wiki/File:Helene Fischer 2010.jpg)</span>, <span class="attribution-title">„Helene Fischer 2010“</span> <span class="attribution-editor">edited by Editor</span>, <span class="attribution-licence">http://creativecommons.org/licenses/by-sa/3.0/legalcode/</span></div>' ),
			html: $( '<div class="attribution"><span class="attribution-author"><a href="http://commons.wikimedia.org/wiki/User:Fleyx24">Fleyx24</a></span>, <span class="attribution-title"><a href="http://commons.wikimedia.org/wiki/File:Helene Fischer 2010.jpg">„Helene Fischer 2010“</a></span> <span class="attribution-editor">edited by Editor</span>, <span class="attribution-licence"><a href="http://creativecommons.org/licenses/by-sa/3.0/legalcode/">CC BY-SA 3.0</a></span></div>' )
		}
	}, {
		options: { licenceOnly: true },
		expected: {
			raw: $( document.createTextNode( 'http://creativecommons.org/licenses/by-sa/3.0/legalcode/' ) ),
			text: $( '<div class="attribution"><span class="attribution-licence">http://creativecommons.org/licenses/by-sa/3.0/legalcode/</span></div>' ),
			html: $( '<div class="attribution"><span class="attribution-licence"><a href="http://creativecommons.org/licenses/by-sa/3.0/legalcode/">CC BY-SA 3.0</a></span></div>' )
		}
	}, {
		options: { licenceLink: false },
		expected: {
			raw: $( document.createTextNode( 'Fleyx24 (http://commons.wikimedia.org/wiki/File:Helene Fischer 2010.jpg), „Helene Fischer 2010“, CC BY-SA 3.0' ) ),
			text: $( '<div class="attribution"><span class="attribution-author">Fleyx24</span> <span class="attribution-url">(http://commons.wikimedia.org/wiki/File:Helene Fischer 2010.jpg)</span>, <span class="attribution-title">„Helene Fischer 2010“</span>, <span class="attribution-licence">CC BY-SA 3.0</span></div>' ),
			html: $( '<div class="attribution"><span class="attribution-author"><a href="http://commons.wikimedia.org/wiki/User:Fleyx24">Fleyx24</a></span>, <span class="attribution-title"><a href="http://commons.wikimedia.org/wiki/File:Helene Fischer 2010.jpg">„Helene Fischer 2010“</a></span>, <span class="attribution-licence">CC BY-SA 3.0</span></div>' )
		}
	}, {
		options: { editor: 'edited by Editor', licenceOnly: true },
		expected: {
			raw: $( document.createTextNode( 'http://creativecommons.org/licenses/by-sa/3.0/legalcode/' ) ),
			text: $( '<div class="attribution"><span class="attribution-licence">http://creativecommons.org/licenses/by-sa/3.0/legalcode/</span></div>' ),
			html: $( '<div class="attribution"><span class="attribution-licence"><a href="http://creativecommons.org/licenses/by-sa/3.0/legalcode/">CC BY-SA 3.0</a></span></div>' )
		}
	}, {
		options: { editor: 'edited by Editor', licenceLink: false },
		expected: {
			raw: $( document.createTextNode( 'Fleyx24 (http://commons.wikimedia.org/wiki/File:Helene Fischer 2010.jpg), „Helene Fischer 2010“ edited by Editor, CC BY-SA 3.0' ) ),
			text: $( '<div class="attribution"><span class="attribution-author">Fleyx24</span> <span class="attribution-url">(http://commons.wikimedia.org/wiki/File:Helene Fischer 2010.jpg)</span>, <span class="attribution-title">„Helene Fischer 2010“</span> <span class="attribution-editor">edited by Editor</span>, <span class="attribution-licence">CC BY-SA 3.0</span></div>' ),
			html: $( '<div class="attribution"><span class="attribution-author"><a href="http://commons.wikimedia.org/wiki/User:Fleyx24">Fleyx24</a></span>, <span class="attribution-title"><a href="http://commons.wikimedia.org/wiki/File:Helene Fischer 2010.jpg">„Helene Fischer 2010“</a></span> <span class="attribution-editor">edited by Editor</span>, <span class="attribution-licence">CC BY-SA 3.0</span></div>' )
		}
	}, {
		options: { licenceOnly: true, licenceLink: false },
		expected: {
			raw: $( document.createTextNode( 'CC BY-SA 3.0' ) ),
			text: $( '<div class="attribution"><span class="attribution-licence">CC BY-SA 3.0</span></div>' ),
			html: $( '<div class="attribution"><span class="attribution-licence">CC BY-SA 3.0</span></div>' )
		}
	}],
	'JapaneseToiletControlPanel.jpg': [{
		expected: {
			raw: $( document.createTextNode( 'Chris 73 / Wikimedia Commons (http://commons.wikimedia.org/wiki/File:JapaneseToiletControlPanel.jpg), „JapaneseToiletControlPanel“, http://creativecommons.org/licenses/by-sa/3.0/legalcode/' ) ),
			text: $( '<div class="attribution">Chris 73 / Wikimedia Commons <span class="attribution-url">(http://commons.wikimedia.org/wiki/File:JapaneseToiletControlPanel.jpg)</span>, <span class="attribution-title">„JapaneseToiletControlPanel“</span>, <span class="attribution-licence">http://creativecommons.org/licenses/by-sa/3.0/legalcode/</span></div>' ),
			html: $( '<div class="attribution"><a href="http://commons.wikimedia.org/wiki/User:Chris_73">Chris 73</a> / <a href="http://commons.wikimedia.org/">Wikimedia Commons</a>, <span class="attribution-title"><a href="http://commons.wikimedia.org/wiki/File:JapaneseToiletControlPanel.jpg">„JapaneseToiletControlPanel“</a></span>, <span class="attribution-licence"><a href="http://creativecommons.org/licenses/by-sa/3.0/legalcode/">CC BY-SA 3.0</a></span></div>' )
		}
	}],
	'Statue Andrrea Palladio Vicenza.jpg': [{
		expected: {
			raw: null,
			text: null,
			html: null
		}
	}]
};

QUnit.test( 'equals()', function( assert ) {

	$.each( testCasesDefinitions, function( filename, testCases ) {
		var asset = testAssets[filename];

		$.each( testCases, function( i, testCase ) {
			var options = $.extend( {}, testCase.options || {} ),
				attributionGenerator = new AttributionGenerator( asset, options );

			$.each( testCasesDefinitions, function( filename2, testCases2 ) {
				var asset2 = testAssets[filename2];

				$.each( testCases2, function( j, testCase2 ) {
					var options2 = $.extend( {}, testCase2.options || {} ),
						attributionGenerator2 = new AttributionGenerator( asset2, options2 );

					if( filename === filename2 && i === j ) {
						assert.ok(
							attributionGenerator.equals( attributionGenerator2 ),
							'(' + asset.getTitle() + ' #' + i + '), (' + asset2.getTitle() + ' #'
								+ j + ') AttributionGenerators match.'
						);
					} else {
						assert.ok(
							!attributionGenerator.equals( attributionGenerator2 ),
							'(' + asset.getTitle() + ' #' + i + '), (' + asset2.getTitle() + ' #'
								+ j + ') AttributionGenerator mismatch.'
						);
					}
				} );

			} );

		} );

	} );

} );

QUnit.test( 'generate()', function( assert ) {

	$.each( testCasesDefinitions, function( filename, testCases ) {
		var asset = testAssets[filename];

		$.each( testCases, function( i, testCase ) {
			var options = $.extend( {}, testCase.options || {} );

			$.each( testCase.expected, function( mode, $expected ) {
				var attributionGenerator = new AttributionGenerator( asset, $.extend( options, {
					format: mode === 'html' ? 'html' : 'text'
				} ) );

				var $attribution = attributionGenerator.generate( mode === 'raw' ),
					actualHtml = $( '<div/>' ).append( $attribution ).html(),
					expectedHtml = $( '<div/>' ).append( $expected ).html();

				assert.equal(
					actualHtml,
					expectedHtml,
					'(' + asset.getTitle() + ') Actual result matches expected (' + mode
						+ ').'
				);

			} );
		} );
	} );

} );

} );

}( define ) );
