( function( define ) {
'use strict';

define( ['jquery', 'Asset'], function( $, Asset ) {

/**
 * Represents a questionnaire's logic.
 * The page names/numbers and the corresponding logic are based on the questionnaire "Webtool für
 * Creative Commons-Lizenzen v1".
 * @constructor
 *
 * @param {jQuery} $node
 * @param {Asset} asset
 *
 * @throws {Error} on incorrect parameters.
 */
var Questionnaire = function( $node, asset ) {
	if( !( $node instanceof $ ) || !( asset instanceof Asset ) ) {
		throw new Error( 'No proper parameters specified' );
	}

	this._$node = $node;
	this._asset = asset;
};

$.extend( Questionnaire.prototype, {
	/**
	 * Node the questionnaire is initialized on.
	 * @type {jQuery}
	 */
	_$node: null,

	/**
	 * Asset the questionnaire shall handle.
	 * @type {Asset}
	 */
	_asset: null,

	/**
	 * Selected answers indexed by page numbers.
	 * @type {Object}
	 */
	_loggedAnswers: null,

	/**
	 * Starts the questionnaire.
	 */
	start: function() {
		this._loggedAnswers = {};

		var licenceId = this._asset.getLicence().getId();

		if( licenceId === 'PD' || licenceId === 'cc-zero' ) {
			this._goTo( '14' );
		} else if( licenceId === 'CC' ) {
			this._goTo( '15' );
		} else {
			this._goTo( '3' );
		}
	},

	/**
	 * Evaluates the answers, generates and renders the result.
	 *
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {jQuery|undefined} Attribution or undefined if unable to generate an attribution.
	 */
	evaluate: function() {
		var self = this,
			deferred = $.Deferred(),
			la = this._loggedAnswers,
			cc2Licences = [
				'cc-by-2.0-de',
				'cc-by-sa-2.0-de'
			],
			cc3Licences = [
				'cc-by-3.0-de',
				'cc-by-3.0',
				'cc-by-sa-3.0-de',
				'cc-by-sa-3.0'
			],
			ccLicences = $.merge( $.merge( [], cc2Licences ), cc3Licences );

		var useCase = la['3'] === 1 ? 'html' : 'print',
			licenceId = this._asset.getLicence().getId(),
			resultId,
			template,
			pages = [];

		if( $.inArray( licenceId, ccLicences ) !== -1 ) {

			if( la['7'] === 2 && la['12a'] === 1 ) {
				resultId = 1;
			}

			if( la['7'] === 2 && la['12a'] === 1 ) {
				resultId = 2;
			}

		}

		if( resultId === 1 || resultId === 2 ) {
			template = '{{author}}, {{title}}, {{licence}}';
		}


		if( resultId === undefined ) {
			this._render( 'r-unsupported' )
			.done( function() {
				deferred.resolve();
			} )
			.fail( function( message ) {
				console.error( message );
			} );

			return deferred.promise();
		}

		if( $.inArray( resultId, [1, 2] ) !== -1 ) {
			if( $.inArray( licenceId, cc2Licences ) !== -1 ) {
				pages.push( 'r-restrictions-2' );
			} else {
				pages.push( 'r-restrictions' );
			}
		}

		pages.push( 'r-note-' + useCase );

		this._render( pages )
		.done( function() {
			deferred.resolve( self._generateAttribution( template, useCase ) );
		} )
		.fail( function( message ) {
			console.error( message );
		} );

		return deferred.promise();
	},

	/**
	 * Generates an attribution tag line.
	 *
	 * @param {string} template
	 * @param {string} useCase "html" or "plain"
	 * @return {jQuery}
	 */
	_generateAttribution: function( template, useCase ) {
		var deferred = $.Deferred();

		var authors = this._asset.getAuthors(),
			$authors = $( '<span/>' ).addClass( 'authors' );

		for( var i = 0; i < authors.length; i++ ) {
			var author = authors[i];

			if( i > 0 ) {
				$authors.append( document.createTextNode( ', ' ) );
			}

			if( !author.getUrl() ) {
				$authors.append( document.createTextNode( author.getName() ) );
				continue;
			}

			if( useCase === 'html' ) {
				$authors.append(
					$( '<a/>' ).attr( 'href', author.getUrl() ).text( author.getName() )
				);
			} else {
				$authors
				.append( document.createTextNode( author.getName() ) )
				.append( document.createTextNode( ' (' + author.getUrl() + ')' ) );
			}
		}

		var licence = this._asset.getLicence();

		var $licence = ( useCase === 'html' )
			? $( '<a/>' ).attr( 'href', licence.getUrl() ).text( licence.getName() )
			: $( '<span/>' ).addClass( 'licence' ).text( licence.getUrl() );

		template = template.replace( /{{title}}/, this._asset.getTitle() );
		template = template.replace( /{{author}}/, $( '<div/>' ).append( $authors ).html() );
		template = template.replace( /{{licence}}/, $( '<div/>' ).append( $licence ).html() );

		return $( '<span/>' ).addClass( 'attribution' ).html( template );
	},

	/**
	 * Move the questionnaire to a specific page or triggers a function.
	 *
	 * @param {string|Function} page
	 */
	_goTo: function( page ) {
		if( $.isFunction( page ) ) {
			page.apply( this );
		} else {
			this._render( page )
			.fail( function( message ) {
				console.error( message );
			} );
		}
	},

	/**
	 * Renders one or more pages.
	 *
	 * @param {string|string[]} pages
	 * @return {Object} jQuery Promise
	 *         No resolved parameters.
	 *         Rejected parameters:
	 *         - {string} Error message.
	 */
	_render: function( pages ) {
		var deferred = $.Deferred(),
			self = this;

		if( typeof pages === 'string' ) {
			pages = [pages];
		}

		this._$node.empty();

		deferred.resolve();

		for( var i = 0; i < pages.length; i++ ) {
			var page = pages[i];
			deferred.then( function() {
				self._getTemplate( page )
				.done( function( $content ) {
					self._$node.append( $content );
					self._applyLogic( page );
				} );
			} );
		}

		return deferred;
	},

	/**
	 * Retrieves a questionnaire template by name.
	 *
	 * @param {string} name
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {jQuery} Template
	 *         Rejected parameters:
	 *         - {string} Error message
	 */
	_getTemplate: function( name ) {
		var deferred = $.Deferred();

		$.get( './templates/' + name + '.html' )
		.done( function( html ) {
			deferred.resolve( $( '<div class="page-' + name + '" />' ).html( html ) );
		} )
		.fail( function() {
			deferred.reject( 'Unable to retrieve template ' + name );
		} );

		return deferred.promise();
	},

	/**
	 * Applies logic of a specific page.
	 *
	 * @param {string} p Page
	 */
	_applyLogic: function( p ) {
		var self = this;

		if( p === '3' ) {
			this._applyLogAndGoTo( p, 1, '7' );
			this._applyLogAndGoTo( p, 2, '7' );

			this._$node.find( '.page-3 .a3' ).on( 'click', function() {
				self._log( p, 3 );
				if(
					self._asset.getLicence().getId() === 'cc-by-2.0-de'
					|| self._asset.getLicence().getId() === 'cc-by-sa-2.0-de'
				) {
					self._goTo( '7' );
				} else {
					self._goTo( '4' );
				}
			} );

			this._applyLogAndGoTo( p, 4, '5' );
			this._applyLogAndGoTo( p, 5, '6' );
		} else if( p === '5') {
			this._applyLogAndGoTo( p, 1, '3' );
			this._applyLogAndGoTo( p, 2, '5a' )
		} else if( p === '7' ) {
			var goTo = this._loggedAnswers['3'] === 2 ? '8' : '12a';
			this._applyLogAndGoTo( p, 1, goTo );
			this._applyLogAndGoTo( p, 2, goTo );
		} else if( p === '8' ) {
			this._applyLogAndGoTo( p, 1, '12a' );
			this._applyLogAndGoTo( p, 2, '12a' );
		} else if( p === '12a' ) {
			this._applyLogAndGoTo( p, 1, this.evaluate );
			this._applyLogAndGoTo( p, 2, '12b' );
		} else if( p === '12b' ) {
			this._applyLogAndGoTo( p, 1, '13' );
			this._applyLogAndGoTo( p, 2, '12c' );
		} else if( p === '13' ) {
			this._$node.find( 'a.a1' ).on( 'click', function() {
				var value = $.trim( $( 'input.a1' ).val() );
				self._log( '13', value );
				self._goTo( self.evaluate );
			} );
		}
	},

	/**
	 * Logs an answer.
	 *
	 * @param {string} page
	 * @param {number|string} answer
	 */
	_log: function( page, answer ) {
		this._loggedAnswers[page] = answer;
	},

	/**
	 * Short-cut that logs an answer and triggers going to some page.
	 *
	 * @param {string} currentPage
	 * @param {number|string} answer
	 * @param {string|Function} toPage
	 */
	_applyLogAndGoTo: function( currentPage, answer, toPage ) {
		var self = this;

		this._$node.find( '.page-' + currentPage + ' .a' + answer ).on( 'click', function() {
			self._log( currentPage, answer );
			self._goTo( toPage );
		} );
	}

} );

return Questionnaire;

} );

}( define ) );
