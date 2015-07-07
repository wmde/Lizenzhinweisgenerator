/**
 * @licence GNU GPL v3
 * @author snater.com < wikimedia@snater.com >
 */
/* global alert */
define( [
	'jquery',
	'app/AttributionGenerator',
	'app/Author',
	'app/QuestionnairePage',
	'app/QuestionnaireState',
	'dojo/Deferred',
	'dojo/i18n!./nls/Questionnaire',
	'dojo/promise/all',
	'templates/registry',
	'app/AjaxError'
], function(
	$,
	AttributionGenerator,
	Author,
	QuestionnairePage,
	QuestionnaireState,
	Deferred,
	messages,
	all,
	templateRegistry,
	AjaxError
) {
'use strict';

/**
 * Represents a questionnaire's logic.
 * The page names/numbers and the corresponding logic are based on the questionnaire "Webtool für
 * Creative Commons-Lizenzen".
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
 */
var Questionnaire = function( $node, asset ) {
	if( !( $node instanceof $ ) || asset === undefined ) {
		throw new Error( 'No proper parameters specified' );
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
	 * Caches the navigation path and a copy of the loggedAnswers object for resetting when
	 * navigating backwards.
	 * @type {QuestionnaireState[]|null}
	 */
	_navigationCache: null,

	/**
	 * The most current questionnaire state.
	 * @type {QuestionnaireState|null}
	 */
	_questionnaireState: null,

	/**
	 * Cached attribution generator that prevents broadcasting a new object to other components
	 * although no attributes have changed.
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
		this._navigationCache = [];

		var self = this,
			deferred = $.Deferred(),
			licenceId = this._asset.getLicence() ? this._asset.getLicence().getId() : null,
			page = '3';

		if( licenceId === 'PD' || licenceId === 'cc-zero' ) {
			this._questionnaireState = new QuestionnaireState( 'init', this._asset, this );
			this._exit();
			return deferred.resolve().promise();
		} else if( licenceId === 'CC' || !licenceId ) {
			page = '2';
		} else if( !this._asset.getAuthors().length ) {
			page = '9';
		} else if(
			!this._asset.getLicence().isInGroup( 'cc4' ) && !this._asset.getTitle().length ) {
			page = '10';
		} else if( !this._asset.getUrl().length ) {
			page = '11';
		}

		this._goTo( page )
		.done( function() {
			deferred.resolve();
			$( self ).trigger( 'update' );
		} )
		.fail( function( error ) {
			deferred.reject( error );
		} );

		return deferred.promise();
	},

	/**
	 * Default page movement.
	 *
	 * @param {string} toPage
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {QuestionnairePage}
	 *         Rejected parameters:
	 *         - {AjaxError}
	 */
	_goTo: function( toPage ) {
		var self = this;

		if( this._questionnaireState ) {
			this._navigationCache.push( this._questionnaireState.clone() );
		} else {
			this._questionnaireState = new QuestionnaireState( 'init', this._asset, this );
			this._navigationCache.push( this._questionnaireState.clone() );
		}

		return this._animateToPage( toPage )
		.then( function( questionnairePage ) {

			self._questionnaireState.setPageId( toPage );
			questionnairePage.applyState( self._questionnaireState );
		} );
	},

	/**
	 * Triggers going back in questionnaire.
	 *
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {QuestionnairePage}
	 *         Rejected parameters:
	 *         - {AjaxError}
	 */
	_goBack: function() {
		var self = this,
			previousState = this._navigationCache.pop();

		return this._animateToPage( previousState.getPageId(), true )
		.done( function( questionnairePage ) {
			self._questionnaireState = previousState.clone();
			questionnairePage.applyState( previousState );
			self._questionnaireState.setPageId( previousState.getPageId() );
			// Delete boolean (page progressive) answers to have (re)set text input reflected in
			// attribution:
			self._questionnaireState.deleteBooleanAnswers( previousState.getPageId() );
			$( self ).trigger( 'update' );
		} );
	},

	/**
	 * Animates page transition.
	 *
	 * @param {string} pageId
	 * @param {boolean} back
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {QuestionnairePage}
	 *         Rejected parameters:
	 *         - {AjaxError}
	 */
	_animateToPage: function( pageId, back ) {
		var self = this,
			deferred = $.Deferred(),
			$container = this._$node.find( '.questionnaire-contentcontainer' );

		if( !$container.length ) {
			// The first page being rendered, no need to animate.
			return this._render( pageId );
		}

		var initialLeftMargin = $container.css( 'marginLeft' ),
			newLeftMargin = back ? $( document ).width() : -1 * $container.width();

		// Fixate width to prevent wrapping:
		$container.width( $container.width() );

		$container.find( '.questionnaire-icon-minimize' ).hide();

		$container.stop().animate( {
			marginLeft: newLeftMargin + 'px'
		}, 'fast' ).promise().done( function() {
			self._render( pageId )
			.done( function( questionnairePage ) {
				$container = self._$node.find( '.questionnaire-contentcontainer' );
				$container.width( $container.width() );

				var startLeftMargin = back ? -1 * $container.width() : $( document ).width();

				$container.css( 'marginLeft', startLeftMargin + 'px' );

				$container.stop().animate( {
					marginLeft: initialLeftMargin
				}, 'fast' ).promise().done( function() {
					$container.css( 'width', 'auto' );
					deferred.resolve( questionnairePage );
				} );
			} )
			.fail( function( error ) {
				deferred.reject( error );
			} );
		} );

		return deferred.promise();
	},

	/**
	 * Renders a page.
	 *
	 * @param {string} page
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {QuestionnairePage}
	 *         Rejected parameters:
	 *         - {AjaxError}
	 */
	_render: function( page ) {
		var self = this,
			deferred = $.Deferred();

		this._$node.empty();

		this._fetchPage( page )
		.done( function( $html ) {
			var questionnairePage = self._createQuestionnairePage( page, $html );

			self._$node.append(
				$( '<div/>' ).addClass( 'questionnaire-contentcontainer' )
				.append( self._generateMinimizeButton() )
				.append( self._generateBackButton() )
				.append(
					$( '<div/>' )
					.addClass( 'questionnaire-pagecontainer' )
					.append( questionnairePage.$page )
				)
			);

			self._toggleMinimized( 'maximize' );

			deferred.resolve( questionnairePage );
		} )
		.fail( function( error ) {
			self._render( 'error' )
			.done( function( questionnairePage ) {
				questionnairePage.$page.find( '.questionnaire-error' )
					.addClass( 'error' )
					.text( error.getMessage() );
			} )
			.fail( function( error ) {
				alert( error.getMessage() );
			} );

			deferred.reject( error );
		} );

		return deferred.promise();
	},

	/**
	 * Initializes a QuestionnairePage object.
	 *
	 * @param {string} page
	 * @param {jQuery} $html
	 * @return {QuestionnairePage}
	 */
	_createQuestionnairePage: function( page, $html ) {
		var self = this;

		var questionnairePage = new QuestionnairePage(
			page,
			$html,
			self._asset,
			self._questionnaireState
		);

		$( questionnairePage )
		.on( 'goto', function( event, toPage ) {
			self._goTo( toPage );
		} )
		.on( 'update', function( event, state ) {
			self._questionnaireState = state;
			$( self ).trigger( 'update' );
		} );

		return questionnairePage;
	},

	/**
	 * Fetches a specific page by id.
	 *
	 * @param {string} page
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {jQuery}
	 *         Rejected parameters:
	 *         - {AjaxError}
	 */
	_fetchPage: function( page ) {
		var deferred = $.Deferred();

		var ajaxOptions = {
			url: templateRegistry.getDir( 'questionnaire' ) + page + '.html',
			dataType: 'html'
		};

		$.ajax( ajaxOptions )
		.done( function( html ) {
			var $html = $( '<div/>' )
				.addClass( 'questionnaire-page page page-' + page )
				.data( 'questionnaire-page', page )
				.html( html );

			deferred.resolve( $html );
		} )
		.fail( function() {
			deferred.reject( new AjaxError( 'questionnaire-page-missing', ajaxOptions ) );
		} );

		return deferred.promise();
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
	 * Returns the, as to the questionnaire, currently appropriate AttributionGenerator object.
	 *
	 * @return {AttributionGenerator}
	 */
	getAttributionGenerator: function( options ) {
		var result = this._questionnaireState.getResult(),
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
			licenceLink: !result.fullLicence && result.asset.getLicence().getId() !== 'unknown',
			format: result.format
		}, options );

		var asset = result.asset;

		if( !asset.getAuthors().length ) {
			asset.setAuthors(
				[new Author( $( document.createTextNode( messages['author-undefined'] ) ) )]
			);
		}

		if( asset.getTitle() === '' ) {
			asset.setTitle( messages['file-untitled'] );
		}

		var attributionGenerator = new AttributionGenerator( asset, options );

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
			if( self._navigationCache.length === 1 ) {
				$( self ).trigger( 'back', [self._asset] );
			} else {
				self._goBack()
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
	 * Fetches the DOM structures of one ore more template pages by id(s).
	 *
	 * @param {string[]} pages
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {jQuery} jQuery wrapped DOM nodes of the requested pages.
	 *         Rejected parameters:
	 *         - {AjaxError}
	 */
	_fetchPages: function( pages ) {
		var deferred = new Deferred(),
			promises = [],
			$pages = $();

		for( var i = 0; i < pages.length; i++ ) {
			promises.push( this._fetchPage( pages[i] ) );
		}

		all( promises ).then( function( $htmlSnippets ) {
			for( var i = 0; i < $htmlSnippets.length; i++ ) {
				$pages = $pages.add( $htmlSnippets[i] );
			}

			$pages.find( 'div.expandable-trigger').on( 'click', function() {
				$( '.expandable' ).slideUp();
				$( this ).next().slideDown();
			} );

			deferred.resolve( $pages );
		} );

		return deferred;
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
			result = this._questionnaireState.getResult(),
			licence = result.asset.getLicence(),
			pages = [];

		if( result.useCase === 'other' ) {
			deferred.resolve( $() );
			return deferred.promise();
		}

		var $supplement = $( '<h2/>' ).text( messages['notes and advice'] );

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
		.then( function( $nodes ) {
			if( result.collectionUse ) {
				$nodes.filter( '.page-result-note-collection' ).append(
					self.getAttributionGenerator( { licenceOnly: true } ).generate()
				);
			}

			if( result.fullLicence ) {
				result.asset.getLicence().getLegalCode()
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
		}, function( error ) {
			deferred.reject( error );
		} );

		return deferred.promise();
	}

} );

return Questionnaire;

} );
