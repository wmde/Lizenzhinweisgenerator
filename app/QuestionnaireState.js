/**
 * @licence GNU GPL v3
 * @author snater.com < wikimedia@snater.com >
 */
define( [
	'jquery',
	'app/Asset',
	'app/AttributionGenerator',
	'app/Author',
	'app/LicenceStore',
	'app/LICENCES',
	'dojo/i18n!./nls/QuestionnaireState'
], function( $, Asset, AttributionGenerator, Author, LicenceStore, LICENCES, messages ) {
'use strict';

/**
 * Represents a questionnaire's logic.
 * The page names/numbers and the corresponding logic are based on the questionnaire "Webtool für
 * Creative Commons-Lizenzen".
 * @constructor
 *
 * @param {string} pageId
 * @param {Asset} asset
 * @param {QuestionnaireState} [previousState]
 *
 * @throws {Error} on incorrect parameters.
 */
var QuestionnaireState = function( pageId, asset, previousState ) {
	if( typeof pageId !== 'string' || !( asset instanceof Asset ) ) {
		throw new Error( 'Improperly specified parameters' );
	}

	this._pageId = pageId;
	this._asset = asset;

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
		var clone = new QuestionnaireState( this._pageId, this._asset );
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
	 * @return {Asset}
	 */
	getAsset: function() {
		return this.getResult().asset;
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
		var asset = new Asset(
			this._asset._prefixedFilename,
			this._asset.getTitle(),
			this._asset.getMediaType(),
			this._asset.getLicence(),
			this._asset._api,
			{
				authors: this._asset.getAuthors(),
				attribution: this._asset.getAttribution()
			},
			this._asset.getWikiUrl(),
			this._asset.getUrl()
		);

		var licenceId = this._getAnswer( '2', 1 );

		if( licenceId ) {
			asset._licence = new LicenceStore( LICENCES ).detectLicence( licenceId );
		}

		var customAuthor = this._getAnswer( 'form-author', 1 ),
			customTitle = this._getAnswer( 'form-title', 1 ),
			customUrl = this._getAnswer( 'form-url', 1 );

		// TODO: Remove messages from Questionnaire state:
		if( ( !asset.getAuthors().length || asset.getAuthors()[0].getText() === messages['author-undefined'] ) && customAuthor ) {
			asset.setAuthors( [new Author( $( document.createTextNode( customAuthor ) ) )] );
		}

		if( ( !asset.getTitle() || asset.getTitle() === messages['file-untitled'] ) && customTitle ) {
			asset.setTitle( customTitle );
		}

		if( ( !asset.getUrl() || asset.getUrl() === '' ) && customUrl ) {
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
	 * Instantiates an AttributionGenerator object.
	 *
	 * @param {Object} [options]
	 * @return {AttributionGenerator}
	 */
	getAttributionGenerator: function( options ) {
		var result = this.getResult(),
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

		var attributionGenerator = new AttributionGenerator( result.asset, options );

		// Return cached attribution generator for allowing external objects to check whether a
		// change actually has occurred.
		if( !attributionGenerator.equals( this._attributionGenerator ) ) {
			this._attributionGenerator = attributionGenerator;
		}

		return this._attributionGenerator;
	}

} );

return QuestionnaireState;

} );
