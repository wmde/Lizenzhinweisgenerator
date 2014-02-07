var thumbsize = 500 ;
var file ;
var thumbdata ;
var print_urls ;
var asset;
var Licence = app.Licence;
var api = new app.Api( '//commons.wikimedia.org/w/api.php?callback=?' );

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

			app.inputHandler.getFilename( e )
			.done( function( filename ) {
				file = filename;
				initProcess();
				processFile( file );
			} );
		}) ;
	
	var params = getUrlVars();

	if( params.file ) {
		file = params.file;
		initProcess();
		processFile( params.file );
	} else if( params.url ) {
		app.inputHandler.getFilename( params.url )
		.done( function( filename ) {
			file = filename;
			processFile( file );
		} );
	}
} ) ;

function initProcess () {
	$('#options').show() ;
	$('#html').hide() ;
	thumbdata = {} ;
  $('div:first > p').remove();
	$('#suggestion').html ( '<i>Constructing preview...</i>' ) ;
}

function processFile ( file ) {

	location.hash = "#?file=" + file.replace ( / /g , '_' ) ;

	api.getAsset( file )
	.done( function( a ) {
		asset = a;

		var h = '' ;
		h += "<option value='none' selected>None</option>" ;
		$.each ( asset.getDescriptions() , function ( lang , html ) {
			h += "<option value='" + lang + "'>" + lang.toUpperCase() + "</option>" ;
		} ) ;
		$('#desc_mode').html ( h ) ;

		renderSuggestion () ;
	} )
	.fail( function( message ) {
		alert( message );
	} );

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
	var licence = asset.getLicence();

	var license = licence
		? $( '<div/>' ).append( $( '<small/>' ).append( licence.getHtml() ) ).html()
		: 'Unknown licence';

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
	api.getImageInfo( file, thumbsize )
	.done( function( imageInfo ) {
		thumbdata[thumbsize] = imageInfo;
		callback() ;
	} )
	.fail( function( message ) {
		console.error( message );
	} );
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
