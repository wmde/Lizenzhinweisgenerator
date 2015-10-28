'use strict';

var Dialogue = require( './Dialogue' ),
	DialogueStep = require( './DialogueStep' );

var AttributionDialogue = function() {
	var dialogue = new Dialogue();
	dialogue.addStep( new DialogueStep( 'typeOfUse' ) );
	dialogue.addStep( new DialogueStep( 'author' ) );
	dialogue.addStep( new DialogueStep( 'compilation' ) );
	dialogue.addStep( new DialogueStep( 'editing' ) );

	this._dialogue = dialogue;
};

module.exports = AttributionDialogue;
