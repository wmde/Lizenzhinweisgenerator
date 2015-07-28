/**
 * @licence GNU GPL v3
 * @author snater.com < wikimedia@snater.com >
 */
define( ['jquery'], function( $ ) {
'use strict';

/**
 * Represents a questionnaire page with all logic handling.
 * The page names/numbers and the corresponding logic are based on the questionnaire "Webtool für
 * Creative Commons-Lizenzen".
 * @constructor
 *
 * @param {string} pageId
 * @param {jQuery} $page
 * @param {Asset} asset
 * @param {QuestionnaireState} questionnaireState
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
var QuestionnairePage = function( pageId, $page, asset, questionnaireState ) {
	if(
		typeof pageId !== 'string'
		|| !( $page instanceof $ )
		|| asset === undefined
		|| questionnaireState === undefined
	) {
		throw new Error( 'No proper parameters specified' );
	}

	this._pageId = pageId;
	this.$page = $page;
	this._asset = asset;
	this._questionnaireState = questionnaireState;

	this._applyFunctionality( this.$page );
};

$.extend( QuestionnairePage.prototype, {

	/**
	 * @type {string}
	 */
	_pageId: null,

	/**
	 * Node the questionnaire page is initialized on.
	 * @type {jQuery}
	 */
	$page: null,

	/**
	 * @type {Asset}
	 */
	_asset: null,

	/**
	 * The questionnaire state as to the current state of the page.
	 * @type {QuestionnaireState}
	 */
	_questionnaireState: null,

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
	 * Applies a QuestionnaireState.
	 *
	 * @param {QuestionnaireState} state
	 */
	applyState: function( state ) {
		this._applyValuesToInputElements( state );
		this._update();
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
	 * @param {QuestionnaireState} state
	 */
	_applyValuesToInputElements: function( state ) {
		var self = this,
			strings = state.getPageStrings( state.getPageId() );

		this.$page.find( 'input' ).each( function() {
			var $input = $( this ),
				classes = $input.attr( 'class' ).split( ' ' );

			for( var i = 0; i < classes.length; i++ ) {
				if( /^a[0-9]{1}$/.test( classes[i] ) ) {
					var answerId = classes[i].split( 'a' )[1];
					if( strings[answerId] ) {
						$input.val( strings[answerId] );
						// Log strings to have them reflected in connected components when updating:
						self._log( state.getPageId(), answerId, strings[answerId] );
					}
				}
			}
		} );
	},

	getNextPageId: function( answerId ) {
		answerId = typeof answerId !== 'undefined' ? answerId : 0;
		switch( this._pageId ) {
			case '2':
				if( !this._asset.getAuthors().length ) {
					return 'form-author';
				} else if( !this._asset.getTitle() ) {
					return 'form-title';
				} else if( !this._asset.getUrl() ) {
					return 'form-url';
				}
				if( answerId === 9 ) {
					return 'result-note-cc0';
				}
				if( answerId === 10 ) {
					return '15';
				}
				return '3';
			case 'form-author':
			case 'form-title':
			case 'form-url':
				if( this._pageId === 'form-author' && !this._asset.getTitle() ) {
					return 'form-title';
				} else if( this._pageId !== 'form-url' && ( !this._asset.getUrl() || this._asset.getUrl() === '' ) ) {
					return 'form-url';
				}
				return '3';
			case '3':
				if( answerId === 1 || answerId === 2 ) {
					return '7';
				}
				if( answerId === 3 ) {
					if( this._questionnaireState.getResult().asset.getLicence().isInGroup( 'cc2de' ) ) {
						return '7';
					}
					return 'result-note-privateUse';
				}
				if( answerId === 4 ) {
					return '5';
				}
				if( answerId === 5 ) {
					return '6';
				}
				break;
			case '5':
				if( answerId === 1 ) {
					return '3';
				}
				if( answerId === 2 ) {
					return '5a';
				}
				break;
			case '7':
				return this._questionnaireState.getResult().useCase === 'print' ? '8' : '12a';
			case '8':
				if( answerId === 1 || answerId === 2 ) {
					return '12a';
				}
				break;
			case '9':
				if( answerId === 1 || answerId === 2 ) {
					return '3';
				}
				break;
			case '12a':
				if( answerId === 1 ) {
					return 'result-success';
				}
				if( answerId === 2 ) {
					return '12b';
				}
				break;
			case '12b':
				if( answerId === 1 ) {
					return '13';
				}
				if( answerId === 2 ) {
					return '12c';
				}
				break;
			case '13':
				if( answerId === 1 ) {
					return 'result-success';
				}
				break;
		}
		return null;
	},

	/**
	 * Applies logic of a specific page to a node.
	 *
	 * @param {jQuery} $page
	 * @return {jQuery}
	 */
	_applyLogic: function( $page ) {
		var self = this,
			p = $page.data( 'questionnaire-page' ),
			goTo,
			$input;

		var evaluateInput = function( $input, p ) {
			var value = $.trim( $input.val() );

			if( value !== '' ) {
				self._log( p, 1, value );
			} else {
				self._removeFromLog( p, 1 );
				self._log( p, 2 );
			}
		};

		if( p === '2' ) {
			goTo = this.getNextPageId();

			$page.find( '.a1' ).on( 'click', function() {
				self._log( p, 1, $( this ).data( 'licenceId' ) );
				self._goTo( goTo );
			} );

			$page = this._applyLogAndGoTo( $page, p, 9, this.getNextPageId( 9 ) );
			$page = this._applyLogAndGoTo( $page, p, 10, this.getNextPageId( 10 ) );

		} else if( p === 'form-author' || p === 'form-title' || p === 'form-url' ) {
			goTo = this.getNextPageId();

			$input = $page.find( 'input.a1' );

			$input
			.on( 'keyup', function() {
				evaluateInput( $input, p );
			} )
			.on( 'keypress', function( event ) {
				if( event.keyCode === 13 ) {
					event.preventDefault();
					evaluateInput( $input, p );
					self._goTo( goTo );
				}
			} );

			$page.find( 'a.a1' ).on( 'click', function() {
				evaluateInput( $input, p );
				self._goTo( goTo );
			} );

			$page.find( 'li.a2' ).on( 'click', function() {
				$input.val( '' );
				evaluateInput( $input, p );
				self._goTo( goTo );
			} );

		} else if( p === '3' ) {
			$page = this._applyLogAndGoTo( $page, p, 1, this.getNextPageId( 1 ) );
			$page = this._applyLogAndGoTo( $page, p, 2, this.getNextPageId( 2 ) );

			$page.find( '.a3' ).on( 'click', function() {
				self._log( p, 3 );
				self._goTo( self.getNextPageId( 3 ) );
			} );

			if( this._questionnaireState.getResult().attributionAlthoughExceptionalUse ) {
				$page = this._applyDisabled( $page, 4 );
			} else {
				$page = this._applyLogAndGoTo( $page, p, 4, this.getNextPageId( 4 ) );
			}

			$page = this._applyLogAndGoTo( $page, p, 5, this.getNextPageId( 5 ) );
		} else if( p === '5' ) {
			$page = this._applyLogAndGoTo( $page, p, 1, this.getNextPageId( 1 ) );
			$page = this._applyLogAndGoTo( $page, p, 2, this.getNextPageId( 2 ) );
		} else if( p === '7' ) {
			goTo = this.getNextPageId();
			$page = this._applyLogAndGoTo( $page, p, 1, goTo );
			$page = this._applyLogAndGoTo( $page, p, 2, goTo );
		} else if( p === '8' ) {
			$page = this._applyLogAndGoTo( $page, p, 1, this.getNextPageId( 1 ) );
			$page = this._applyLogAndGoTo( $page, p, 2, this.getNextPageId( 2 ) );
		} else if( p === '9' ) {

			$input = $page.find( 'input.a1' );

			$input
			.on( 'keyup', function() {
				evaluateInput( $input, p );
			} )
			.on( 'keypress', function( event ) {
				if( event.keyCode === 13 ) {
					event.preventDefault();
					evaluateInput( $input, p );
					self._goTo( self.getNextPageId( 1 ) );
				}
			} );

			$page.find( 'a.a1' ).on( 'click', function() {
				evaluateInput( $input, p );
				self._goTo( self.getNextPageId( 1 ) );
			} );

			$page.find( '.a2' ).on( 'click', function() {
				$input.val( '' );
				evaluateInput( $input, p );
				self._goTo( self.getNextPageId( 2 ) );
			} );

		} else if( p === '12a' ) {
			$page = this._applyLogAndGoTo( $page, p, 1, this.getNextPageId( 1 ) );
			$page = this._applyLogAndGoTo( $page, p, 2, this.getNextPageId( 2 ) );
		} else if( p === '12b' ) {
			$page = this._applyLogAndGoTo( $page, p, 1, this.getNextPageId( 1 ) );
			$page = this._applyLogAndGoTo( $page, p, 2, this.getNextPageId( 2 ) );
		} else if( p === '13' ) {

			$input = $page.find( 'input.a1' );

			$input
			.on( 'keyup', function() {
				evaluateInput( $input, p );
			} )
			.on( 'keypress', function( event ) {
				if( event.keyCode === 13 ) {
					event.preventDefault();
					evaluateInput( $input, p );
					self._goTo( self.getNextPageId( 1 ) );
				}
			} );

			$page.find( 'a.a1' ).on( 'click', function() {
				evaluateInput( $input, p );
				self._goTo( self.getNextPageId( 1 ) );
			} );
		}

		return $page;
	},

	/**
	 * Logs an answer.
	 *
	 * @param {string} page
	 * @param {number|string} answer
	 * @param {string|boolean} [value] If omitted, boolean "true" is logged for the answer. If of
	 *        type "boolean", the value is assumed to be the value for the "cacheNavigation"
	 *        parameter.
	 */
	_log: function( page, answer, value ) {
		this._questionnaireState.setValue( page, answer, value );
		this._update();
	},

	/**
	 * Removes a specific answer from the log.
	 *
	 * @param {string} page
	 * @param {number} answer
	 */
	_removeFromLog: function( page, answer ) {
		this._questionnaireState.deleteValue( page, answer );
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
	 * @param {string} toPage
	 *
	 * @triggers goto
	 */
	_goTo: function( toPage ) {
		$( this ).trigger( 'goto', [toPage] );
	},

	/**
	 * Notifies update the page having updated.
	 *
	 * @triggers {update}
	 */
	_update: function() {
		$( this ).trigger( 'update', [this._questionnaireState] );
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
