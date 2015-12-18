'use strict';

var $ = require( 'jquery' );

/**
 * @param {Function} template
 * @constructor
 */
var DialogueStepView = function( template ) {
	this._template = template;
};

$.extend( DialogueStepView.prototype, {
	/**
	 * @type {Function}
	 */
	_template: null,

	render: function() {
		return $( this._template() );
	}
} );

module.exports = DialogueStepView;
