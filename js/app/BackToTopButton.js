'use strict';

var $ = require( 'jquery' )
var Messages = require('./Messages')

var BackToTopButton = function( content ) {

};


$.extend( BackToTopButton.prototype, {


  	/**
  	 * Renders information about the usage not requiring attributing the author,
  	 * if the asset has been licenced under appropriate licence, or starts the dialogue otherwise.
  	 *
  	 * @param {jQuery} $screen
  	 */
  	render: function( $screen ) {
      var $btn = $('<button class="green-btn btn-back-to-top">' +
        '<div class="btn-icon glyphicon glyphicon-refresh"></div>' +
        '<span class="btn-text">' + Messages.t('dialogue.back-to-top') +
        '</span></button>'
      )
      $btn.bind("click", function () {
        $(':input','#file-form')
        .not(':button, :submit, :reset, :hidden')
        .val('')
        .removeAttr('checked')
        .removeAttr('selected');

       $( 'html, body' ).animate( {
               scrollTop: 0
       }, 500 );
       setTimeout(function () {
               $( '#results-screen' ).hide();
               $( '.dialogue-screen' ).remove();
       }, 500);
     })
      $btn.addClass('float-right')
      return $btn;
    }
});

module.exports = BackToTopButton;
