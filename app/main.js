var thumbsize = 500 ;
var api_url = '//commons.wikimedia.org/w/api.php?callback=?' ;
var file ;
var doc ;
var cats ;
var thumbdata ;
var result ;
var descs ;
var print_urls ;
var author_url = '' ;

var license2url = {
	'CECILL' : 'http://www.cecill.info/licences/Licence_CeCILL_V2-en.html' ,
	'FAL' : 'http://artlibre.org/licence/lal/en' ,
	'GPL' : 'http://www.gnu.org/copyleft/gpl-3.0.html' ,
	'LGPL' : 'http://www.gnu.org/licenses/lgpl.html' ,
	'AGPL' : 'http://www.gnu.org/licenses/agpl.html' ,
	'GFDL' : 'http://commons.wikimedia.org/wiki/Commons:GNU_Free_Documentation_License_1.2' ,
	'OS OPENDATA' : 'http://www.ordnancesurvey.co.uk/oswebsite/opendata/licence/docs/licence.pdf'
} ;

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
	result = {} ;
	thumbdata = {} ;
	descs = {} ;
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
			parseDoc () ;
		} ) ;
		
	}) ;
}

function parseDoc () {
	var o = {} ;
	o.title = parseTable('fileinfotpl_art_title') || parseTable('fileinfotpl_title') || file.replace ( /\.[^.]+$/ , '' ) ;
	o.desc = parseTable('fileinfotpl_desc','desc') || '' ;
	o.author = parseTable('fileinfotpl_aut','author') || '' ;
	o.source = parseTable('fileinfotpl_src') || '' ;
	o.attribution = $($(doc).find('.licensetpl_attr').get(0)).html() || '' ;

	if ( o.desc == '' ) {
		var t = [] ;
		t.push ( ucFirst($.trim($($($($(doc).find('#fileinfotpl_art_medium')).parents('tr').get(0)).find('td').get(1)).text())) ) ;
		t.push ( $.trim($($($($(doc).find('#fileinfotpl_date')).parents('tr').get(0)).find('td').get(1)).text()) ) ;
		t.push ( $.trim($($($($(doc).find('#fileinfotpl_art_dimensions')).parents('tr').get(0)).find('td').get(1)).text()) ) ;
		t = t.join('; ').replace(/\s+/g,' ') ;
		o.desc = t ;
//		if ( descs['full'] == '' ) 
		descs['full'] = t ;
	}
	
	result = o ;
	
	var h = '' ;
	h += "<option value='none' selected>None</option>" ;
	$.each ( descs , function ( lang , html ) {
		h += "<option value='" + lang + "'>" + lang.toUpperCase() + "</option>" ;
	} ) ;
	$('#desc_mode').html ( h ) ;
	
	renderSuggestion () ;
}


