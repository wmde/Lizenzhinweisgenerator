'use strict';

var $ = require( 'jquery' ),
	template = require( '../templates/ProgressBar.handlebars' );

var ProgressBarView = function( dialogue, dialogueView ) {
	this._dialogue = dialogue;
	this._dialogueView = dialogueView;
	this._initialized = false;
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
	 * @type {boolean}
	 */
	_initialized: false,

	_backBuffer: false,

	_setBackBuffer: function() {
		this._backBuffer = true;
		window.history.pushState( 'step-back', '', '' );
	},

	/**
	 * @param {int} n
	 * @private
	 */
	_backToStep: function( n ) {
		if( n < 0 || n >= this._dialogue.currentStepIndex() ) {
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
						isSubstep: i !== lastStepIndex && allSteps.length > 5 && i >= lastStepIndex - 3,
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

		if( window.history && this._dialogue.currentStepIndex() > 0 ) {
			if( !this._backBuffer ) {
				this._setBackBuffer();
			}

			if( !this._initialized ) {
				this._initialized = true;

				$( window ).on( 'popstate', function() {
					self._backBuffer = false;
					self._backToStep( self._dialogue.currentStepIndex() - 1 );
				} );
			}
		}

		return $html;
	}
} );

module.exports = ProgressBarView;
