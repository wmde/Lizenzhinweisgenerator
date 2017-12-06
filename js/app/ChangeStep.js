'use strict';

var $ = require( 'jquery' ),
	DialogueStep = require( './DialogueStep' ),
	ChangeStepView = require( './views/ChangeStepView' );

var ChangeStep = function( licence ) {
	this._name = 'change';
	this._view = new ChangeStepView( licence );
};

$.extend( ChangeStep.prototype, DialogueStep.prototype );

module.exports = ChangeStep;
