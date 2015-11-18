'use strict';

var $ = require( 'jquery' ),
	doneTemplate = require( '../templates/Done.handlebars' ),
	dosAndDontsTemplate = require( '../templates/DosAndDonts.handlebars' ),
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
		var $html = $( doneTemplate() ),
			dosAndDonts = this._evaluation.getDosAndDonts();

		$html.append( attributionTemplate( {
			attribution: this._evaluation.getAttribution()
		} ) );
		$html.append( dosAndDontsTemplate( {
			dos: dosAndDonts.dos.map( function( d ) {
				return 'evaluation.do-' + d + '-text';
			} ),
			donts: dosAndDonts.donts.map( function( dont ) {
				return 'evaluation.dont-' + dont + '-text'
			} )
		} ) );

		return $html;
	}
} );

module.exports = DialogueEvaluationView;
