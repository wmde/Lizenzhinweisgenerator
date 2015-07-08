/**
 * @licence GNU GPL v3
 * @author snater.com < wikimedia@snater.com >
 */
define(
	['jquery', 'app/Author', 'dojo/_base/config'],
	function( $, Author, config ) {
'use strict';

/**
 * Represents a questionnaire's logic.
 * The page names/numbers and the corresponding logic are based on the questionnaire "Webtool für
 * Creative Commons-Lizenzen".
 * @constructor
 *
 * @param {string} pageId
 * @param {Asset} asset
 * @param {Questionnaire} questionnaire
 * @param {QuestionnaireState} [previousState]
 *
 * @throws {Error} on incorrect parameters.
 */
var QuestionnaireState = function( pageId, asset, questionnaire, previousState ) {
	if( typeof pageId !== 'string' || asset === undefined ) {
		throw new Error( 'Improperly specified parameters' );
	}

	this._pageId = pageId;
	this._asset = asset;
	this._questionnaire = questionnaire;

	// Copy all previous state info to be able to consider all answers when generating a result:
	this._answers = previousState ? $.extend( {}, previousState._answers ) : {};
};

$.extend( QuestionnaireState.prototype, {
	/**
	 * ID of the page the state refers to.
	 * @type {string}
	 */
	_pageId: null,

	/**
	 * The original asset, initially passed to the QuestionnaireState object.
	 * @type {Asset}
	 */
	_asset: null,

	/**
	 * Related Questionnaire object
	 * @type {Questionnaire}
	 */
	_questionnaire: null,

	/**
	 * Selected/specified answers indexed by page numbers.
	 * @type {Object}
	 */
	_answers: null,

	/**
	 * Clones the state.
	 *
	 * @return {QuestionnaireState}
	 */
	clone: function() {
		var clone = new QuestionnaireState( this._pageId, this._asset, this._questionnaire );
		clone._answers = $.extend( {}, this._answers );
		return clone;
	},

	/**
	 * Returns all strings that have been logged on a specific page.
	 *
	 * @return {Object}
	 */
	getPageStrings: function( pageId ) {
		var strings = {};

		if( !this._answers[pageId] ) {
			return strings;
		}

		$.each( this._answers[pageId], function( answerId, value ) {
			if( typeof value === 'string' ) {
				strings[answerId] = value;
			}
		} );

		return strings;
	},

	/**
	 * @param {string} pageId
	 */
	setPageId: function( pageId ) {
		this._pageId = pageId;
	},

	/**
	 * @return {string}
	 */
	getPageId: function() {
		return this._pageId;
	},

	/**
	 * Sets a specific value for an answer.
	 *
	 * @param {string} page
	 * @param {number} answer
	 * @param {boolean|string} value
	 */
	setValue: function( page, answer, value ) {
		if( value === undefined ) {
			value = true;
		}

		if( !this._answers[page] ) {
			this._answers[page] = {};
		}

		this._answers[page][answer] = value;
	},

	/**
	 * Deletes a specific value.
	 *
	 * @param {string} page
	 * @param {number} answer
	 */
	deleteValue: function( page, answer ) {
		if( this._answers[page] && this._answers[page][answer] ) {
			delete this._answers[page][answer];
		}
	},

	/**
	 * Deletes all boolean (page progressive) answers of a particular page.
	 *
	 * @param {string} page
	 */
	deleteBooleanAnswers: function( page ) {
		var self = this;

		if( !this._answers[page] ) {
			return;
		}

		$.each( this._answers[page], function( answerId, value ) {
			if( typeof value === 'boolean' ) {
				delete self._answers[page][answerId];
			}
		} );
	},

	/**
	 * Returns a result object containing processable attributes of the evaluated current answer
	 * set.
	 *
	 * @return {Object}
	 */
	getResult: function() {
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

		// Generate new asset that will consider all answers:
		var asset = this._asset.clone();

		var licenceId = this._getAnswer( '2', 1 );

		if( licenceId ) {
			asset.setLicence( config.custom.licenceStore.detectLicence( licenceId ) );
		}

		if( !asset.getLicence() ) {
			asset.setLicence( config.custom.licenceStore.getLicence( 'unknown' ) );
		}

		var customAuthor = this._getAnswer( 'form-author', 1 ),
			customTitle = this._getAnswer( 'form-title', 1 ),
			customUrl = this._getAnswer( 'form-url', 1 );

		if( customAuthor ) {
			asset.setAuthors( [new Author( $( document.createTextNode( customAuthor ) ) )] );
		}

		if( customTitle ) {
			asset.setTitle( customTitle );
		}

		if( customUrl ) {
			asset.setUrl( customUrl );
		}

		return {
			asset: asset,
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
		var pageAnswers = this._answers[page];
		return pageAnswers && pageAnswers[answerId] ? pageAnswers[answerId] : false;
	},

	/**
	 * Returns an identifier of the selected answer on the given page, or null if no answer has been selected.
	 *
	 * @param page
	 * @return {string|null}
	 */
	getSelectedAnswer: function( page ) {
		if( !this._answers[ page ] ) {
			return null;
		}

		var selectedAnswer = null;
		$.each( this._answers[ page ], function( answerId, value ) {
			if( typeof value === 'boolean' && value === true ) {
				selectedAnswer = parseInt( answerId );
				return false;
			}
		} );

		return selectedAnswer;
	},

	/**
	 * Handles clicking browser's back button
	 */
	back: function() {
		this._questionnaire.goBackAction();
	},

	/**
	 * Handles clicking browser's forward button
	 */
	forward: function() {
		this._questionnaire.goForwardAction();
	}
} );

return QuestionnaireState;

} );
