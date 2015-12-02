'use strict';

var $ = require( 'jquery' ),
	template = require( '../templates/ProgressBar.handlebars' );

var ProgressBarView = function( dialogue ) {
	this._dialogue = dialogue;
};

$.extend( ProgressBarView.prototype, {
	/**
	 * @type {AttributionDialogue}
	 */
	_dialogue: null,

	render: function() {
		var steps = this._dialogue.getSteps(),
			currentStep = steps.indexOf( this._dialogue.currentStep() ),
			$html = $( template( {
				steps: steps.map( function( step, i, allSteps ) {
					return {
						name: 'dialogue.' + step.getName(),
						isSubstep: i >= 4 || allSteps.length < 7 && i >= 3,
						isActive: i === currentStep,
						isCompleted: i < currentStep
					};
				} )
			} ) );

		return $html;
	}
} );

module.exports = ProgressBarView;
