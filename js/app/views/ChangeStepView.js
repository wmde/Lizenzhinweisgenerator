'use strict';

var $ = require( 'jquery' ),
	template = require( '../templates/ChangeStep.handlebars' ),
  Messages = require( '../Messages');

var ChangeStepView = function( licence ) {
	this._licence = licence;
};

$.extend( ChangeStepView.prototype, {
	render: function() {
    var headline;
    if ( !this._licence.isPublicDomain() ) {
      headline = Messages.t('dialogue.change-headline');
    } else {
      headline = Messages.t('dialogue.change-pd-headline');
    }
		return $( template( {
			headline: headline
		} ) );
	}
} );

module.exports = ChangeStepView;
