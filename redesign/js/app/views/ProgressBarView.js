'use strict';

var $ = require( 'jquery' ),
	template = require( '../templates/ProgressBar.handlebars' );

var ProgressBarView = function( dialogue, dialogueView ) {
	this._dialogue = dialogue;
	this._dialogueView = dialogueView;
};

$.extend( ProgressBarView.prototype, {
	/**
	 * @type {AttributionDialogue}
	 */
	_dialogue: null,

	/**
	 * @type {AttributionDialogueView}
	 */
	_dialogueView: null,

	/**
	 * @param {int} n
	 * @private
	 */
	_backToStep: function( n ) {
		if( n >= this._dialogue.currentStepIndex() ) {
			return;
		}

		this._dialogue.setStep( n );
		this._dialogueView.updateContent();
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
