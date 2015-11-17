'use strict';

var $ = require( 'jquery' ),
	doneTemplate = require( '../templates/Done.handlebars' ),
	attributionTemplate = require( '../templates/Attribution.handlebars' );

/**
 * @param {DialogueEvaluation} evaluation
 * @constructor
 */
var DialogueEvaluationView = function( evaluation ) {
	this._evaluation = evaluation;
};

$.extend( DialogueEvaluationView.prototype, {
	/**
	 * @type {DialogueEvaluation}
	 */
	_evaluation: null,

	render: function() {
		var $html = $( doneTemplate() );

		$html.append( attributionTemplate( {
			attribution: this._evaluation.getAttribution()
		} ) );

		return $html;
	}
} );

module.exports = DialogueEvaluationView;
