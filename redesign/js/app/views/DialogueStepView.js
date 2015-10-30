'use strict';

var $ = require( 'jquery' );

/**
 * @param {Handlebars()} template
 * @constructor
 */
var DialogueStepView = function( template ) {
	this._template = template;
};

$.extend( DialogueStepView.prototype, {
	/**
	 * @type {Handlebars()}
	 */
	_template: null,

	render: function() {
		return $( this._template() );
	}
} );

module.exports = DialogueStepView;
