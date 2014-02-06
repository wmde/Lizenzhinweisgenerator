var thumbsize = 500 ;
var api_url = '//commons.wikimedia.org/w/api.php?callback=?' ;
var file ;
var doc ;
var cats ;
var thumbdata ;
var print_urls ;
var asset;
var Licence = app.Licence;

var licences = [
	new Licence( /^(PD|Public domain)\b/i, {
		'outputTemplate': 'in the public domain'
	} ),
	new Licence( 'CECILL', 'http://www.cecill.info/licences/Licence_CeCILL_V2-en.html' ),
	new Licence( 'FAL', 'http://artlibre.org/licence/lal/en' ),
	new Licence( 'GPL', 'http://www.gnu.org/copyleft/gpl-3.0.html' ),
	new Licence( 'LGPL', 'http://www.gnu.org/licenses/lgpl.html' ),
	new Licence( 'AGPL', 'http://www.gnu.org/licenses/agpl.html'),
	new Licence( 'GFDL', 'http://commons.wikimedia.org/wiki/Commons:GNU_Free_Documentation_License_1.2' ),
	new Licence( 'OS OPENDATA', 'http://www.ordnancesurvey.co.uk/oswebsite/opendata/licence/docs/licence.pdf', {
		'outputTemplate': 'licenced unter {{name}}'
	} ),
	new Licence( /^CC-([A-Z-]+)-([0-9.]+)([A-Z-]*(,.+)*){1}/i, 'http://creativecommons.org/licenses/$1/$2/$3' ),
	new Licence( /^CC-([A-Z-]+)-([0-9.]+)/i, 'http://creativecommons.org/licenses/$1/$2' ),
	new Licence( 'CC-PD-Mark', 'http://creativecommons.org/publicdomain/mark/1.0/' ),
	new Licence( 'CC-Zero', 'http://creativecommons.org/publicdomain/zero/1.0/' )
];

$(document).ready ( function () {
	jQuery.event.props.push('dataTransfer');
	
	print_urls = $('#print_urls').prop('checked') ;
	
	$('#thumbsize').change ( function () {
		thumbsize = $('#thumbsize').val() ;
		renderSuggestion() ;
	} ) ;

	$('#print_urls').change ( function () {
		print_urls = $('#print_urls').prop('checked') ;
		renderSuggestion() ;
	} ) ;

	$('#desc_mode').change ( function () {
		renderSuggestion() ;
	} ) ;

	$('body')
		.bind( 'dragenter dragover', false)
		.bind( 'drop', function( e ) {
			e.stopPropagation();
			e.preventDefault();
			
			if ( undefined !== e.dataTransfer.items && undefined !== e.dataTransfer.items[0] && undefined !== e.dataTransfer.items[0].getAsString ) {
				e.dataTransfer.items[0].getAsString ( processURL ) ;
				return ;
			}
			
//			console.log ( e.dataTransfer.items[0] ) ;
			var h = e.dataTransfer.getData("text/html") ;
//			console.log ( h ) ;
			h = $ ( '<div>' + h + '</div>' ) ;
			h = $( h.find('img').get(0) ) ;
			var url = h.attr('src') ;
			processURL ( url ) ;
		}) ;
	
	var params = getUrlVars() ;
	if ( undefined !== params.url ) {
		processURL ( params.url ) ;
	} else if ( undefined !== params.file ) {
		initProcess() ;
		file = params.file ;
		file = file.replace ( /^[A-Z][a-z]+:/ , '' ) ; // File:
		file = file.replace ( /_/g , ' ' ) ;
		processFile ( file ) ;
	}
} ) ;

function initProcess () {
	$('#options').show() ;
	$('#html').hide() ;
	thumbdata = {} ;
  $('div:first > p').remove();
	$('#suggestion').html ( '<i>Constructing preview...</i>' ) ;
}

