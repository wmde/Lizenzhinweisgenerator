'use strict';

var $ = require( 'jquery' ),
	ScrollMagic = require( 'scrollmagic' ),
	gsapModule = require( 'gsap' );

var gsap = ( gsapModule && ( gsapModule.gsap || gsapModule.default ) ) || gsapModule;

// workaround for ScrollMagic - GSAP 3.x incompatibility
window.gsap = gsap;
window.TweenMax = gsap;
window.TweenLite = gsap;
window.TimelineMax = gsap.core && gsap.core.Timeline ? gsap.core.Timeline : ( gsap.timeline ? gsap.timeline : undefined );
require( 'scrollmagic-gsap' );

var controller = new ScrollMagic.Controller();

var fadeHeadingUp = gsap.fromTo(
	'.top-wrapper',
	{ opacity: 0, top: '15%' },
	{ opacity: 1, top: 0, duration: 1 }
);
var moveTextboxUp = gsap.fromTo(
	'#file-form',
	{ top: 0 },
	{ top: '60%', ease: 'none', duration: 1 }
);

var upTweens = gsap.timeline();
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

var moveTextboxDown = gsap.to(
	'#file-form',
	{ top: '100%', marginTop: '-82px', duration: 1 }
);
var fadeHeadingDown = gsap.to(
	'.top-wrapper',
	{ marginTop: '20vh', opacity: 0, duration: 1 }
);
var fadeAttributionDown = gsap.to(
	'.attribution',
	{ bottom: '20%', opacity: 0, duration: 1 }
);

var downTweens = gsap.timeline();
downTweens.add( [ fadeHeadingDown, moveTextboxDown, fadeAttributionDown ] );

var down = new ScrollMagic.Scene( {
	triggerElement: '#landing-screen',
	triggerHook: 'onLeave',
	duration: '80%'
} )
	.setTween( downTweens );

controller.addScene( [ up, down ] );