function parseTable ( key , mode ) {
	var t = $($(doc).find('#'+key)) ;
	if ( t.length === 0 ) return undefined ;
	t = $(t.parents('tr').get(0)) ;
	if ( t.length === 0 ) return undefined ;
	t = $(t.find('td').get(1)) ;
	if ( t.length === 0 ) return undefined ;
	
	var ret = $.trim(t.text()) ;
	if ( mode == 'author' ) {
	
		author_url = '' ;
	
		var o = $($(doc).find('#creator')) ;
		if ( o.length > 0 ) {
			o.find('a').each ( function ( k , v ) {
				var href = $(v).attr('href') ;
				if ( href.match ( /^https{0,1}:/i ) ) return ;
				if ( href.match ( /^\/wiki\// ) ) $(v).attr('href','//commons.wikimedia.org'+href) ;
				else $(v).replaceWith ( '<span>' + $(v).text() + '</span>' ) ;
			} ) ;
			return o.html() ;
		}
	
		t.find('a').each ( function ( k , v ) {
			v = $(v) ;
			var m = (v.attr('title')||'').match ( /^User:(.+)$/i ) ;
			if ( m ) {
				ret = '//commons.wikimedia.org' + v.attr('href') ;
				author_url = ret ;
				ret = "<a href='" + author_url + "'>" + v.text() + "</a>" ;
				return false ;
			}
			if ( v.hasClass ( 'extiw' ) ) {
				author_url = v.attr('href') ;
				ret = "<a href='" + author_url + "'>" + v.text() + "</a>" ;
				return false ;
			}
			if ( t.length == 1 && v.hasClass ( 'external' ) ) {
				author_url = v.attr('href') ;
				ret = "<a href='" + author_url + "'>" + v.text() + "</a>" ;
			}
		} ) ;
	}
	
	if ( mode == 'desc' ) {
		var found = 0 ;
		t.find('div.description').each ( function ( k , v ) {
			found++ ;
			v = $(v) ;
			var lang = v.attr('lang') ;
			v.find('span.language').remove() ;
			v.find('span.langlabel-'+lang).remove() ;
			descs[lang] = v.html() ;
		} ) ;
		if ( found == 0 ) {
			descs['full'] = t.text() ;
		}
	}
	
	return ret ;
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
	h1 += "<div style='text-align:center'><b>" + result.title + "</b></div>" ;
	
	if ( desc_mode != 'none' ) {
		h1 += "<div style='font-size:11pt;margin-top:3px;margin-bottom:3px'>" + descs[desc_mode] + "</div>" ;
	}
	
	var license_newline ;
	h1 += "<div>" ;
	if ( result.attribution != '' ) {
		h1 += result.attribution ;
		license_newline = true ;
	} else if ( result.author == '' || result.author.toLowerCase() == 'unknown' ) {
		if ( result.source != '' ) h1 += result.source ;
		else h1 += "Unknown author" ;
	} else {
		h1 += "Created by " + result.author ;
		if ( print_urls && author_url != '' ) {
			if ( author_url.substr ( 0 , 2 ) == '//' ) author_url = 'http:' + author_url ;
			h1 += " <small>(" + author_url + ")</small>" ;
		}
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

function linkCClicense ( v ) {
	v = v.replace(/-migrated$/,'') ;
	var ret = v ;
	var m = v.toLowerCase().match ( /^CC-([A-Z-]+)-([0-9.]+)([A-Z-]*(,.+)*)$/i ) ;
	if ( m ) {
		var url = "http://creativecommons.org/licenses/" + m[1] + "/" + m[2] ;
		if ( m[3] != '' && m[3] != '+' ) url += "/" + m[3].replace(/^-/,'') ;
		ret = renderLinkedLicense ( v , url ) ;
	} else if ( v == 'CC-PD-Mark' ) {
		ret = renderLinkedLicense ( v , 'http://creativecommons.org/publicdomain/mark/1.0/' ) ;
	} else if ( v == 'CC-Zero' ) {
		ret = renderLinkedLicense ( v , 'https://creativecommons.org/publicdomain/zero/1.0/' ) ;
	}
	return ret ;
}

function linkLicense ( license ) {
	var l = $.trim(license.toUpperCase().replace(/_/g,' ').replace(/-migrated$/,'')) ;
	if ( undefined === license2url[l] ) return license ;
	return renderLinkedLicense ( license , license2url[l] ) ;
}

function renderLinkedLicense ( title , url ) {
	var ret = "<a href='" + url + "'>" + title + "</a>" ;
	if ( print_urls ) {
		ret += " <small>(" + url + ")</small>" ;
	}
	return ret ;
}

function getLicense() {
	var ret;
	
	if ( undefined === ret ) {
		$.each ( cats , function ( k , v ) {
			if ( v.match ( /^CC-/ ) ) {
				v = linkCClicense ( v ) ;
				ret = "released under " + v ;
				return false ;
			}
		} ) ;
	}
	
	if ( undefined === ret ) {
		$.each ( cats , function ( k , v ) {
			if ( v.match ( /^PD\b/ ) || v.match ( /^Public domain\b/i ) ) {
				ret = "in the public domain" ;
				return false ;
			}
		} ) ;
	}

	if ( undefined === ret ) { // Some more
		$.each ( cats , function ( k , v ) {
			if ( v.match ( /^(GFDL|GPL|LGPL|AGPL|FAL|CeCILL)\b/i ) ) {
				ret = "released under " + linkLicense ( v ) ;
				return false ;
			}
		} ) ;
	}
	
	if ( undefined === ret ) { // The rest
		$.each ( ['OS OpenData'] , function ( k , v ) {
			if ( -1 < $.inArray ( v , cats ) ) {
				ret = "licensed under " + linkLicense ( v ) ;
				return false ;
			}
		} ) ;
	}
	
	if ( undefined === ret ) ret = 'Unknown license' ;
	return ret ;
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
