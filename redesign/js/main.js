'use strict';

var $ = require( 'jquery' ),
	FileForm = require( './app/FileForm' ),
	Tracking = require( './tracking' );

var tracking = new Tracking();
tracking.trackPageLoad( 'Main Page' );

window.$ = window.jQuery = $; // needed for bootstrap
require( 'bootstrap' );
require( './view_helpers' );
require( './scrolling_effects' );
require( './background' );

var trackingSwitch = $( '#tracking-switch' );
if( tracking.shouldTrack() ) {
	// TODO germanify
	trackingSwitch.text( 'Dont\'t track me!' );
	trackingSwitch.click( function() {
		tracking.setDoNotTrackCookie();
		$( '#tracking-switch' ).remove();
	} );
} else {
	// TODO germanify
	trackingSwitch.text( 'Track me again!' );
	trackingSwitch.click( function() {
		tracking.removeDoNotTrackCookie();
		$( '#tracking-switch' ).remove();
	} );
}

var fileForm = new FileForm( $( '#file-form' ), $( '#results-screen' ) );
fileForm.init();

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

$( '#file-form-input' ).on( 'input', function() {
	// TODO only dismiss if error is present
	fileForm._dismissError();
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
	baseUrl = '//' + location.host + location.pathname;
$feedbackForm.submit( function( e ) {
	$.post(
		baseUrl + '../backend/web/index.php/feedback',
		{
			name: $feedbackForm.find( 'input[name="name"]' ).val(),
			feedback: $feedbackForm.find( 'textarea' ).val()
		}
	)
		.done( function( response ) {
			bootstrapAlert( 'success', $.parseJSON( response ).message );
			$( '#feedback-modal' ).modal( 'hide' );
		} )
		.fail( function( response ) {
			var jsonResponse = $.parseJSON( response.responseText );

			if( jsonResponse && jsonResponse.errors ) {
				bootstrapAlert( 'danger', jsonResponse.errors.join( ' ' ) );
			} else {
				bootstrapAlert( 'danger', 'Beim Senden ist etwas schiefgelaufen. Bitte versuche es erneut.' );
			}
		} );

	e.preventDefault();
} );
