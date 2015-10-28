'use strict';

var $ = require( 'jquery' );

var DialogueStepView = function( template ) {
	this._template = template;
};

$.extend( DialogueStepView.prototype, {
	render: function() {
		return $( this._template() );
	}
} );

module.exports = DialogueStepView;
