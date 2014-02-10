( function( $, app ) {
'use strict';

$.event.props.push('dataTransfer');

$( document ).ready( function () {
	var application = new app.Application(
		$( '#application' ),
		new app.Api( '//commons.wikimedia.org/w/api.php?callback=?' )
	);

	application.start();
} );

}( jQuery, app ) );
