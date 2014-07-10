/**
 * @licence GNU GPL v3
 * @author snater.com < wikimedia@snater.com >
 */
define( [
	'jquery',
	'app/Author',
	'app/LicenceStore',
	'app/LICENCES',
	'dojo/i18n!./nls/QuestionnairePage'
], function( $, Author, LicenceStore, LICENCES, messages ) {
'use strict';

/**
 * Represents a questionnaire page with all logic handling.
 * The page names/numbers and the corresponding logic are based on the questionnaire "Webtool für
 * Creative Commons-Lizenzen v1".
 * @constructor
 *
 * @param {string} pageId
 * @param {string} html
 * @param {Asset} asset
 * @param {Object} result
 *
 * @event log Triggered whenever logging should occur.
 *        (1) {jQuery.Event}
 *        (2) {Object} Logging information
 *
 * @event goto Triggered when another page should be displayed.
 *       (1) {jQuery.Event}
 *       (2) {string} Page identifier
 *
 * @event update Triggered when the page updates.
 *        (1) {jQuery.Event}
 *        (2) {Asset} Most current asset
 *
 * @throws {Error} on incorrect parameters.
 */
var QuestionnairePage = function( pageId, html, asset, result ) {
	if(
		typeof pageId !== 'string'
		|| typeof html !== 'string'
		|| asset === undefined
		|| result === undefined
	) {
		throw new Error( 'No proper parameters specified' );
	}

	this._pageId = pageId;
	this._html = html;
	this._asset = asset;
	this._result = result;

	this.$page = $( '<div/>' )
		.addClass( 'questionnaire-page page page-' + pageId )
		.data( 'questionnaire-page', pageId )
		.html( html );

	this._applyFunctionality( this.$page );
};

$.extend( QuestionnairePage.prototype, {

	/**
	 * @type {string}
	 */
	_pageId: null,

	/**
	 * Unparsed HTML.
	 * @type {string}
	 */
	_html: null,

	/**
	 * @type {Asset}
	 */
	_asset: null,

	/**
	 * The most current result.
	 * @type {Object}
	 */
	_result: null,

	/**
	 * Node the questionnaire page is initialized on.
	 * @type {jQuery}
	 */
	$page: null,

	/**
	 * Applies functionality to a page's DOM.
	 *
	 * @param {jQuery} $page
	 * @return {jQuery}
	 */
	_applyFunctionality: function( $page ) {
		$page = this._applyGenerics( $page );
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

		$page.find( 'div.expandable-trigger').on( 'click', function() {
			$( '.expandable' ).slideUp();
			$( this ).next().slideDown();
		} );

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
	 * @param {Object} [loggedStrings]
	 */
	applyValuesToInputElements: function( loggedStrings ) {
		this.$page.find( 'input' ).each( function() {
			var $input = $( this ),
				classes = $input.attr( 'class' ).split( ' ' );

			for( var i = 0; i < classes.length; i++ ) {
				if( /^a[0-9]{1}$/.test( classes[i] ) ) {
					var answerId = classes[i].split( 'a' )[1];
					if( loggedStrings && loggedStrings[answerId] ) {
						$input.val( loggedStrings[answerId] );
					}
				}
			}

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
			p = $page.data( 'questionnaire-page' ),
			goTo;

		if( p === '2' ) {
			$page.find( 'span.checkbox' ).parent().on( 'click', function() {
				// FIXME Do not set private variable, LicenceStore instance should be a
				// configuration matter.
				self._asset._licence = new LicenceStore( LICENCES ).detectLicence(
					$( this ).data( 'licenceId' )
				);
				self._update();
			} );

			goTo = '3';
			if(
				!this._asset.getAuthors()
				|| this._asset.getAuthors().length === 0
				|| this._asset.getAuthors( { format: 'string' } ) === messages['author-undefined']
			) {
				goTo = 'form-author';
			} else if( !this._asset.getTitle() ) {
				goTo = 'form-title';
			} else if( !this._asset.getUrl() ) {
				goTo = 'form-url';
			}

			for( var answer = 1; answer <= 8; answer++ ) {
				$page = this._applyLogAndGoTo( $page, p, answer, goTo );
			}
			$page = this._applyLogAndGoTo( $page, p, 9, 'result-note-cc0' );
			$page = this._applyLogAndGoTo( $page, p, 10, '15' );

		} else if( p === 'form-author' || p === 'form-title' || p === 'form-url' ) {
			goTo = '3';

			var title = this._asset.getTitle();

			if( p === 'form-author' && ( !title || title === messages['file-untitled'] ) ) {
				goTo = 'form-title';
			} else if( p !== 'form-url' && !this._asset.getUrl() ) {
				goTo = 'form-url';
			}

			var submitForm = function() {
				self._log( p, 1, function( questionnaire ) {
					return questionnaire.getLoggedString( p, 1 );
				} );
				self._update();
				self._goTo( goTo );
			};

			var $input = $page.find( 'input.a1' );

			if( p === 'form-author' ) {
				$input.val( self._asset.getAuthors( { format: 'string' } ) );
			} else if( p === 'form-title' ) {
				$input.val( self._asset.getTitle() );
			} else if( p === 'form-url' ) {
				$input.val( self._asset.getUrl() );
			}

			$input
			.on( 'keyup', function() {
				var value = $.trim( $( this ).val() );

				if( value === '' ) {
					if( p === 'form-author' ) {
						self._asset.setAuthors( [new Author( $( messages['author-undefined'] ) )] );
					} else if( p === 'form-title' ) {
						self._asset.setTitle( messages['file-untitled'] );
					} else if( p === 'form-url' ) {
						self._asset.setUrl( null );
					}

					self._log( p );
				} else {
					if( p === 'form-author' ) {
						self._asset.setAuthors( [
							new Author( $( document.createTextNode( value ) ) )
						] );
					} else if( p === 'form-title' ) {
						self._asset.setTitle( value );
					} else if( p === 'form-url' ) {
						self._asset.setUrl( value );
					}
					self._log( p, 1, value, false );
				}

				self._update();
			} )
			.on( 'keypress', function( event ) {
				if( event.keyCode === 13 ) {
					event.preventDefault();
					submitForm();
				}
			} );

			$page.find( 'a.a1' ).on( 'click', function() {
				submitForm();
			} );

			$page.find( 'li.a2' ).on( 'click', function() {
				var value;

				if( p === 'form-author' ) {
					value = messages['author-undefined'];
					self._asset.setAuthors( [
						new Author( $( document.createTextNode( value ) ) )
					] );
				} else if( p === 'form-title' ) {
					value = messages['file-untitled'];
					self._asset.setTitle( value );
				} else if( p === 'form-url' ) {
					value = '';
					self._asset.setUrl( null );
				}

				self._log( p, 1, value );

				$input.val( value );
				submitForm();
			} );

		} else if( p === '3' ) {
			$page = this._applyLogAndGoTo( $page, p, 1, '7' );
			$page = this._applyLogAndGoTo( $page, p, 2, '7' );

			$page.find( '.a3' ).on( 'click', function() {
				self._log( p, 3 );
				if( self._asset.getLicence().isInGroup( 'cc2de' ) ) {
					self._goTo( '7' );
				} else {
					self._goTo( 'result-note-privateUse' );
				}
			} );

			if( this._result.attributionAlthoughExceptionalUse ) {
				$page = this._applyDisabled( $page, 4 );
			} else {
				$page = this._applyLogAndGoTo( $page, p, 4, '5' );
			}

			$page = this._applyLogAndGoTo( $page, p, 5, '6' );
		} else if( p === '5') {
			$page = this._applyLogAndGoTo( $page, p, 1, '3' );
			$page = this._applyLogAndGoTo( $page, p, 2, '5a' );
		} else if( p === '7' ) {
			goTo = this._result.useCase === 'print' ? '8' : '12a';
			$page = this._applyLogAndGoTo( $page, p, 1, goTo );
			$page = this._applyLogAndGoTo( $page, p, 2, goTo );
		} else if( p === '8' ) {
			$page = this._applyLogAndGoTo( $page, p, 1, '12a' );
			$page = this._applyLogAndGoTo( $page, p, 2, '12a' );
		} else if( p === '9' ) {

			var submit9a = function() {
				if( self._asset.getAuthors().length === 0 ) {
					submit9b();
				} else {
					self._log( '9', 1, function( questionnaire ) {
						return questionnaire.getLoggedString( '9', 1 );
					} );
					self._goTo( '3' );
				}
			};

			var submit9b = function() {
				var value =  messages['unknown'];
				self._asset.setAuthors( [new Author( $( document.createTextNode( value ) ) )] );
				self._log( '9', 2, value );
				self._goTo( '3' );
			};

			$page.find( 'input.a1' )
			.on( 'keyup', function() {
				var value = $.trim( $( this ).val() );

				if( value === '' ) {
					self._asset.setAuthors(
						[new Author( $( document.createTextNode( messages['unknown'] ) ) )]
					);
					self._log( p );
				} else {
					self._asset.setAuthors( [new Author( $( document.createTextNode( value ) ) )] );
					self._log( '9', 1, value, false );
				}

				self._update();
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
			if( this._asset.getAuthors().length === 0 ) {
				value = messages['unknown'];
				self._asset.setAuthors( [new Author( $( document.createTextNode( value ) ) )] );
				this._update();
			}

		} else if( p === '12a' ) {
			$page = this._applyLogAndGoTo( $page, p, 1, 'result-success' );
			$page = this._applyLogAndGoTo( $page, p, 2, '12b' );
		} else if( p === '12b' ) {
			$page = this._applyLogAndGoTo( $page, p, 1, '13' );
			$page = this._applyLogAndGoTo( $page, p, 2, '12c' );
		} else if( p === '13' ) {

			var submit13 = function() {
				self._log( '13', 1, function( questionnaire ) {
					return questionnaire.getLoggedString( '13', '1' );
				} );
				self._goTo( 'result-success' );
			};

			$page.find( 'input.a1' )
			.on( 'keyup', function() {
				var value = $( this ).val();

				if( value === '' ) {
					self._log( p );
				} else {
					self._log( '13', 1, value, false );
				}

				self._update();
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
			if( this._result['editor'] ) {
				this._log( '13', 1, this._result['editor'], false );
				this._update();
			}
		}

		return $page;
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
		var logObject = {
			page: page
		};

		if( answer ) {
			logObject.answer = answer;
		}

		if( value ) {
			logObject.value = value;
		}

		logObject.cacheNavigation = cacheNavigation === undefined ? true: cacheNavigation;

		$( this ).trigger( 'log', logObject );
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
			$( self ).trigger( 'log', {
				page: currentPage,
				answer: answer
			} );

			self._goTo( toPage );
		} );

		return $page;
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
	},

	/**
	 * Triggers going to a page and issues an "update" event after rendering the page.
	 *
	 * @param {string|Function} toPage
	 *
	 * @triggers update
	 */
	_goTo: function( toPage ) {
		$( this ).trigger( 'goto', [toPage] );
	},

	/**
	 * Notifies update the page having updated.
	 */
	_update: function() {
		$( this ).trigger( 'update', [this._asset] );
	},

	/**
	 * Sets/updates the current result.
	 *
	 * @param {Object} result
	 */
	setResult: function( result ) {
		this._result = result;
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
	}

} );

return QuestionnairePage;

} );
