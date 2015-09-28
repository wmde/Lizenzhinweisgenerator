( function( $, ScrollMagic ) {
	'use strict';

	var controller = new ScrollMagic.Controller();

	var fadeHeadingUp = TweenMax.fromTo(
		'.top-wrapper',
		1,
		{ opacity: 0, top: '15%' },
		{ opacity: 1, top: 0 }
	);
	var moveTextboxUp = TweenMax.fromTo(
		'#file-form',
		1,
		{ top: 0 },
		{ top: '60%', ease: Linear.easeNone }
	);

	var upTweens = new TimelineMax();
	upTweens.add( [ fadeHeadingUp, moveTextboxUp ] );

	var up = new ScrollMagic.Scene( {
		triggerElement: '#landing-screen',
		triggerHook: 'onEnter',
		offset: $( '#landing-screen' ).height() / 5,
		duration: '80%'
	} )
	.setTween( upTweens );

	var moveTextboxDown = TweenMax.to(
		'#file-form',
		1,
		{ top: '100%', marginTop: '-82px' }
	);
	var fadeHeadingDown = TweenMax.to(
		'.top-wrapper',
		1,
		{ marginTop: '20vh', opacity: 0 }
	);
	var fadeAttributionDown = TweenMax.to(
		'.attribution',
		1,
		{ bottom: '20%', opacity: 0 }
	);

	var downTweens = new TimelineMax();
	downTweens.add( [ fadeHeadingDown, moveTextboxDown, fadeAttributionDown ] );

	var down = new ScrollMagic.Scene( {
		triggerElement: '#landing-screen',
		triggerHook: 'onLeave',
		duration: '80%'
	} )
	.setTween( downTweens );

	controller.addScene( [ up, down ] );
}( jQuery, ScrollMagic ) );
