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
			baseUrl + '../backend/web/feedback',
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
}( jQuery ) );
