'use strict';

var $ = require( 'jquery' ),
	ScrollMagic = require( 'scrollmagic' );
require( 'gsap' );
require( 'scrollmagic-gsap' );

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

var upSceneOffset = function() {
	return $( '#landing-screen' ).height() / 5;
};

var up = new ScrollMagic.Scene( {
	triggerElement: '#landing-screen',
	triggerHook: 'onEnter',
	offset: upSceneOffset(),
	duration: '80%'
} )
	.setTween( upTweens );

$( window ).resize( function() {
	up.offset( upSceneOffset() );
} );

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
