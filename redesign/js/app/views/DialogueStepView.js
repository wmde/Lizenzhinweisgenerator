'use strict';

var $ = require( 'jquery' );

/**
 * @param {DialogueStep} step
 * @param {Handlebars()} template
 * @constructor
 */
var DialogueStepView = function( step, template ) {
	this._step = step;
	this._template = template;
};

$.extend( DialogueStepView.prototype, {
	/**
	 * @type {DialogueStep}
	 */
	_step: null,

	/**
	 * @type {Handlebars()}
	 */
	_template: null,

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

	_submit: function( e, $form ) {
		this._step.complete( this._formValuesToObj( $form.serializeArray() ) );
		e.preventDefault();
	},

	render: function() {
		var $view = $( this._template() ),
			self = this;

		$view.find( '.immediate-submit input:radio' ).click( function() {
			$( this ).closest( 'form' ).submit();
		} );
		$view.find( 'form' ).submit( function( e ) {
			self._submit( e, $( this ) );
		} );

		return $view;
	}
} );

module.exports = DialogueStepView;
