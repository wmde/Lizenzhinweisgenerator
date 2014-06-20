/**
 * @licence GNU GPL v3
 * @author snater.com < wikimedia@snater.com >
 */
/* global alert */
define(
	[
		'jquery',
		'app/Asset',
		'app/AttributionGenerator',
		'app/Author',
		'app/LicenceStore',
		'app/LICENCES',
		'dojo/i18n!./nls/Questionnaire',
		'templates/registry',
		'app/AjaxError'
	],
	function( $, Asset, AttributionGenerator, Author, LicenceStore, LICENCES, messages, templateRegistry, AjaxError ) {
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
	if( !( $node instanceof $ ) || !( asset instanceof Asset ) ) {
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
		} else if( !this._asset.getLicence().isInGroup( 'cc4' ) && this._asset.getTitle().length === 0 ) {
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
			? pageAnswers[answerId]()
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
				var $content = $( '<div/>' )
					.addClass( 'questionnaire-page page page-' + page )
					.data( 'questionnaire-page', page )
					.html( html );

				$pages = $pages.add( self._applyFunctionality( $content ) );
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
	 * Applies functionality to a page's DOM.
	 *
	 * @param {jQuery} $page
	 * @return {jQuery}
	 */
	_applyFunctionality: function( $page ) {
		$page = this._applyGenerics( $page );
		$page = this._applyValuesToInputElements( $page );
		$page = this._applyLogic( $page );
		return $page;
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
		.prepend(
				$( '<span/>' ).addClass( 'checkbox' ).html( '&nbsp;' )
				.on( 'mouseover', function( event ) {
					self._startCheckboxAnimation( $( event.target ) );
				} )
				.on( 'mouseout', function( event ) {
					self._stopCheckboxAnimation( $( event.target ) );
				} )
		)
		.on( 'mouseover', function( event ) {
			self._startCheckboxAnimation( $( event.target ).find( '.checkbox' ) );
		} )
		.on( 'mouseout', function( event ) {
			self._stopCheckboxAnimation( $( event.target ).find( '.checkbox' ) );
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
					if( self._loggedStrings[page] && self._loggedStrings[page][answerId] ) {
						$input.val( self._loggedStrings[page][answerId] );
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

		/**
		 * @param {Function[]} queue
		 * @param {number} offsetFactor
		 * @return {Function[]}
		 */
		function addAnimationStageToQueue( queue, offsetFactor ) {
			queue.push( function() {
				$checkbox.css( 'backgroundPosition', offsetFactor * 20 + 'px 0' );
			} );
			return queue;
		}

		var queue = [];
		for( var i = -1; i >= -4; i-- ) {
			queue = addAnimationStageToQueue( queue, i );
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
			value,
			p = $page.data( 'questionnaire-page' );

		if( p === '2' ) {
			$page.find( 'span.checkbox' ).parent().on( 'click', function() {
				self._asset._licence = new LicenceStore( LICENCES ).detectLicence( $( this ).data( 'licenceId' ) );
			});

			var goto = '3';
			if( !this._asset.getAuthors() ||
					this._asset.getAuthors().length === 0 ||
					this._asset.getAuthors( { format: 'string' } ) === messages['author-undefined'] ) {
				goto = 'form-author';
			} else if( !this._asset._title ) {
				goto = 'form-title';
			} else if( !this._asset._url ) {
				goto = 'form-url';
			}

			for( var answer = 1; answer <= 8; answer ++ ) {
				$page = this._applyLogAndGoTo( $page, p, answer, goto );
			}
			$page = this._applyLogAndGoTo( $page, p, 9, 'result-note-cc0' );
			$page = this._applyLogAndGoTo( $page, p, 10, '15' );
		} else if( p === 'form-author' ) {
			var goto = '3';
			if ( !this._asset._title || this._asset._title === messages['file-untitled'] ) {
				goto = 'form-title';
			} else if ( !this._asset._url ) {
				goto = 'form-url';
			}

			var submitFormAuthor = function() {
				self._log( 'form-author', 1, function() {
					return self._getLoggedString( 'form-author', '1' );
				} );
				self._goToAndUpdate( goto );
			};

			$page.find( 'input.a1' )
				.on( 'keyup', function() {
					var value = $.trim( $( this ).val() );

					if( value === '' ) {
						self._asset.setAuthors(
							[ new Author( $( messages['author-undefined'] ) ) ]
						);
						delete self._loggedAnswers['form-author'];
						delete self._loggedStrings['form-author'];
					} else {
						self._asset.setAuthors( [ new Author( $( document.createTextNode( value ) ) ) ] );
						self._log( 'form-author', 1, value, false );
					}

					$( self ).trigger( 'update' );
				} )
				.on( 'keypress', function( event ) {
					if( event.keyCode === 13 ) {
						event.preventDefault();
						submitFormAuthor();
					}
				} )
				.val( self._asset.getAuthors( { format: 'string' } ) );

			$page.find( 'a.a1' ).on( 'click', function() {
				submitFormAuthor();
			} );

			$page.find( 'li.a2' ).on( 'click', function() {
				$page.find( 'input.a1' ).val( messages['author-undefined'] );
				self._asset.setAuthors( [ new Author( $( document.createTextNode( messages['author-undefined'] ) ) ) ] );
				self._log( 'form-author', 1, messages['author-undefined'], false );
				submitFormAuthor();
			});

		} else if( p === 'form-title' ) {
			var goto = '3';

			if ( !this._asset._url ) {
				goto = 'form-url';
			}

			var submitFormTitle = function() {
				self._log( 'form-title', 1, function() {
					return self._getLoggedString( 'form-title', '1' );
				} );
				self._goToAndUpdate( goto );
			};

			$page.find( 'input.a1' )
				.on( 'keyup', function() {
					var value = $.trim( $( this ).val() );

					if( value === '' ) {
						self._asset._title = messages['file-untitled'];
						delete self._loggedAnswers['form-title'];
						delete self._loggedStrings['form-title'];
					} else {
						self._asset._title = value;
						self._log( 'form-title', 1, value, false );
					}

					$( self ).trigger( 'update' );
				} )
				.on( 'keypress', function( event ) {
					if( event.keyCode === 13 ) {
						event.preventDefault();
						submitFormTitle();
					}
				} )
				.val( self._asset.getTitle() );

			$page.find( 'a.a1' ).on( 'click', function() {
				submitFormTitle();
			} );

			$page.find( 'li.a2' ).on( 'click', function() {
				$page.find( 'input.a1' ).val( messages['file-untitled'] );
				self._asset._title = messages['file-untitled'];
				self._log( 'form-title', 1, messages['file-untitled'], false );
				submitFormTitle();
			});

		} else if( p === 'form-url' ) {
			$page = this._applyLogAndGoTo( $page, p, 2, '3' );

			var submitFormUrl = function() {
				self._log( 'form-url', 1, function() {
					return self._getLoggedString( 'form-url', '1' );
				} );
				self._goToAndUpdate( '3' );
			};

			$page.find( 'input.a1' )
				.on( 'keyup', function() {
					var value = $.trim( $( this ).val() );

					if( value === '' ) {
						self._asset._url = '';
						delete self._loggedAnswers['form-url'];
						delete self._loggedStrings['form-url'];
					} else {
						self._asset._url = value;
						self._log( 'form-url', 1, value, false );
					}

					$( self ).trigger( 'update' );
				} )
				.on( 'keypress', function( event ) {
					if( event.keyCode === 13 ) {
						event.preventDefault();
						submitFormUrl();
					}
				} )
				.val( self._asset.getUrl() );

			$page.find( 'a.a1' ).on( 'click', function() {
				submitFormUrl();
			} );

			$page.find( 'li.a2').on( 'click', function() {
				$page.find( 'input.a1' ).val();
				self._asset._url = '';
				self._log( 'form-url', 1, '', false );
				submitFormUrl();
			});

		} else if( p === '3' ) {
			$page = this._applyLogAndGoTo( $page, p, 1, '7' );
			$page = this._applyLogAndGoTo( $page, p, 2, '7' );

			$page.find( '.a3' ).on( 'click', function() {
				self._log( p, 3 );
				if( self._asset.getLicence().isInGroup( 'cc2de' ) ) {
					self._goToAndUpdate( '7' );
				} else {
					self._goToAndUpdate( 'result-note-privateUse' );
				}
			} );

			if( this._getResult().attributionAlthoughExceptionalUse ) {
				$page = this._applyDisabled( $page, 4 );
			} else {
				$page = this._applyLogAndGoTo( $page, p, 4, '5' );
			}

			$page = this._applyLogAndGoTo( $page, p, 5, '6' );
		} else if( p === '5') {
			$page = this._applyLogAndGoTo( $page, p, 1, '3' );
			$page = this._applyLogAndGoTo( $page, p, 2, '5a' );
		} else if( p === '7' ) {
			var goTo = this._getResult().useCase === 'print' ? '8' : '12a';
			$page = this._applyLogAndGoTo( $page, p, 1, goTo );
			$page = this._applyLogAndGoTo( $page, p, 2, goTo );
		} else if( p === '8' ) {
			$page = this._applyLogAndGoTo( $page, p, 1, '12a' );
			$page = this._applyLogAndGoTo( $page, p, 2, '12a' );
		} else if( p === '9' ) {

			var submit9a = function() {
				if( !self._getLoggedString( '9', '1' ) ) {
					submit9b();
				} else {
					self._log( '9', 1, function() {
						return self._getLoggedString( '9', '1' );
					} );
					self._goToAndUpdate( '3' );
				}
			};

			var submit9b = function() {
				var value =  messages['unknown'];
				self._asset.setAuthors( [new Author( $( document.createTextNode( value ) ) )] );
				self._log( '9', 2, value );
				self._goToAndUpdate( '3' );
			};

			$page.find( 'input.a1' )
			.on( 'keyup', function() {
				var value = $.trim( $( this ).val() );

				if( value === '' ) {
					self._asset.setAuthors(
						[new Author( $( document.createTextNode( messages['unknown'] ) ) )]
					);
					delete self._loggedAnswers['9'];
					delete self._loggedStrings['9'];
				} else {
					self._asset.setAuthors( [new Author( $( document.createTextNode( value ) ) )] );
					self._log( '9', 1, value, false );
				}

				$( self ).trigger( 'update' );
			} )
			.on( 'keypress', function( event ) {
				if( event.keyCode === 13 ) {
					event.preventDefault();
					submit9a();
				}
			} );

			$page.find( 'a.a1' ).on( 'click', function() {
				submit9a();
			} );

			$page.find( '.a2' ).on( 'click', function() {
				submit9b();
			} );

			// Initially update when moving forward to this page. This ensures displaying "unknown
			// author" when accessing the page the first time.
			if( !this._getLoggedString( '9', 1 ) ) {
				value = messages['unknown'];
				self._asset.setAuthors( [new Author( $( document.createTextNode( value ) ) )] );
				$( this ).trigger( 'update' );
			}

		} else if( p === '12a' ) {
			$page = this._applyLogAndGoTo( $page, p, 1, 'result-success' );
			$page = this._applyLogAndGoTo( $page, p, 2, '12b' );
		} else if( p === '12b' ) {
			$page = this._applyLogAndGoTo( $page, p, 1, '13' );
			$page = this._applyLogAndGoTo( $page, p, 2, '12c' );
		} else if( p === '13' ) {

			var submit13 = function() {
				self._log( '13', 1, function() {
					return self._getLoggedString( '13', '1' );
				} );
				self._goToAndUpdate( 'result-success' );
			};

			$page.find( 'input.a1' )
			.on( 'keyup', function() {
				var value = $( this ).val();

				if( value === '' ) {
					delete self._loggedAnswers['13'];
					delete self._loggedStrings['13'];
				} else {
					self._log( '13', 1, value, false );
				}

				$( self ).trigger( 'update' );
			} )
			.on( 'keypress', function( event ) {
				if( event.keyCode === 13 ) {
					event.preventDefault();
					submit13();
				}
			} );

			$page.find( 'a.a1' ).on( 'click', function() {
				submit13();
			} );

			// Initially update when moving back to this page to reflect previously entered value in
			// preview:
			value = this._getLoggedString( '13', 1 );
			if( value ) {
				this._log( '13', 1, value, false );
				$( this ).trigger( 'update' );
			}
		}

		return $page;
	},

	/**
	 * Returns a logged string.
	 *
	 * @param {string} page
	 * @param {number} answer
	 * @returns {string}
	 */
	_getLoggedString: function( page, answer ) {
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
			self._goToAndUpdate( toPage );
		} );

		return $page;
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
	},

	/**
	 * Disables an answer.
	 *
	 * @param {jQuery} $page
	 * @param {number} answer
	 */
	_applyDisabled: function( $page, answer ) {
		$page.find( '.a' + answer )
		.off( 'mouseover' )
		.addClass( 'disabled' );

		return $page;
	}

} );

return Questionnaire;

} );
