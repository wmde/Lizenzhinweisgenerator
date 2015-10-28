'use strict';

var Dialogue = require( './Dialogue' ),
	DialogueStep = require( './DialogueStep' );

/**
 * @param {string|null} author
 * @constructor
 */
var AttributionDialogue = function( author ) {
	var dialogue = new Dialogue();
	dialogue.addStep( new DialogueStep( 'typeOfUse' ) );
	if( !author ) {
		dialogue.addStep( new DialogueStep( 'author' ) );
	}
	dialogue.addStep( new DialogueStep( 'compilation' ) );
	dialogue.addStep( new DialogueStep( 'editing' ) );

	this._dialogue = dialogue;
};

module.exports = AttributionDialogue;
