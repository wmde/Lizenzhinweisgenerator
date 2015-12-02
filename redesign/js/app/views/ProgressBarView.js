'use strict';

var $ = require( 'jquery' ),
	template = require( '../templates/ProgressBar.handlebars' );

var ProgressBarView = function() {

};

$.extend( ProgressBarView.prototype, {
	render: function() {
		var $html = $( template() );

		return $html;
	}
} );

module.exports = ProgressBarView;
