( function( define ) {

define(
	['jquery', 'Api', 'LicenceStore', 'LICENCES', 'Asset', 'Author'],
	function( $, Api, LicenceStore, LICENCES, Asset, Author ) {

var api = new Api(
	'//commons.wikimedia.org/w/api.php?callback=?',
	new LicenceStore( LICENCES )
);

return {
	'LRO_Tycho_Central_Peak.jpg': new Asset(
		'LRO_Tycho_Central_Peak.jpg',
		'LRO Tycho Central Peak',
		'bitmap',
		api.getLicenceStore().getLicence( 'PD' ),
		api,
		{
			// Author without link:
			authors: [new Author( $( document.createTextNode( 'NASA / GSFC / Arizona State Univ. / Lunar Reconnaissance Orbiter' ) ) )]
		}
	),
	'Helene Fischer 2010.jpg': new Asset(
		'Helene Fischer 2010.jpg',
		'Helene Fischer 2010',
		'bitmap',
		api.getLicenceStore().getLicence( 'cc-by-sa-3.0' ),
		api,
		{
			// Author with internal wiki link:
			authors: [new Author( $( '<a href="http://commons.wikimedia.org/wiki/User:Fleyx24">Fleyx24</a>' ) )]
		}
	),
	'JapaneseToiletControlPanel.jpg': new Asset(
		'JapaneseToiletControlPanel.jpg',
		'JapaneseToiletControlPanel',
		'bitmap',
		api.getLicenceStore().getLicence( 'cc-by-sa-3.0' ),
		api,
		{
			authors: [new Author( $( '<a href="http://commons.wikimedia.org/wiki/User:Chris_73">Chris 73</a>' ) )],
			// Complex attribution and attribution differs from author:
			attribution: $( '<a href="http://commons.wikimedia.org/wiki/User:Chris_73">Chris 73</a> / <a href="http://commons.wikimedia.org/">Wikimedia Commons</a>' )
		}
	),
	'13-09-29-nordfriesisches-wattenmeer-RalfR-15.jpg': new Asset(
		'13-09-29-nordfriesisches-wattenmeer-RalfR-15.jpg',
		'13-09-29-nordfriesisches-wattenmeer-RalfR-15',
		'bitmap',
		// Multi-licence-template:
		api.getLicenceStore().getLicence( 'cc-by-sa-3.0' ),
		api,
		{
			// Complex author:
			authors: [new Author( $( '<div/>' ).html( '©&nbsp;<a href="http://commons.wikimedia.org/wiki/User:Ralf_Roletschek">Ralf Roletschek</a> - <a rel="nofollow" href="http://www.roletschek.de">Fahrradtechnik und Fotografie</a>' ).contents() )]
		}
	),
	'Statue Andrrea Palladio Vicenza.jpg': new Asset(
		'Statue Andrrea Palladio Vicenza.jpg',
		'Statue Andrrea Palladio Vicenza',
		'bitmap',
		api.getLicenceStore().getLicence( 'cc-zero' ),
		api,
		{
			// No detectable author:
			authors: []
		}
	),
	'Inisheer Gardens 2002 dry-stone walls.jpg': new Asset(
		'Inisheer Gardens 2002 dry-stone walls.jpg',
		'Inisheer Gardens 2002 dry-stone walls',
		'bitmap',
		// Features additional newer CC-BY-SA licence, preferring non-SA licence:
		api.getLicenceStore().getLicence( 'cc-by-2.0-de' ),
		api,
		{
			authors: [new Author( $( '<a href="http://commons.wikimedia.org/wiki/User:Arcimboldo">Eckhard Pecher</a>' ) )],
			// Simple attribution:
			attribution: $( '<a href="http://commons.wikimedia.org/wiki/User:Arcimboldo">Eckhard Pecher</a>' )
		}
	),
	'Wien Karlsplatz3.jpg': new Asset(
		'Wien Karlsplatz3.jpg',
		'Wien Karlsplatz3',
		'bitmap',
		api.getLicenceStore().getLicence( 'cc-by-2.0-de' ),
		api,
		{
			// Strip "(talk)" link:
			authors: [new Author( $( '<a href="http://commons.wikimedia.org/wiki/User:Ikar.us">Ikar.us</a>' ) )]
		}
	),
	'Brandenburg gate sunset quadriga.jpg': new Asset(
		'Brandenburg gate sunset quadriga.jpg',
		'Brandenburg gate sunset quadriga',
		'bitmap',
		api.getLicenceStore().getLicence( 'cc-by-sa-3.0' ),
		api,
		{
			authors: []
		}
	),
	'Gerardus_t\'_Hooft_at_Harvard.jpg': new Asset(
		'Gerardus_t\'_Hooft_at_Harvard.jpg',
		'Gerardus t\' Hooft at Harvard',
		'bitmap',
		api.getLicenceStore().getLicence( 'cc-by-3.0' ),
		api,
		{
			// Inter-wiki links:
			authors: [new Author( $( '<div/>' ).html( '<a href="http://en.wikipedia.org/wiki/User:Lumidek">Lumidek</a> at <a href="http://en.wikipedia.org/wiki/">English Wikipedia</a>' ).contents() )]
		}
	),
	'1950_Yankees.jpg': new Asset(
		'1950_Yankees.jpg',
		'1950 Yankees',
		'bitmap',
		// Unsupported CC licence CC-BY-1.0:
		null,
		api,
		{
			authors: [new Author( $( document.createTextNode( 'jcasabona' ) ) )]
		}
	),
	'NatMonumFengegKapell.jpg': new Asset(
		'NatMonumFengegKapell.jpg',
		'NatMonumFengegKapell',
		'bitmap',
		// Unsupported licence derivative CC-BY-3.0-LU:
		null,
		api,
		{
			authors: [new Author( $( '<div/>' ).html( '<a href="http://lb.wikipedia.org/wiki/User:Pecalux">Pecalux</a> at <a href="http://lb.wikipedia.org">lb.wikipedia</a>' ).contents() ) ]
		}
	),
	'"Граничар" - Туховища.JPG': new Asset(
		// Non-Latin character set:
		'"Граничар" - Туховища.JPG',
		'"Граничар" - Туховища',
		'bitmap',
		api.getLicenceStore().getLicence( 'cc-by-3.0' ),
		api,
		{
			authors: [new Author( $( document.createTextNode( 'Ерол Шукриев' ) ) )]
		}
	),
	'03602 - Monti, Gaetano - Allegoria (1832) - Porta Venezia, Milano - Foto Giovanni Dall\'Orto 23-Jun-2007.jpg': new Asset(
		'03602 - Monti, Gaetano - Allegoria (1832) - Porta Venezia, Milano - Foto Giovanni Dall\'Orto 23-Jun-2007.jpg',
		'03602 - Monti, Gaetano - Allegoria (1832) - Porta Venezia, Milano - Foto Giovanni Dall\'Orto 23-Jun-2007',
		'bitmap',
		// Completely unsupported licence:
		null,
		api,
		{
			authors: []
		}
	),
// TODO: Add support for properly scraping HTML lists:
/*
	'Drawing_of_a_CCTV_Camera.svg': new Asset(
		'Drawing_of_a_CCTV_Camera.svg',
		'Drawing of a CCTV Camera',
		// Drawing:
		'drawing',
		api.getLicenceStore().getLicence( 'PD' ),
		api,
		{
			// Very complex author:
			authors: [new Author( $( '<a href="http://commons.wikimedia.org/wiki/File:Drawing_of_a_CCTV_Camera.JPG">Drawing_of_a_CCTV_Camera.JPG</a>: <a href="http://commons.wikimedia.org/wiki/User_talk:Think_outside_the_box">Think outside the box</a> | derivative work: <a href="http://commons.wikimedia.org/wiki/User:PhoneixS">PhoneixS</a>' ) )]
		}
	),
*/
	'The_Little_Princess_(1939)_full.ogv': new Asset(
		'The_Little_Princess_(1939)_full.ogv',
		'The Little Princess (1939) full',
		// Video:
		'video',
		api.getLicenceStore().getLicence( 'PD' ),
		api,
		{
			authors: [new Author( $( document.createTextNode( 'Walter Lang/20th Century Fox' ) ) )]
		}
	),
	'05 Air from Suite in C minor.ogg': new Asset(
		'05 Air from Suite in C minor.ogg',
		'05 Air from Suite in C minor',
		// Audio:
		'audio',
		api.getLicenceStore().getLicence( 'cc-by-sa-3.0' ),
		api,
		{
			authors: [new Author( $( '<a href="http://commons.wikimedia.org/wiki/User:Bdegazio">Bdegazio</a>' ) )]
		}
	),
	'Cox_and_box.pdf': new Asset(
		'Cox_and_box.pdf',
		'Cox and box',
		// Office:
		'office',
		api.getLicenceStore().getLicence( 'PD' ),
		api,
		{
			authors: [new Author( $( document.createTextNode( 'F C Burnand' ) ) )]
		}
	),
	'Air_France_A380_F-HPJA.jpg': new Asset(
		'Air_France_A380_F-HPJA.jpg',
		'Air France A380 F-HPJA',
		'bitmap',
		api.getLicenceStore().getLicence( 'cc-by-sa-3.0' ),
		api,
		{
			// Author's contains HTML where the internal user page link is not on the top-most DOM level:
			authors: [new Author( $( '<a href="http://commons.wikimedia.org/wiki/User:Jovianeye">Joe Ravi</a>') )],
			attribution: $( '<a href="http://commons.wikimedia.org/wiki/User:Jovianeye">Joe Ravi</a>' )
		}
	)
};

} );

}( define ) );
