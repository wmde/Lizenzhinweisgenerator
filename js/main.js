'use strict';

var $ = require( 'jquery' ),
	FileForm = require( './app/FileForm' ),
	Tracking = require( './tracking' ),
	Spinner = require( './app/Spinner' ),
	Messages = require( './app/Messages' );

var tracking = new Tracking();
tracking.trackPageLoad( 'Main Page' );

window.$ = window.jQuery = $; // needed for bootstrap
require( 'bootstrap' );
require( './view_helpers' );
require( './scrolling_effects' );
require( './background' );

var $trackingSwitch = $( '#tracking-switch' );
if( tracking.shouldTrack() ) {
	$trackingSwitch.attr( 'checked', 'checked' );
} else {
	$trackingSwitch.attr( 'checked', false );
}
$trackingSwitch.change( function() {
	if( $( this ).is( ':checked' ) ) {
		tracking.removeDoNotTrackCookie();
		tracking.trackEvent( 'Tracking', 'Enabled' );
	} else {
		tracking.trackEvent( 'Tracking', 'Disabled' );
		tracking.setDoNotTrackCookie();
	}
} );

$( document ).on( 'click', '.track-click', function() {
	tracking.trackEvent(
		$( this ).data( 'track-category' ),
		$( this ).data( 'track-event' )
	);
} );

var fileForm = new FileForm( $( '#file-form' ), $( '#results-screen' ) );
fileForm.init();

var $howItWorks = $( '#how-it-works-screen' ),
	$scrollingElements = $( 'html, body' );

$( '#how-it-works-button' ).click( function() {
	$howItWorks.show();
	$scrollingElements
		.scrollTop( $howItWorks.height() )
		.animate( {
			scrollTop: 0
		}, 700
	);
} );

$( '#how-it-works-screen .close' ).click( function() {
	$scrollingElements.animate(
		{
			scrollTop: $howItWorks.height()
		},
		700
	).promise().done( function() {
		$howItWorks.hide();
		$scrollingElements.scrollTop( 0 );
	} );
} );

$( '#file-form-input' ).on( 'input', function() {
	// TODO only dismiss if error is present
	fileForm.dismissError();
} );

var bootstrapAlert = function( type, message ) {
	$( '#alert-placeholder' ).html(
		'<div class="alert ag-alert alert-'
		+ type
		+ ' alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><span>'
		+ message
		+ '</span></div>'
	);
};

var $feedbackForm = $( '#feedback-form' ),
	baseUrl = '//' + location.host + location.pathname,
	loadingSpinner = new Spinner( $feedbackForm.find( 'button[type="submit"]' ) );

$feedbackForm.submit( function( e ) {
	loadingSpinner.add();
	$.post( baseUrl + '../backend/web/index.php/feedback',
		{
			name: $feedbackForm.find( 'input[name="name"]' ).val(),
			feedback: $feedbackForm.find( 'textarea' ).val()
		} )
		.done( function( response ) {
			tracking.trackEvent( 'Feedback', 'Success' );
			bootstrapAlert( 'success', $.parseJSON( response ).message );
			$( '#feedback-form' ).trigger( 'reset' );
			$( '#feedback-modal' ).modal( 'hide' );
		} )
		.fail( function( response ) {
			tracking.trackEvent( 'Feedback', 'Fail' );
			var jsonResponse = $.parseJSON( response.responseText );

			if( jsonResponse && jsonResponse.errors ) {
				bootstrapAlert( 'danger', jsonResponse.errors.join( ' ' ) );
			} else {
				bootstrapAlert( 'danger', Messages.t( 'error.send-feedback' ) );
			}
		} )
		.always( function() {
			loadingSpinner.remove();
		} );

	e.preventDefault();
} );

$( function() {
	// Instant start if input field is filled

	var $fileForm = $('#file-form'),
		$fileFormInput = $fileForm.find('#file-form-input'),
		fileFormVal = $fileFormInput.val();

	if (fileFormVal && fileFormVal !== '') {
		$fileForm.submit();
	}
} );
