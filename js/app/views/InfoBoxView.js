'use strict';

var $ = require( 'jquery' ),
	infoBox = require( '../templates/InfoBox.handlebars' ),
	cookie = require( 'cookie' );

var InfoBoxView = function( name, text, buttons ) {
	this._name = name;
	this._text = text;
	this._buttons = buttons;
	this._dismissed = cookie.parse( document.cookie )[ this._name ] === 'hide';
};

$.extend( InfoBoxView.prototype, {
	_name: '',
	_text: '',
	_buttons: '',
	_dimissed: false,

	_dontShowAgain: function() {
		document.cookie = cookie.serialize(
			this._name,
			'hide',
			{ expires: this._nextYear() }
		);
	},

	_nextYear: function() {
		var date = new Date();
		date.setFullYear( date.getFullYear() + 1 );
		return date;
	},

	render: function() {
		if( this._dismissed ) {
			return '';
		}

		var $box = $( infoBox( { content: this._text, buttons: this._buttons, noCloseButton: this._name === 'ported-licence' } ) ),
			self = this;

		$box.find( '.close-info' ).click( function( e ) {
			$( this ).parents( '.info-box' ).slideUp();
			self._dismissed = true;
			e.preventDefault();
		} );
		$box.find( '.hide-forever' ).click( $.proxy( this._dontShowAgain, this ) );

		return $box;
	}
} );

module.exports = InfoBoxView;
