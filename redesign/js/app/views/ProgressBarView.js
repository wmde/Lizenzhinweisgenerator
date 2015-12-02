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
		var $html = $( template( {
			steps: this._dialogue.getSteps()
		} ) );

		return $html;
	}
} );

module.exports = ProgressBarView;
