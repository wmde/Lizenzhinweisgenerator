( function( define ) {

	define( ['qunit', 'jquery', 'Api', 'Author'], function( QUnit, $, Api, Author ) {

		QUnit.module( 'Api' );

		var testCases = {
			'LRO_Tycho_Central_Peak.jpg': {
				// Author without link:
				authors: [new Author( $( document.createTextNode( 'NASA / GSFC / Arizona State Univ. / Lunar Reconnaissance Orbiter' ) ) )],
				licenceId: 'PD',
				attribution: null,
				title: 'LRO Tycho Central Peak'
			},
			'Helene Fischer 2010.jpg': {
				// Author with internal wiki link:
				authors: [new Author( $( '<a href="http://commons.wikimedia.org/wiki/User:Fleyx24">Fleyx24</a>' ) )],
				licenceId: 'cc-by-sa-3.0',
				attribution: '',
				title: 'Helene Fischer 2010'
			},
			'JapaneseToiletControlPanel.jpg': {
				authors: [new Author( $( '<a href="http://commons.wikimedia.org/wiki/User:Chris_73">Chris 73</a>' ) )],
				licenceId: 'cc-by-sa-3.0',
				// Complex attribution:
				attribution: $( '<a href="http://commons.wikimedia.org/wiki/User:Chris_73">Chris 73</a> / <a href="http://commons.wikimedia.org/">Wikimedia Commons</a>' ),
				title: 'JapaneseToiletControlPanel'
			},
			'13-09-29-nordfriesisches-wattenmeer-RalfR-15.jpg': {
				// Complex author attribution:
				authors: [new Author( $( '<div/>' ).html( '©&nbsp;<a href="http://commons.wikimedia.org/wiki/User:Ralf_Roletschek">Ralf Roletschek</a> - <a rel="nofollow" href="http://www.roletschek.de">Fahrradtechnik und Fotografie</a>' ).contents() )],
				// Multi-licence-template:
				licenceId: 'cc-by-sa-3.0',
				attribution: null,
				title: '13-09-29-nordfriesisches-wattenmeer-RalfR-15'
			},
			'Statue Andrrea Palladio Vicenza.jpg': {
				// No detectable author:
				authors: [],
				licenceId: 'cc-zero',
				attribution: null,
				title: 'Statue Andrrea Palladio Vicenza'
			},
			'Inisheer Gardens 2002 dry-stone walls.jpg': {
				authors: [new Author( $( '<a href="http://commons.wikimedia.org/wiki/User:Arcimboldo">Eckhard Pecher</a>' ) )],
				// Features additional newer CC-BY-SA licence, preferring non-SA licence:
				licenceId: 'cc-by-2.0-de',
				// Simple attribution:
				attribution: $( '<a href="http://commons.wikimedia.org/wiki/User:Arcimboldo">Eckhard Pecher</a>' ),
				title: 'Inisheer Gardens 2002 dry-stone walls'
			},
			'Wien Karlsplatz3.jpg': {
				// Strip "(talk)" link:
				authors: [new Author( $( '<a href="http://commons.wikimedia.org/wiki/User:Ikar.us">Ikar.us</a>' ) )],
				licenceId: ['cc-by-2.0-de'],
				attribution: null,
				title: 'Wien Karlsplatz3'
			},
			'Brandenburg gate sunset quadriga.jpg': {
				authors: [],
				licenceId: 'cc-by-sa-3.0',
				attribution: null,
				title: 'Brandenburg gate sunset quadriga'
			},
			'Gerardus_t\'_Hooft_at_Harvard.jpg': {
				// Inter-wiki links:
				authors: [new Author( $( '<div/>' ).html( '<a href="http://en.wikipedia.org/wiki/User:Lumidek">Lumidek</a> at <a href="http://en.wikipedia.org/wiki/">English Wikipedia</a>' ).contents() )],
				licenceId: 'cc-by-3.0',
				attribution: null,
				title: 'Gerardus t\' Hooft at Harvard'
			}
		};

		var api = new Api( '//commons.wikimedia.org/w/api.php?callback=?' );

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

			$.each( testCases, function( filename, testCase ) {

				QUnit.stop();

				api.getAsset( filename )
				.done( function( asset ) {

					assert.equal(
						asset.getFilename(),
						filename,
						'Filename "' + asset.getFilename() + '" matches.'
					);

					assert.equal(
						asset.getTitle(),
						testCases[filename].title,
						'Title "' + asset.getTitle() + '" matches.'
					);

					$.each( asset.getAuthors(), function( i, author ) {

						assert.equal(
							author.getText(),
							testCases[filename].authors[i].getText(),
							'"' + filename + '": Author text "' + author.getText() + '" matches.'
						);

						var authorHtml = getHtmlText( author.getHtml() );

						assert.equal(
							authorHtml,
							getHtmlText( testCases[filename].authors[i].getHtml() ),
							'"' + filename + '": Author html "' + authorHtml + '" matches.'
						);

					} );

					assert.equal(
						asset.getLicence().getId(),
						testCases[filename].licenceId,
						'Licence "' + asset.getLicence().getId() + '" matches.'
					);

					assert.equal(
						getHtmlText( asset.getAttribution() ),
						getHtmlText( testCases[filename].attribution ),
						'Dedicated attribution of "' + filename + '" matches.'
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
	} );

}( define ) );
