'use strict';

var $ = require( 'jquery' ),
	AttributionDialogue = require( '../AttributionDialogue' );

var AttributionDialogueView = function() {
	this._dialogue = new AttributionDialogue();
	this._dialogue.init();
};

$.extend( AttributionDialogueView.prototype, {
	/**
	 * @type {AttributionDialogue}
	 */
	_dialogue: null,

	/**
	 * Turns a $form.serializeArray return value into an object
	 * @param {Object[]} formValues
	 * @returns {{}}
	 * @private
	 */
	_formValuesToObj: function( formValues ) {
		var form = {};
		$.each( formValues, function() {
			form[ this.name ] = this.value;
		} );

		return form;
	},

	_submit: function( e, $dialogue ) {
		var self = this;

		this._dialogue.currentStep().complete( this._formValuesToObj(
			$dialogue.find( 'form' ).serializeArray()
		) );
		$dialogue.animate( { opacity: 0 }, 500, function() {
			self.render( $dialogue );
			$dialogue.animate( { opacity: 1 }, 500 );
		} );
		e.preventDefault();
	},

	/**
	 * @param {jQuery} $dialogue
	 */
	render: function( $dialogue ) {
		var $step = this._dialogue.currentStep().render(),
			self = this;

		$step.find( '.immediate-submit input:checkbox' ).click( function() {
			$( this ).closest( 'form' ).submit();
		} );
		$step.find( 'form' ).submit( function( e ) {
			self._submit( e, $dialogue );
		} );

		$dialogue.html( $step );
	}
} );

module.exports = AttributionDialogueView;