function processURL ( url ) {
	initProcess() ;
	var s = url ;
	if ( s.match ( /\/thumb\// ) ) {
		s = s.split ( '/' ) ;
		s.pop() ;
		file = decodeURIComponent ( s.pop() ) ;
	} else {
		s = s.split ( '/' ) ;
		file = decodeURIComponent ( s.pop() ) ;
	}
	file = file.replace ( /^[A-Z][a-z]+:/ , '' ) ; // File:
	file = file.replace ( /_/g , ' ' ) ;
	processFile ( file ) ;
}

function processFile ( file ) {

	location.hash = "#?file=" + file.replace ( / /g , '_' ) ;

	$.getJSON ( api_url , {
		action : 'query' ,
		prop : 'revisions' ,
		titles : 'File:' + file ,
		rvprop : 'content' ,
		rvparse : 1 ,
		format : 'json'
	} , function ( d ) {
		doc = undefined ;
		if ( undefined !== d.query && undefined !== d.query.pages ) {
			$.each ( d.query.pages , function ( k1 , v1 ) {
				if ( k1 == -1 ) return ;
				doc = $('<div>' + v1.revisions[0]['*'] + '</div>' ) ;

			} ) ;
		}
		
		if ( undefined === 'doc' ) {
			alert ( "Could not get file information for " + file ) ;
			return ;
		}
		
		$.getJSON ( api_url , {
			action : 'query' ,
			prop : 'categories' ,
			cllimit : 500 ,
			titles : 'File:' + file ,
			format : 'json'
		} , function ( d ) {
			cats = [] ;
			if ( undefined !== d.query && undefined !== d.query.pages ) {
				$.each ( d.query.pages , function ( k1 , v1 ) {
					$.each ( v1.categories , function ( k2 , v2 ) {
						cats.push ( v2.title.replace ( /^[^:]+:/ , '' ) ) ;
					} ) ;
				} ) ;
			} else {
				alert ( "Could not get license information for " + file ) ;
				return ;
			}

			var assetPage = new app.AssetPage( file.replace ( /\.[^.]+$/ , '' ), doc );
			asset = assetPage.getAsset();

			var h = '' ;
			h += "<option value='none' selected>None</option>" ;
			$.each ( asset.getDescriptions() , function ( lang , html ) {
				h += "<option value='" + lang + "'>" + lang.toUpperCase() + "</option>" ;
			} ) ;
			$('#desc_mode').html ( h ) ;

			renderSuggestion () ;

		} ) ;
		
	}) ;
}

function renderSuggestion ( ) {
	if ( undefined === thumbdata[thumbsize] ) {
		updateThumbnail ( renderSuggestion ) ;
		return ;
	}
	var desc_mode = $('#desc_mode').val() ;
	
	var w = thumbdata[thumbsize].thumbwidth ;
	if ( w < 200 ) w = 200 ;
	
	var h1 = "<div style='font-family:Verdana;max-width:" + w + "px;border:1px solid black;font-size:10pt;padding:2px;'><div style='text-align:center;'>" ;
	h1 += "<a href='" + thumbdata[thumbsize].descriptionurl + "'>" ;
	h1 += "<img src='" ;
	h1 += thumbdata[thumbsize].thumburl + "'" ;
	h1 += " border='0'/></a>" ;
	h1 += "</div><div style='overflow:auto'>" ;
	h1 += "<div style='text-align:center'><b>" + asset.getTitle() + "</b></div>" ;
	
	if ( desc_mode != 'none' ) {
		h1 += "<div style='font-size:11pt;margin-top:3px;margin-bottom:3px'>" + asset.getDescription( desc_mode ) + "</div>" ;
	}
	
	var license_newline ;
	h1 += "<div>" ;
	if( asset.getAttribution() ) {
		h1 += asset.getAttribution();
		license_newline = true ;
	} else if( asset.getAuthors().length === 0 || asset.getAuthors()[0].getName() == 'unknown' ) {
		if( asset.getSource() ) {
			h1 += asset.getSource();
		} else {
			h1 += "Unknown author";
		}
	} else {
		var authors = asset.getAuthors();

		h1 += 'Created by ';

		$.each( authors, function( i, author ) {
			var url = author.getUrl();

			if( url ) {
				if( url.substr( 0, 2 ) === '//' ) {
					url = 'http:' + url ;
				}

				h1 += $( '<div/>' ).append(
					$( '<a/>' ).attr( 'href', author.getUrl() ).text( author.getName() )
				).html();

				if( print_urls ) {
					h1 += " <small>(" + url + ")</small>" ;
				}
			}
		} );
	}
	var license = getLicense() ;
	if ( license_newline ) h1 += "<br/>" + ucFirst ( license ) ;
	else h1 += "; " + license ;
	h1 += "</div>" ;
	h1 += "</div></div>" ;
	
	var h = h1 ;
	
	$('#html').html ( "<div>" + h1.replace(/&/g,'&amp;').replace(/>/g,'&gt;').replace(/</g,'&lt;') + "</div>" ) ;

	
	$('#suggestion').html ( h ) ;
	$($('#suggestion div div').get(0)).prepend("<div id='loading'><i>Loading thumbnail...</i></div>") ;
	$($('#suggestion img').get(0)).load ( function () { $('#loading').remove() } ) ;
}

function updateThumbnail ( callback ) {
	$.getJSON ( api_url , {
		action : 'query' ,
		prop : 'imageinfo' ,
		titles : 'File:' + file ,
		iiprop : 'url' ,
		iiurlwidth : thumbsize ,
		iiurlheight : thumbsize ,
		format : 'json'
	} , function ( d ) {
		$.each ( d.query.pages , function ( k , v ) {
			thumbdata[thumbsize] = v.imageinfo[0] ;
			callback() ;
		} ) ;
	} ) ;
}

function getLicense() {
	for( var i = 0; i < cats.length; i++ ) {
		for( var j = 0; j < licences.length; j++ ) {
			var licence = licences[j];
			if( licence.match( cats[i] ) ) {
				if( licence.isAbstract() ) {
					licence = Licence.newFromAbstract( licence, cats[i] );
				}
				return $( '<div/>' ).append( $( '<small/>' ).append( licence.getHtml() ) ).html();
			}
		}
	}
	return 'Unknown licence';
}

function getUrlVars () {
	var vars = {} ;
	var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	$.each ( hashes , function ( i , j ) {
		var hash = j.split('=');
		hash[1] += '' ;
		vars[hash[0]] = decodeURI(hash[1]).replace(/_/g,' ');
	} ) ;
	return vars;
}

function ucFirst(string) {
	return string.substring(0, 1).toUpperCase() + string.substring(1);
}
