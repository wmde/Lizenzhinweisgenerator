'use strict';

var $ = require( 'jquery' ),
	infoBox = require( '../templates/InfoBox.handlebars' );

var InfoBoxView = function( text, buttons ) {
	this._text = text;
	this._buttons = buttons;
};

$.extend( InfoBoxView.prototype, {
	_text: '',
	_buttons: '',

	render: function() {
		var $box = $( infoBox( { content: this._text, buttons: this._buttons } ) );

		$box.find( '.close-info' ).click( function( e ) {
			$( this ).parents( '.info-box' ).slideUp();
			e.preventDefault();
		} );

		return $box;
	}
} );

module.exports = InfoBoxView;
