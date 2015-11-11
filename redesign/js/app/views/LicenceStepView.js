'use strict';

var $ = require( 'jquery' ),
	template = require( '../templates/LicenceStep.handlebars' );

var LicenceStepView = function( original, compatibles ) {
	this._original = original;
	this._compatibles = compatibles;
}

$.extend( LicenceStepView.prototype, {
	render: function() {
		return $( template( { original: this._original, compatibles: this._compatibles } ) );
	}
} );

module.exports = LicenceStepView;
