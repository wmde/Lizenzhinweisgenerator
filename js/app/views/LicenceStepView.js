'use strict';

var $ = require( 'jquery' ),
	template = require( '../templates/LicenceStep.handlebars' );

var LicenceStepView = function( original, compatibles ) {
	this._original = original;
	this._compatibles = compatibles;
};

$.extend( LicenceStepView.prototype, {
	render: function() {
		return $( template( {
			original: { name: this._original.getName(), url: this._original.getUrl() },
			compatibles: this._compatibles
		} ) );
	}
} );

module.exports = LicenceStepView;
