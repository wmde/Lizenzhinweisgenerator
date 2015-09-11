( function( $ ) {
  $( '#how-it-works-button' ).click( function () {
    $( '#how-it-works-screen' ).slideDown();
  } );

  $( '#how-it-works-screen .close' ).click( function () {
    $( '#how-it-works-screen' ).slideUp();
  } );
}( jQuery ) );
