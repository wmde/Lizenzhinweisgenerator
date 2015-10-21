'use strict';

var $ = require( 'jquery' );

var AttributionDialogueView = function() {
};

$.extend( AttributionDialogueView.prototype, {
	/**
	 * @param {jQuery} $dialogue
	 */
	render: function( $dialogue ) {
		$dialogue.html( 'Dialogue goes here!' );
	}
} );

module.exports = AttributionDialogueView;
