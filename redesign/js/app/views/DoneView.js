'use strict';

var $ = require( 'jquery' ),
	template = require( '../templates/Done.handlebars' );

/**
 * @constructor
 */
var DoneView = function() {
};

$.extend( DoneView.prototype, {
	render: function() {
		return $( template() );
	}
} );

module.exports = DoneView;
