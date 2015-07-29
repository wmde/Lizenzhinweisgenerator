/**
 * @licence GNU GPL v3
 * @author snater.com < wikimedia@snater.com >
 */
define( [
	'jquery',
	'app/Api',
	'app/Asset',
	'app/LicenceStore',
	'app/LICENCES',
	'app/NoApi',
	'app/WikiAsset',
	'app/Author',
	'dojo/_base/config'
],
function( $, Api, Asset, LicenceStore, LICENCES, NoApi, WikiAsset, Author, config ) {
'use strict';

config.custom.licenceStore = new LicenceStore( LICENCES );

var api = new Api( 'https://commons.wikimedia.org/' ),
	noApi = new NoApi();

return {
	'https://www.wikimedia.de/w/images.homepage/d/d6/Pavel_Richter_WMDE.JPG': new Asset(
		'https://www.wikimedia.de/w/images.homepage/d/d6/Pavel_Richter_WMDE.JPG',
		'mediatype',
		null,
		null,
		null,
		null,
		null,
		noApi
	),
	'LRO_Tycho_Central_Peak.jpg': new WikiAsset(
		'File:LRO_Tycho_Central_Peak.jpg',
		'bitmap',
		config.custom.licenceStore.getLicence( 'PD' ),
		'LRO Tycho Central Peak',
		[new Author( $( document.createTextNode( 'NASA / GSFC / Arizona State Univ. / Lunar Reconnaissance Orbiter' ) ) )],
		null,
		null,
		api
	),
	'Helene Fischer 2010.jpg': new WikiAsset(
		'File:Helene Fischer 2010.jpg',
		'bitmap',
		config.custom.licenceStore.getLicence( 'cc-by-sa-3.0' ),
		'Helene Fischer 2010',
		[new Author( $( '<a href="https://commons.wikimedia.org/wiki/User:Fleyx24">Fleyx24</a>' ) )],
		null,
		null,
		api
	),
	'JapaneseToiletControlPanel.jpg': new WikiAsset(
		'File:JapaneseToiletControlPanel.jpg',
		'bitmap',
		config.custom.licenceStore.getLicence( 'cc-by-sa-3.0' ),
		'JapaneseToiletControlPanel',
		[new Author( $( '<a href="https://commons.wikimedia.org/wiki/User:Chris_73">Chris 73</a>' ) )],
		null,
		// Complex attribution and attribution differs from author:
		$( '<a href="https://commons.wikimedia.org/wiki/User:Chris_73">Chris 73</a> / <a href="http://commons.wikimedia.org/">Wikimedia Commons</a>' ),
		api
	),
	'13-09-29-nordfriesisches-wattenmeer-RalfR-15.jpg': new WikiAsset(
		'File:13-09-29-nordfriesisches-wattenmeer-RalfR-15.jpg',
		'bitmap',
		// Multi-licence-template:
		config.custom.licenceStore.getLicence( 'cc-by-sa-3.0' ),
		'13-09-29-nordfriesisches-wattenmeer-RalfR-15',
		// Complex author:
		[new Author( $( '<div/>' ).html( '©&nbsp;<a href="https://commons.wikimedia.org/wiki/User:Ralf_Roletschek">Ralf Roletschek</a> - <a rel="nofollow" href="http://www.fahrradmonteur.de">Fahrradtechnik und Fotografie</a>' ).contents() )],
		null,
		null,
		api
	),
	'1871_Proclamation_of_the_German_Empire.jpg': new WikiAsset(
		'File:1871_Proclamation_of_the_German_Empire.jpg',
		'bitmap',
		config.custom.licenceStore.getLicence( 'PD' ),
		'1871 Proclamation of the German Empire',
		// No detectable author:
		null,
		null,
		null,
		api
	),
	'Inisheer Gardens 2002 dry-stone walls.jpg': new WikiAsset(
		'File:Inisheer Gardens 2002 dry-stone walls.jpg',
		'bitmap',
		// Features additional newer CC-BY-SA licence, preferring non-SA licence:
		config.custom.licenceStore.getLicence( 'cc-by-2.0-de' ),
		'Inisheer Gardens 2002 dry-stone walls',
		[new Author( $( '<a href="https://commons.wikimedia.org/wiki/User:Arcimboldo">Eckhard Pecher</a>' ) )],
		null,
		// Simple attribution:
		$( '<a href="https://commons.wikimedia.org/wiki/User:Arcimboldo">Eckhard Pecher</a>' ),
		api
	),
	'Wien Karlsplatz3.jpg': new WikiAsset(
		'File:Wien Karlsplatz3.jpg',
		'bitmap',
		config.custom.licenceStore.getLicence( 'cc-by-2.0-de' ),
		'Wien Karlsplatz3',
		// Strip "(talk)" link:
		[new Author( $( '<a href="https://commons.wikimedia.org/wiki/User:Ikar.us">Ikar.us</a>' ) )],
		null,
		null,
		api
	),
	'Brandenburg gate sunset quadriga.jpg': new WikiAsset(
		'File:Brandenburg gate sunset quadriga.jpg',
		'bitmap',
		config.custom.licenceStore.getLicence( 'cc-by-sa-3.0' ),
		'Brandenburg gate sunset quadriga',
		// No attributes at all.
		null,
		null,
		null,
		api
	),
	'Gerardus_t\'_Hooft_at_Harvard.jpg': new WikiAsset(
		'File:Gerardus_t\'_Hooft_at_Harvard.jpg',
		'bitmap',
		config.custom.licenceStore.getLicence( 'cc-by-3.0' ),
		'Gerardus t\' Hooft at Harvard',
		// Inter-wiki links:
		[new Author( $( '<div/>' ).html( '<a href="https://en.wikipedia.org/wiki/User:Lumidek">Lumidek</a> at <a href="https://en.wikipedia.org/wiki/">English Wikipedia</a>' ).contents() )],
		null,
		null,
		api
	),
	'1950_Yankees.jpg': new WikiAsset(
		'File:1950_Yankees.jpg',
		'bitmap',
		// Unsupported CC licence CC-BY-1.0:
		config.custom.licenceStore.getLicence( 'cc' ),
		'1950 Yankees',
		[new Author( $( document.createTextNode( 'jcasabona' ) ) )],
		null,
		null,
		api
	),
	'NatMonumFengegKapell.jpg': new WikiAsset(
		'File:NatMonumFengegKapell.jpg',
		'bitmap',
		// Unsupported licence derivative CC-BY-3.0-LU:
		config.custom.licenceStore.getLicence( 'cc' ),
		'NatMonumFengegKapell',
		[new Author( $( '<div/>' ).html( '<a href="https://lb.wikipedia.org/wiki/User:Pecalux">Pecalux</a> at <a href="http://lb.wikipedia.org">lb.wikipedia</a>' ).contents() )],
		null,
		null,
		api
	),
	'"Граничар" - Туховища.JPG': new WikiAsset(
		// Non-Latin character set:
		'File:"Граничар" - Туховища.JPG',
		'bitmap',
		config.custom.licenceStore.getLicence( 'cc-by-3.0' ),
		'"Граничар" - Туховища',
		[new Author( $( document.createTextNode( 'Ерол Шукриев' ) ) )],
		null,
		null,
		api
	),
	'03602 - Monti, Gaetano - Allegoria (1832) - Porta Venezia, Milano - Foto Giovanni Dall\'Orto 23-Jun-2007.jpg': new WikiAsset(
		'File:03602 - Monti, Gaetano - Allegoria (1832) - Porta Venezia, Milano - Foto Giovanni Dall\'Orto 23-Jun-2007.jpg',
		'bitmap',
		// Licence not detectable:
		null,
		'03602 - Monti, Gaetano - Allegoria (1832) - Porta Venezia, Milano - Foto Giovanni Dall\'Orto 23-Jun-2007',
		[ new Author( $( '<a href="https://commons.wikimedia.org/wiki/User:G.dallorto">G.dallorto</a>' ) ) ],
		null,
		null,
		api
	),
	'The_Little_Princess_(1939)_full.ogv': new WikiAsset(
		'File:The_Little_Princess_(1939)_full.ogv',
		// Video:
		'video',
		config.custom.licenceStore.getLicence( 'PD' ),
		'The Little Princess (1939) full',
		[new Author( $( document.createTextNode( 'Walter Lang/20th Century Fox' ) ) )],
		null,
		null,
		api
	),
	'05 Air from Suite in C minor.ogg': new WikiAsset(
		'File:05 Air from Suite in C minor.ogg',
		// Audio:
		'audio',
		config.custom.licenceStore.getLicence( 'cc-by-sa-3.0' ),
		'05 Air from Suite in C minor',
		[new Author( $( '<a href="https://commons.wikimedia.org/wiki/User:Bdegazio">Bdegazio</a>' ) )],
		null,
		null,
		api
	),
	'Cox_and_box.pdf': new WikiAsset(
		'File:Cox_and_box.pdf',
		// Office:
		'office',
		config.custom.licenceStore.getLicence( 'PD' ),
		'Cox and box',
		[new Author( $( document.createTextNode( 'F C Burnand' ) ) )],
		null,
		null,
		api
	),
	'Air_France_A380_F-HPJA.jpg': new WikiAsset(
		'File:Air_France_A380_F-HPJA.jpg',
		'bitmap',
		config.custom.licenceStore.getLicence( 'cc-by-sa-3.0' ),
		'Air France A380 F-HPJA',
		// Author's contains HTML where the internal user page link is not on the top-most DOM level:
		[new Author( $( '<a href="https://commons.wikimedia.org/wiki/User:Jovianeye">Joe Ravi</a>' ) )],
		null,
		$( '<a href="https://commons.wikimedia.org/wiki/User:Jovianeye">Joe Ravi</a>' ),
		api
	),
	'Seilsäge.jpg': new WikiAsset(
		// Localized namespace prefix:
		'Datei:Seilsäge.jpg',
		'bitmap',
		config.custom.licenceStore.getLicence( 'cc-by-sa-3.0' ),
		'Seilsäge',
		[ new Author( $( '<p>Reiner Flassig\n</p>' ) ) ],
		null,
		null,
		api,
		// Local Wikipedia:
		'https://de.wikipedia.org/'
	),
	'Hektor_Philippi.JPG': new WikiAsset(
		// Using "File:" prefix:
		'File:Hektor_Philippi.JPG',
		'bitmap',
		// Local Wikipedia with more specific licence:
		config.custom.licenceStore.getLicence( 'cc-by-sa-3.0-de' ),
		'Hektor Philippi',
		[ new Author( $( '<p>Reinhard Philippi <a href="/wiki/Benutzer:Reinhardphilippi">Reinhardphilippi</a> 15:37, 21. Aug. 2008 (CEST)\n</p>' ) ) ],
		null,
		null,
		api,
		'https://de.wikipedia.org/'
	),
	'1_FC_Bamberg_-_1_FC_Nürnberg_1901.jpg': new WikiAsset(
		'Datei:1_FC_Bamberg_-_1_FC_Nürnberg_1901.jpg',
		'bitmap',
		// Public domain on local Wikipedia:
		config.custom.licenceStore.getLicence( 'PD' ),
		'1 FC Bamberg - 1 FC Nürnberg 1901',
		[ new Author( $( '<p>unbekannt\n</p>' ) ) ],
		null,
		null,
		api,
		'https://de.wikipedia.org/'
	),
	'Fiesta-Zuschauer Z1.jpeg': new WikiAsset(
		'Datei:Fiesta-Zuschauer Z1.jpeg',
		'bitmap',
		// CC-0 licence on local Wikipedia:
		config.custom.licenceStore.getLicence( 'cc-zero' ),
		'Fiesta-Zuschauer Z1',
		[ new Author( $( '<p>Ziegler175\n</p>' ) ) ],
		null,
		null,
		api,
		'https://de.wikipedia.org/'
	)
	// TODO: Edge cases
	/*
	'File:"L\'Absinthe", par Edgar Degas (1876).jpg': new WikiAsset(
		'File:"L\'Absinthe", par Edgar Degas (1876).jpg',
		'"L\'Absinthe", par Edgar Degas (1876)',
		'bitmap',
		config.custom.licenceStore.getLicence( 'PD' ),
		api,
		{
			authors: // TODO
		}
	),
	'Statue Andrrea Palladio Vicenza.jpg': new WikiAsset(
		'File:Statue Andrrea Palladio Vicenza.jpg',
		'Statue Andrrea Palladio Vicenza',
		'bitmap',
		config.custom.licenceStore.getLicence( 'cc-zero' ),
		api,
		{
			authors: // TODO
		}
	),
	'1870_Erhard_Map_of_Paris_and_Vicinity,_France_-_Geographicus_-_Paris-erhard-1870.jpg': new WikiAsset(
		'File:1870_Erhard_Map_of_Paris_and_Vicinity,_France_-_Geographicus_-_Paris-erhard-1870.jpg',
		'1870 Erhard Map of Paris and Vicinity, France - Geographicus - Paris-erhard-1870',
		'bitmap',
		config.custom.licenceStore.getLicence( 'PD' ),
		api,
		{
			authors: // TODO
		}
	),
	*/
	// TODO: Add support for properly scraping HTML lists:
	/*
	'Drawing_of_a_CCTV_Camera.svg': new WikiAsset(
		'File:Drawing_of_a_CCTV_Camera.svg',
		'Drawing of a CCTV Camera',
		// Drawing:
		'drawing',
		config.custom.licenceStore.getLicence( 'PD' ),
		api,
		{
			// Very complex author:
			authors: [new Author( $( '<a href="http://commons.wikimedia.org/wiki/File:Drawing_of_a_CCTV_Camera.JPG">Drawing_of_a_CCTV_Camera.JPG</a>: <a href="http://commons.wikimedia.org/wiki/User_talk:Think_outside_the_box">Think outside the box</a> | derivative work: <a href="http://commons.wikimedia.org/wiki/User:PhoneixS">PhoneixS</a>' ) )]
		}
	),
	*/
};

} );
