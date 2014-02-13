( function( define ) {
'use strict';

define( ['jquery', 'Asset'], function( $, Asset ) {

var CC2_LICENCES = [
	'cc-by-2.0-de',
	'cc-by-sa-2.0-de'
];

var CC3_LICENCES = [
	'cc-by-3.0-de',
	'cc-by-3.0',
	'cc-by-sa-3.0-de',
	'cc-by-sa-3.0'
];

var CC_LICENCES = $.merge( $.merge( [], CC2_LICENCES ), CC3_LICENCES );

/**
 * Represents a questionnaire's logic.
 * The page names/numbers and the corresponding logic are based on the questionnaire "Webtool für
 * Creative Commons-Lizenzen v1".
 * @constructor
 *
 * @param {jQuery} $node
 * @param {Asset} asset
 *
 * @event update Triggered whenever the attribution is updated (basically, whenever a new answer is
 *        selected).
 *        (1) {jQuery.Event}
 *        (2) {jQuery} Attribution
 *        (3) {Object} jQuery Promise (see generateSupplement() for parameters)
 *
 * @event exit Triggered when the questionnaire is completed.
 *        (1) {jQuery.Event}
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
		// Initialize with default values:
		this._loggedAnswers = {
			'13': {
				'1': '(bearbeitet)'
			}
		};

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
	 * Returns a logged answers or "false" if the specific answer has not yet been given.
	 *
	 * @param {string} page
	 * @param {number} answerId
	 * @return {string|boolean}
	 */
	_getAnswer: function( page, answerId ) {
		var pageAnswers = this._loggedAnswers[page];
		return ( pageAnswers && pageAnswers[answerId] ) ? pageAnswers[answerId] : false;
	},

	/**
	 * Returns the result id or "undefined" if unable to return a result according to the answers
	 * selected.
	 *
	 * @return {string|undefined}
	 */
	_getResultId: function() {
		var resultId,
			onlineUse = this._getAnswer( '3', 1 ),
			collectionUse = this._getAnswer( '7', 1 ),
			fullLicence = this._getAnswer( '8', 1 ),
			edited = this._getAnswer( '12a', 2 );

		if( $.inArray( this._asset.getLicence().getId(), CC_LICENCES ) !== -1 ) {
			// Default attribution:
			resultId = '2';

			if( onlineUse && !collectionUse && !edited ) {
				resultId = '1';
			} else if( !onlineUse && !collectionUse && !fullLicence && !edited ) {
				resultId = '2';
			} else if( !onlineUse && !collectionUse && fullLicence && !edited ) {
				resultId = '3';
			} else if( onlineUse && collectionUse && !edited ) {
				resultId = '4a';
			} else if( !onlineUse && collectionUse && !fullLicence && !edited ) {
				resultId = '4b';
			} else if( !onlineUse && collectionUse && fullLicence && !edited ) {
				resultId = '4c';
			} else if( onlineUse && !collectionUse && edited ) {
				resultId = '5';
			} else if( !onlineUse && !collectionUse && !fullLicence && edited ) {
				resultId = '6';
			} else if( !onlineUse && !collectionUse && fullLicence && edited ) {
				resultId = '7';
			} else if( onlineUse && collectionUse && edited ) {
				resultId = '8a';
			} else if( !onlineUse && collectionUse && !fullLicence && edited ) {
				resultId = '8b';
			} else if( !onlineUse && collectionUse && fullLicence && edited ) {
				resultId = '8c';
			}

		}

		return resultId;
	},

	/**
	 * Returns the use case which may either be "html" or "print" with the latter one acting as
	 * fall-back.
	 *
	 * @return {string}
	 */
	_getUseCase: function() {
		return this._getAnswer( '3', 1 ) ? 'html' : 'print';
	},

	/**
	 * Exits the questionnaire.
	 *
	 * @triggers update
	 * @triggers exit
	 */
	exit: function() {
		this._$node.empty();
		this._$node.trigger( 'update', [this.generateAttribution(), this.generateSupplement()] );
		this._$node.trigger( 'exit' );
	},

	/**
	 * Generates the attribution supplement containing notes and restrictions.
	 *
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {jQuery} List of jQuery wrapped DOM nodes.
	 *         Rejected parameters:
	 *         - {string} Error message.
	 */
	generateSupplement: function() {
		var self = this,
			deferred = $.Deferred(),
			resultId = this._getResultId(),
			licenceId = this._asset.getLicence().getId(),
			pages = [];

		pages.push( 'r-note-' + this._getUseCase() );

		if( $.inArray( licenceId, CC2_LICENCES ) !== -1 ) {
			pages.push( 'r-restrictions-cc2' );
		} else {
			pages.push( 'r-restrictions' );
		}

		if( resultId === '3' || resultId === '7' ) {
			pages.push( 'r-note-fullLicence' );
			this._fetchPages( pages )
			.done( function( $nodes ) {
				self._asset.getLicence().getLegalCode()
				.done( function( $licence ) {
					$nodes = $nodes.add( $licence );
					deferred.resolve( $nodes );
				} )
				.fail( function( message ) {
					deferred.reject( message );
				} );
			} )
			.fail( function( message ) {
				deferred.reject( message );
			} );
		} else if(
			$.inArray( '4', resultId.split( '' ) ) !== -1
			|| $.inArray( '8', resultId.split( '' ) ) !== -1
		) {
			pages.push( 'r-note-collection' );
			this._fetchPages( pages )
			.done( function( $nodes ) {
				$nodes = $nodes.add( self.generateAttribution( { licenceOnly: true } ) );
				deferred.resolve( $nodes );
			} )
			.fail( function( message ) {
				deferred.fail( message );
			} );
		} else {
			this._fetchPages( pages )
			.done( function( $nodes ) {
				deferred.resolve( $nodes );
			} )
			.fail( function( message ) {
				deferred.reject( message );
			} );
		}

		return deferred.promise();
	},

	/**
	 * Generates an attribution tag line from the current set of answers.
	 *
	 * @param {Object} [options]
	 * @return {jQuery}
	 */
	generateAttribution: function( options ) {
		options = $.extend( {
			licenceOnly: false
		}, options );

		var resultId = this._getResultId(),
			$author = this._generateAttributionAuthor(),
			$title = this._generateAttributionTitle(),
			$licence = this._generateAttributionLicence(),
			$editor = this._generateAttributionEditor(),
			$attribution = $( '<div/>' ).addClass( 'attribution' );

		if( options.licenceOnly ) {
			return $attribution.append( $licence );
		} else if( resultId === '1' || resultId === '2' || resultId === '4a' || resultId === '4b' ) {
			$attribution
			.append( $author )
			.append( document.createTextNode( ', ' ) )
			.append( $title )
			.append( document.createTextNode( ', ' ) )
			.append( $licence );
		} else if( resultId === '3' || resultId === '4c' ) {
			$attribution
			.append( $author )
			.append( document.createTextNode( ', ' ) )
			.append( $title )
			.append( document.createTextNode( ', ' ) )
			.append( this._asset.getLicence().getName() )
		} else if( resultId === '5' || resultId === '6' ) {
			$attribution
			.append( $author )
			.append( document.createTextNode( ', ' ) )
			.append( $title )
			.append( document.createTextNode( ' ' ) )
			.append( $editor )
			.append( document.createTextNode( ', ' ) )
			.append( $licence );
		} else if( resultId === '7' ) {
			$attribution
			.append( $author )
			.append( document.createTextNode( ', ' ) )
			.append( $title )
			.append( document.createTextNode( ', ' ) )
			.append( $editor );
		}

		return $attribution;
	},

	/**
	 * Generates the author(s) DOM to be used in the tag line.
	 *
	 * @return {jQuery}
	 */
	_generateAttributionAuthor: function() {
		var authors = this._asset.getAuthors(),
			$authors = $( '<span/>' ).addClass( 'author' );

		for( var i = 0; i < authors.length; i++ ) {
			var author = authors[i];

			if( i > 0 ) {
				$authors.append( document.createTextNode( ', ' ) );
			}

			if( !author.getUrl() ) {
				$authors.append( document.createTextNode( author.getName() ) );
				continue;
			}

			var authorUrl = author.getUrl();
			if( authorUrl.substr( 0, 2 ) === '//' ) {
				authorUrl = 'http:' + authorUrl;
			}

			if( this._getUseCase() === 'html' ) {
				$authors.append( $( '<a/>' ).attr( 'href', authorUrl ).text( author.getName() ) );
			} else {
				$authors
					.append( document.createTextNode( author.getName() ) )
					.append( document.createTextNode( ' (' + authorUrl + ')' ) );
			}
		}

		return $authors;
	},

	/**
	 * Generates the licence DOM to be used in the tag line.
	 *
	 * @return {jQuery}
	 */
	_generateAttributionLicence: function() {
		var licence = this._asset.getLicence();

		return ( this._getUseCase() === 'html' )
			? $( '<a/>' ).addClass( 'licence' )
				.attr( 'href', licence.getUrl() ).text( licence.getName() )
			: $( '<span/>' ).addClass( 'licence' ).text( licence.getUrl() );
	},

	/**
	 * Generates the asset title DOM to be used in the tag line.
	 *
	 * @return {jQuery}
	 */
	_generateAttributionTitle: function() {
		return $( '<span/>' ).addClass( 'title' ).text( '„' + this._asset.getTitle() + '“' );
	},

	/**
	 * Generates the editor DOM to be use in the tag line. If no editor is specified, an empty
	 * jQuery object will be returned.
	 *
	 * @return {jQuery}
	 */
	_generateAttributionEditor: function() {
		var editor = this._getAnswer( '13', 1 ),
			$editor = $();

		if( editor ) {
			$editor = $( '<span/>' ).addClass( 'editor' ).text( editor );
		}

		return $editor;
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
			this._render( page );
		}
	},

	/**
	 * Renders one or more pages.
	 *
	 * @param {string} page
	 */
	_render: function( page ) {
		var self = this;

		this._$node.empty();

		this._fetchPages( page )
		.done( function( $content ) {
			self._$node.append( $content );
		} )
		.fail( function( message ) {
			console.error( message );
		} );
	},

	/**
	 * Fetches the DOM structure(s) of one ore more template pages by id(s).
	 *
	 * @param {string|string[]} pages
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {jQuery} jQuery wrapped DOM node(s) of the requested page(s).
	 *         Rejected parameters
	 *         - {string} Error message.
	 */
	_fetchPages: function( pages ) {
		var self = this,
			deferred = $.Deferred(),
			promises = [],
			$pages = $();

		if( typeof pages === 'string' ) {
			pages = [pages];
		}

		for( var i = 0; i < pages.length; i++ ) {
			( function( page ) {
				deferred.then( function() {
					var d = $.Deferred();

					$.get( './templates/' + page + '.html' )
					.done( function( html ) {
						var $content = $( '<div class="page-' + page + '" />' )
							.data( 'questionnaire-page', page )
							.html( html );

						$content = self._applyGenerics( $content );
						$content = self._applyValuesToInputElements( $content );
						$pages = $pages.add( self._applyLogic( $content ) );

						d.resolve( $pages );
					} )
					.fail( function() {
						d.reject( 'Unable to retrieve page ' + page );
					} );

					promises.push( d.promise() );

					return d.promise();
				} );
			}( pages[i] ) );
		}

		deferred.resolve( $pages );

		return promises[promises.length - 1];
	},

	/**
	 * Applies generic HTML and functionality to a page's DOM.
	 *
	 * @param {jQuery} $page
	 * @return {jQuery}
	 */
	_applyGenerics: function( $page ) {
		var self = this;

		$page.find( 'ul.answers li' )
		.prepend( $( '<span/>' ).addClass( 'checkbox' ).html( '&nbsp;' ) )
		.on( 'mouseover', function( event ) {
			var $checkbox = $( event.target ).find( '.checkbox' );
			self._startCheckboxAnimation( $checkbox );
		} )
		.on( 'mouseout', function( event ) {
			var $checkbox = $( event.target ).find( '.checkbox' );
			self._stopCheckboxAnimation( $checkbox );
		} );

		return $page;
	},

	/**
	 * Applies default or existing answers to input elements.
	 *
	 * @param {jQuery} $page
	 */
	_applyValuesToInputElements: function( $page ) {
		var self = this,
			page = $page.data( 'questionnaire-page' );

		$page.find( 'input' ).each( function() {
			var $input = $( this ),
				classes = $input.attr( 'class' ).split( ' ' );

			for( var i = 0; i < classes.length; i++ ) {
				if( /^a[0-9]{1}$/.test( classes[i] ) ) {
					var answerId = classes[i].split( 'a' )[1];
					if( self._loggedAnswers[page] && self._loggedAnswers[page][answerId] ) {
						$input.val( self._loggedAnswers[page][answerId] );
					}
				}
			}

		} );

		return $page;
	},

	/**
	 * Starts a checkbox ticking animation.
	 *
	 * @param {jQuery} $checkbox
	 */
	_startCheckboxAnimation: function( $checkbox ) {
		var deferred = $.Deferred(),
			promise = deferred.promise();

		$checkbox.data( 'app-animation', deferred );

		var queue = [];
		for( var i = -1; i >= -4; i-- ) {
			( function( offsetFactor ) {
				queue.push( function() {
					$checkbox.css( 'backgroundPosition', offsetFactor * 20 + 'px 0' );
				} );
			}( i ) );
		}

		function next() {
			if( promise.state() === 'resolved' ) {
				$checkbox.css( 'backgroundPosition', '0 0' );
				queue = [];
			}

			if( queue.length === 0 ) {
				return;
			}

			queue.shift()();

			setTimeout( function() {
				next();
			}, 25 );
		}

		next();
	},

	/**
	 * Stops a checkbox ticking animation.
	 *
	 * @param {jQuery} $checkbox
	 */
	_stopCheckboxAnimation: function( $checkbox ) {
		var deferred = $checkbox.data( 'app-animation' );

		if( !deferred ) {
			return;
		}

		deferred.resolve();

		deferred.promise().done( function() {
			$checkbox.css( 'backgroundPosition', '0 0' );
			$checkbox.removeData( 'app-animation' );
		} );
	},

	/**
	 * Applies logic of a specific page to a node.
	 *
	 * @param {jQuery} $page
	 * @return {jQuery}
	 */
	_applyLogic: function( $page ) {
		var self = this,
			p = $page.data( 'questionnaire-page' );

		if( p === '3' ) {
			$page = this._applyLogAndGoTo( $page, p, 1, '7' );
			$page = this._applyLogAndGoTo( $page, p, 2, '7' );

			$page.find( '.a3' ).on( 'click', function() {
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

			$page = this._applyLogAndGoTo( $page, p, 4, '5' );
			$page = this._applyLogAndGoTo( $page, p, 5, '6' );
		} else if( p === '5') {
			$page = this._applyLogAndGoTo( $page, p, 1, '3' );
			$page = this._applyLogAndGoTo( $page, p, 2, '5a' )
		} else if( p === '7' ) {
			var goTo = this._getAnswer( '3', 2 ) ? '8' : '12a';
			$page = this._applyLogAndGoTo( $page, p, 1, goTo );
			$page = this._applyLogAndGoTo( $page, p, 2, goTo );
		} else if( p === '8' ) {
			$page = this._applyLogAndGoTo( $page, p, 1, '12a' );
			$page = this._applyLogAndGoTo( $page, p, 2, '12a' );
		} else if( p === '12a' ) {
			$page = this._applyLogAndGoTo( $page, p, 1, this.exit );
			$page = this._applyLogAndGoTo( $page, p, 2, '12b' );
		} else if( p === '12b' ) {
			$page = this._applyLogAndGoTo( $page, p, 1, '13' );
			$page = this._applyLogAndGoTo( $page, p, 2, '12c' );
		} else if( p === '13' ) {
			$page.find( 'a.a1' ).on( 'click', function() {
				var value = $.trim( $( 'input.a1' ).val() );
				self._log( '13', 1, value );
				self._goTo( self.exit );
			} );
		}

		return $page;
	},

	/**
	 * Logs an answer.
	 *
	 * @param {string} page
	 * @param {number|string} answer
	 * @param {string} [value] If omitted, boolean "true" is logged for the answer.
	 *
	 * @triggers update
	 */
	_log: function( page, answer, value ) {
		if( !this._loggedAnswers[page] ) {
			this._loggedAnswers[page] = {};
		}
		this._loggedAnswers[page][answer] = ( value ) ? value : true;
		this._$node.trigger( 'update', [this.generateAttribution(), this.generateSupplement()] );
	},

	/**
	 * Short-cut that logs an answer and triggers going to some page.
	 *
	 * @param {jQuery} $page
	 * @param {string} currentPage
	 * @param {number|string} answer
	 * @param {string|Function} toPage
	 */
	_applyLogAndGoTo: function( $page, currentPage, answer, toPage ) {
		var self = this;

		$page.find( '.a' + answer ).on( 'click', function() {
			self._log( currentPage, answer );
			self._goTo( toPage );
		} );

		return $page;
	}

} );

return Questionnaire;

} );

}( define ) );
