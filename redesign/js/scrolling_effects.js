( function( $, ScrollMagic ) {
	'use strict';

	var controller = new ScrollMagic.Controller(),
			$logo = $( '#wikimedia-logo' ),
			logoOffsetTop = $logo.offset().top,
			landingScreenHeight = $( '#landing-screen' ).height();

	new ScrollMagic.Scene( {
		duration: function() {
			var height = $logo.height() + ( 2 * logoOffsetTop );

			return landingScreenHeight - height;
		},
		triggerElement: '#landing-screen',
		offset: landingScreenHeight / 2
	} )
	.setPin( '#wikimedia-logo' )
	.addTo( controller );
}( jQuery, ScrollMagic ) );
