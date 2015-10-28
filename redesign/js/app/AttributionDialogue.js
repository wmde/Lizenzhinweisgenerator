'use strict';

var $ = require( 'jquery' ),
	Dialogue = require( './Dialogue' ),
	DialogueStep = require( './DialogueStep' );

/**
 * @param {string|null} author
 * @constructor
 */
var AttributionDialogue = function( author ) {
	Dialogue.call( this );
	this._author = author;
};

$.extend( AttributionDialogue.prototype, Dialogue.prototype, {
	/**
	 * @type {string}
	 */
	_author: null,

	init: function() {
		this.addStep( new DialogueStep( 'typeOfUse' ) );
		if( !this._author ) {
			this.addStep( new DialogueStep( 'author' ) );
		}
		this.addStep( new DialogueStep( 'compilation' ) );
		this.addStep( new DialogueStep( 'editing' ) );
	}
} );

module.exports = AttributionDialogue;
