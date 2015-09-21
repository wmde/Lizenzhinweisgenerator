( function( $ ) {
	'use strict';

	var $howItWorks = $( '#how-it-works-screen' ),
		$body = $( 'body' );
	$( '#how-it-works-button' ).click( function() {
		$howItWorks.show();
		$body
			.scrollTop( $howItWorks.height() )
			.animate( {
				scrollTop: 0
			}, 700
		);
	} );

	$( '#how-it-works-screen .close' ).click( function() {
		$body.animate(
			{
				scrollTop: $howItWorks.height()
			},
			700,
			function() {
				$howItWorks.hide();
				$body.scrollTop( 0 );
			}
		);
	} );
}( jQuery ) );
