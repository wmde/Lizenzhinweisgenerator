( function( require ) {
'use strict';

require.config( {
	paths: {
		jquery: '../lib/jquery/jquery-1.11.0.min'
	}
} );


require( ['jquery', 'Application', 'Api'], function( $, Application, Api ) {

	$.event.props.push('dataTransfer');

	$( document ).ready( function () {
		var application = new Application(
			$( '#application' ),
			new Api( '//commons.wikimedia.org/w/api.php?callback=?' )
		);

		application.start();
	} );

} );

}( require ) );
