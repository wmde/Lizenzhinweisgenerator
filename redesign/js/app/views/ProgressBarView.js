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
		var steps = this._dialogue.getSteps().map( function( step, i, allSteps ) {
				return {
					name: step.getName(),
					isSubstep: i >= 4 || allSteps.length < 7 && i >= 3
				};
			} ),
			$html = $( template( {
				steps: steps
			} ) );

		return $html;
	}
} );

module.exports = ProgressBarView;
