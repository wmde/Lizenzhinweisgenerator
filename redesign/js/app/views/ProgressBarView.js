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

	/**
	 * @param {int} n
	 * @private
	 */
	_backToStep: function( n ) {
		this._dialogue.setStep( n );
	},

	render: function() {
		var steps = this._dialogue.getSteps()
			.concat( [ {
				getName: function() {
					return 'done';
				}
			} ] ),
			activeStep = steps.indexOf( this._dialogue.currentStep() ),
			$html = $( template( {
				steps: steps.map( function( step, i, allSteps ) {
					var lastStepIndex = allSteps.length - 1;
					activeStep = activeStep === -1 ? lastStepIndex : activeStep;

					return {
						name: 'dialogue.' + step.getName(),
						isSubstep: i !== lastStepIndex && ( i >= 4 || allSteps.length < 8 && i >= 3 ),
						isActive: i === activeStep,
						isCompleted: i < activeStep
					};
				} )
			} ) ),
			self = this;

		$html.find( 'li a' ).click( function( e ) {
			self._backToStep( $html.find( 'li a' ).index( $( this ) ) );
			e.preventDefault();
		} );

		return $html;
	}
} );

module.exports = ProgressBarView;
