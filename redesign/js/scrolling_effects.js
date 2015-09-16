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

	var textboxOffset = ( 2 * $( '#how-it-works-screen' ).height() ) - landingScreenHeight;
	new ScrollMagic.Scene( {
		triggerElement: '#landing-screen',
		offset: -textboxOffset,
		triggerHook: 0,
		duration: landingScreenHeight - ( 82 * 1.5 )
	} )
	.setPin( '#file-form' )
	.addTo( controller );

	new ScrollMagic.Scene( {
		triggerElement: '#landing-screen',
		triggerHook: 0,
		offset: -landingScreenHeight / 2,
		duration: landingScreenHeight / 2
	} )
	.setTween( '.top-wrapper', { opacity: 1 } )
	.addTo( controller );
}( jQuery, ScrollMagic ) );
