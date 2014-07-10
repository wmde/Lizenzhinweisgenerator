/**
 * @licence GNU GPL v3
 * @author snater.com < wikimedia@snater.com >
 */
/* global alert */
define( [
	'jquery',
	'app/AttributionGenerator',
	'app/QuestionnairePage',
	'dojo/i18n!./nls/Questionnaire',
	'templates/registry',
	'app/AjaxError'
], function( $, AttributionGenerator, QuestionnairePage, messages, templateRegistry, AjaxError ) {
'use strict';

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
 *
 * @event back Triggered when navigating back out of the questionnaire's context.
 *       (1) {jQuery.Event}
 *       (2) {Asset}
 *
 * @throws {Error} on incorrect parameters.
 * @throws {Error} if asset does not feature a proper licence.
 */
var Questionnaire = function( $node, asset ) {
	if( !( $node instanceof $ ) || asset === undefined ) {
		throw new Error( 'No proper parameters specified' );
	}

	if( !asset.getLicence() ) {
		throw new Error( 'Asset does not feature a proper licence' );
	}

	this._$node = $node.addClass( 'questionnaire' );
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
	 * Caching string answers additionally in a separate object to have them restored when
	 * re-accessing pages (e.g. by navigating back and forth).
	 * @type {Object}
	 */
	_loggedStrings: null,

	/**
	 * Caches the navigation path and a copy of the loggedAnswers object for resetting when
	 * navigating backwards.
	 * @type {Object[]}
	 */
	_navigationCache: null,

	/**
	 * @type {AttributionGenerator|null}
	 */
	_attributionGenerator: null,

	/**
	 * Starts the questionnaire.
	 *
	 * @return {Object} jQuery Promise
	 *         No resolved parameters.
	 *         Rejected parameters:
	 *         - {AjaxError}
	 */
	start: function() {
		this._loggedAnswers = {};
		this._loggedStrings = {};

		this._navigationCache = [];

		var deferred = $.Deferred(),
			licenceId = this._asset.getLicence().getId(),
			page = '3';

		if( licenceId === 'PD' || licenceId === 'cc-zero' ) {
			page = this._exit;
		} else if( licenceId === 'CC' || licenceId === 'unknown' ) {
			page = '2';
		} else if( this._asset.getAuthors().length === 0 ) {
			page = '9';
		} else if(
			!this._asset.getLicence().isInGroup( 'cc4' )
			&& this._asset.getTitle().length === 0
		) {
			page = '10';
		} else if( this._asset.getUrl().length === 0 ) {
			page = '11';
		}

		this._goTo( page )
		.done( function() {
			deferred.resolve();
		} )
		.fail( function( error ) {
			deferred.reject( error );
		} );

		return deferred.promise();
	},

	/**
	 * Move the questionnaire to a specific page or triggers a function.
	 *
	 * @param {string|Function} page
	 * @param {boolean} [movingBack]
	 *        Default: false
	 * @return {Object} jQuery Promise
	 *         No resolved parameters.
	 *         Rejected parameters:
	 *         - {AjaxError}
	 */
	_goTo: function( page, movingBack ) {
		var self = this,
			deferred = $.Deferred(),
			navigationPathPosition = this._getNavigationPosition( page );

		if( navigationPathPosition !== -1 && movingBack ) {
			// Navigating backwards.
			this._navigationCache.splice( navigationPathPosition );
			this._loggedAnswers = this._navigationCache[navigationPathPosition]
				? this._navigationCache[navigationPathPosition].loggedAnswers
				: {};
		}

		var $container = this._$node.find( '.questionnaire-contentcontainer' );

		if( $container.length === 0 ) {
			return this._resolveGoto( page );
		}

		var initialLeftMargin = $container.css( 'marginLeft' ),
			newLeftMargin = movingBack ? $( document ).width() : -1 * $container.width();

		// Fixate width to prevent wrapping:
		$container.width( $container.width() );

		$container.find( '.questionnaire-icon-minimize' ).hide();

		$container.stop().animate( {
			marginLeft: newLeftMargin + 'px'
		}, 'fast' ).promise().done( function() {
			self._resolveGoto( page )
			.done( function() {
				$container = self._$node.find( '.questionnaire-contentcontainer' );
				$container.width( $container.width() );

				var startLeftMargin = movingBack
					? -1 * $container.width()
					: $( document ).width();

				$container.css( 'marginLeft', startLeftMargin + 'px' );

				$container.stop().animate( {
					marginLeft: initialLeftMargin
				}, 'fast' ).promise().done( function() {
					$container.css( 'width', 'auto' );
					deferred.resolve();
				} );
			} ).fail( function( error ) {
				deferred.reject( error );
			} );
		} );

		return deferred.promise();
	},

	/**
	 * Resolves going to a specific page.
	 *
	 * @param {string|Function} page
	 * @return {Object} jQuery Promise
	 *         No resolved parameters.
	 *         Rejected parameters:
	 *         - {AjaxError}
	 */
	_resolveGoto: function( page ) {
		var self = this,
			deferred = $.Deferred();

		if( $.isFunction( page ) ) {
			page.apply( this );
			deferred.resolve();
		} else {
			this._render( page )
			.done( function() {
				deferred.resolve();
			} )
			.fail( function( error ) {
				self._render( 'error' )
				.done( function( $content ) {
					$content.find( '.questionnaire-error' )
						.addClass( 'error' )
						.text( error.getMessage() );
				} )
				.fail( function( error ) {
					alert( error.getMessage() );
				} );

				deferred.reject( error );
			} );
		}

		return deferred.promise();
	},

	/**
	 * Returns the position of a page in the navigation cache or -1 if the page is not cached.
	 *
	 * @param {string} page
	 * @return {number}
	 */
	_getNavigationPosition: function( page ) {
		for( var i = 0; i < this._navigationCache.length; i++ ) {
			if( this._navigationCache[i].page === page ) {
				return i;
			}
		}
		return -1;
	},

	/**
	 * Renders a page.
	 *
	 * @param {string} page
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         {jQuery} Page content
	 *         Rejected parameters:
	 *         - {AjaxError}
	 */
	_render: function( page ) {
		var self = this,
			deferred = $.Deferred();

		this._$node.empty();

		this._fetchPages( page )
		.done( function( $content ) {
			self._$node.append(
				$( '<div/>' ).addClass( 'questionnaire-contentcontainer' )
				.append( self._generateMinimizeButton() )
				.append( self._generateBackButton() )
				.append(
					$( '<div/>' ).addClass( 'questionnaire-pagecontainer' ).append( $content )
				)
			);

			self._toggleMinimized( 'maximize' );

			deferred.resolve( $content );
		} )
		.fail( function( error ) {
			deferred.reject( error );
		} );

		return deferred.promise();
	},

	/**
	 * Returns a result object containing processable attributes of the evaluated current answer
	 * set.
	 *
	 * @return {Object}
	 */
	_getResult: function() {
		var useCase = false;

		if( this._getAnswer( '3', 1 ) ) {
			useCase = 'online';
		} else if( this._getAnswer( '3', 2 ) ) {
			useCase = 'print';
		} else if( this._getAnswer( '3', 3 ) ) {
			useCase = 'private';
		} else if( this._getAnswer( '3', 4 ) ) {
			useCase = 'exceptional';
		} else if( this._getAnswer( '3', 5 ) ) {
			useCase = 'other';
		}

		return {
			attributionAlthoughExceptionalUse: this._getAnswer( '5', 1 ),
			collectionUse: this._getAnswer( '7', 1 ),
			edited: this._getAnswer( '12a', 2 ),
			editor: this._getAnswer( '13', 1 ),
			format: this._getAnswer( '3', 1 ) ? 'html' : 'text',
			fullLicence: this._getAnswer( '8', 1 ),
			useCase: useCase
		};
	},

	/**
	 * Returns a logged answer or "false" if the specific answer has not yet been given.
	 *
	 * @param {string} page
	 * @param {number} answerId
	 * @return {string|boolean}
	 */
	_getAnswer: function( page, answerId ) {
		var pageAnswers = this._loggedAnswers[page];

		if( !pageAnswers || !pageAnswers[answerId] ) {
			return false;
		}

		return $.isFunction( pageAnswers[answerId] )
			? pageAnswers[answerId]( this )
			: pageAnswers[answerId];
	},

	/**
	 * Exits the questionnaire.
	 *
	 * @throws {Error} if questionnaire has not yet been started.
	 */
	_exit: function() {
		if( this._navigationCache === null ) {
			throw new Error( 'Trying to exit questionnaire although it hast not been started' );
		}

		this._$node.remove();
	},

	/**
	 * Generates the attribution supplement containing notes and restrictions.
	 *
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {jQuery} List of jQuery wrapped DOM nodes
	 *         Rejected parameters:
	 *         - {AjaxError}
	 */
	generateSupplement: function() {
		var self = this,
			deferred = $.Deferred(),
			result = this._getResult(),
			licence = this._asset.getLicence(),
			pages = [];

		if( result.useCase === 'other' ) {
			deferred.resolve( $() );
			return deferred.promise();
		}

		var $supplement = $( '<h2/>' )
			.text( messages['notes and advice'] );

		if( result.useCase === 'private' ) {
			pages.push( 'result-note-privateUse' );
		} else if( licence.isInGroup( 'cc0' ) ) {
			pages.push( 'result-note-cc0' );
		} else if( licence.isInGroup( 'pd' ) ) {
			pages.push( 'result-note-pd' );
		} else {
			pages.push( 'result-note-' + result.format );

			if( licence.isInGroup( 'cc2' ) ) {
				pages.push( 'result-restrictions-cc2' );
			} else {
				pages.push( 'result-restrictions' );
			}
		}

		if( result.collectionUse ) {
			pages.push( 'result-note-collection' );
		}

		if( result.fullLicence ) {
			pages.push( 'result-note-fullLicence' );
		}

		this._fetchPages( pages )
		.done( function( $nodes ) {
			if( result.collectionUse ) {
				$nodes.filter( '.page-result-note-collection' ).append(
					self.getAttributionGenerator( { licenceOnly: true } ).generate()
				);
			}

			if( result.fullLicence ) {
				self._asset.getLicence().getLegalCode()
				.done( function( $licence ) {
					$nodes.filter( '.page-result-note-fullLicence' ).append( $licence );
					deferred.resolve( $supplement.add( $nodes ) );
				} )
				.fail( function( error ) {
					deferred.reject( error );
				} );
			} else {
				deferred.resolve( $supplement.add( $nodes ) );
			}
		} )
		.fail( function( error ) {
			deferred.reject( error );
		} );

		return deferred.promise();
	},

	/**
	 * Instantiates an AttributionGenerator object.
	 *
	 * @param {Object} [options]
	 * @return {AttributionGenerator}
	 */
	getAttributionGenerator: function( options ) {
		var result = this._getResult(),
			editor = null;

		if( result.edited ) {
			editor = messages['(edited)'];
		}
		if( result.edited && result.editor ) {
			editor = result.editor;
		}

		options = $.extend( {
			editor: editor,
			licenceOnly: options ? options.licenceOnly : false,
			licenceLink: !result.fullLicence,
			format: result.format
		}, options );

		var attributionGenerator = new AttributionGenerator( this._asset, options );

		// Return cached attribution generator for allowing external objects to check whether a
		// change actually has occurred.
		if( !attributionGenerator.equals( this._attributionGenerator ) ) {
			this._attributionGenerator = attributionGenerator;
		}

		return this._attributionGenerator;
	},

	/**
	 * Generates the "back" button.
	 *
	 * @return {jQuery}
	 *
	 * @triggers update
	 * @triggers back
	 */
	_generateBackButton: function() {
		var self = this,
			$backButton = $( '<div/>' )
			.addClass( 'questionnaire-back' )
			.append( $( '<a/>' ).addClass( 'button' ).html( '&#9664;' ) );

		$backButton.on( 'click', function() {
			if( self._navigationCache.length === 0 ) {
				$( self ).trigger( 'back', [self._asset] );
			} else {
				self._goTo( self._navigationCache[self._navigationCache.length - 1].page, true )
				.done( function() {
					$( self ).trigger( 'update' );
				} );
			}
		} );

		return $backButton;
	},

	/**
	 * Creates the "minimize" button.
	 *
	 * @return {jQuery}
	 */
	_generateMinimizeButton: function() {
		var self = this;

		return $( '<div/>' ).addClass( 'questionnaire-icon-minimize button' )
			.on( 'click', function() {
				self._toggleMinimized();
			} );
	},

	/**
	 * Toggles between minimized/maximized visibility.
	 *
	 * @param {string} forceState "maximized"|"minimized"
	 */
	_toggleMinimized: function( forceState ) {
		var minimize = this._$node.offset().left >= 0;

		if( forceState ) {
			minimize = forceState === 'minimize';
		}

		var marginLeft = minimize ? this._$node.width() - 100 : 0;

		this._$node.stop().animate( {
			'marginLeft': marginLeft === 0 ? '0' : ( marginLeft * - 1 ) + 'px'
		}, 'fast' );

		this._$node.find( '.questionnaire-back' ).stop().animate( {
			'marginLeft': marginLeft === 0 ? '0' : marginLeft + 'px'
		}, 'fast' );

		this._$node.find( '.questionnaire-icon-minimize' )
			[minimize ? 'addClass' : 'removeClass']( 'minimized' )
			.css( 'marginLeft', marginLeft === 0 ? '0' : ( marginLeft + 115 ) + 'px' )
			.text( minimize ? '»' :  '«' );
	},

	/**
	 * Fetches the DOM structure(s) of one ore more template pages by id(s).
	 *
	 * @param {string|string[]} pages
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {jQuery} jQuery wrapped DOM node(s) of the requested page(s).
	 *         Rejected parameters:
	 *         - {string} Error message.
	 */
	_fetchPages: function( pages ) {
		var deferreds = [$.Deferred()],
			$pages = $();

		if( typeof pages === 'string' ) {
			pages = [pages];
		}

		deferreds[0].resolve( $pages );

		for( var i = 0; i < pages.length; i++ ) {
			deferreds.push( this._fetchPage( deferreds[deferreds.length - 1], pages[i] ) );
		}

		return deferreds[deferreds.length - 1].promise();
	},

	/**
	 * Fetches the DOM structure of a specific page by id and adds it to preexisting DOM.
	 *
	 * @param {Object} deferred jQuery Deferred
	 *        Required resolved parameter:
	 *        - {jQuery} Preexisting DOM
	 * @param {string} page
	 * @return {Object} jQuery Deferred
	 *         Resolved parameters:
	 *         - {jQuery} Preexisting DOM with added page DOM
	 */
	_fetchPage: function( deferred, page ) {
		var self = this,
			d = $.Deferred();

		deferred.then( function( $pages ) {
			var ajaxOptions = {
				url: templateRegistry.getDir( 'questionnaire' ) + page + '.html',
				dataType: 'html'
			};

			$.ajax( ajaxOptions )
			.done( function( html ) {
				var questionnairePage = new QuestionnairePage(
					page,
					html,
					self._asset,
					self._getResult(),
					self._loggedStrings
				);

				questionnairePage.applyValuesToInputElements( self._loggedStrings[page] );

				$( questionnairePage )
				.on( 'log', function( event, o ) {
					if( o.answer === undefined ) {
						delete self._loggedAnswers[o.page];
						delete self._loggedStrings[o.page];
						questionnairePage.setResult( self._getResult() );
					} else {
						self._log( o.page, o.answer, o.value, o.cacheNavigation );
					}
				} )
				.on( 'goto', function( event, toPage ) {
					self._goToAndUpdate( toPage );
				} )
				.on( 'update', function( event, asset ) {
					self._asset = asset;
					$( self ).trigger( 'update' );
					questionnairePage.setResult( self._getResult() );
				} );

				$pages = $pages.add( questionnairePage.$page );
				d.resolve( $pages );
			} )
			.fail( function() {
				d.reject( new AjaxError( 'questionnaire-page-missing', ajaxOptions ) );
			} );

			return d.promise();
		} );

		return d;
	},

	/**
	 * Returns a logged string.
	 *
	 * @param {string} page
	 * @param {number} answer
	 * @return {string}
	 */
	getLoggedString: function( page, answer ) {
		if( this._loggedStrings[page] && this._loggedStrings[page][answer] ) {
			return this._loggedStrings[page][answer];
		}
		return null;
	},

	/**
	 * Logs an answer.
	 *
	 * @param {string} page
	 * @param {number|string} answer
	 * @param {string|Function|boolean} [value] If omitted, boolean "true" is logged for the answer.
	 *        If of type "boolean", the value is assumed to be the value for the "cacheNavigation"
	 *        parameter.
	 * @param {boolean} cacheNavigation (Default: true)
	 */
	_log: function( page, answer, value, cacheNavigation ) {
		if( typeof value === 'boolean' ) {
			cacheNavigation = value;
			value = undefined;
		}

		// (re)initialize page answer
		this._loggedAnswers[page] = {};
		this._loggedAnswers[page][answer] = ( value ) ? value : true;

		if( cacheNavigation === undefined || cacheNavigation === true ) {
			this._navigationCache.push( {
				page: page,
				loggedAnswers: $.extend( {}, this._loggedAnswers )
			} );
		}

		if( typeof value === 'string' ) {
			if( !this._loggedStrings[page] ) {
				this._loggedStrings[page] = {};
			}
			if( !this._loggedStrings[page][answer] ) {
				this._loggedStrings[page] = {};
			}
			this._loggedStrings[page][answer] = value;
		}
	},

	/**
	 * Triggers going to a page and issues an "update" event after rendering the page.
	 *
	 * @param {string|Function} toPage
	 *
	 * @triggers update
	 */
	_goToAndUpdate: function( toPage ) {
		var self = this;

		this._goTo( toPage )
		.done( function() {
			$( self ).trigger( 'update' );
		} );
	}

} );

return Questionnaire;

} );
