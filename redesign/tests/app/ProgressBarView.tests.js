'use strict';

QUnit.module( 'Progress Bar UI' );

var ProgressBarView = require( '../../js/app/views/ProgressBarView' );

QUnit.test( 'should have 5 steps by default', function( assert ) {
	assert.equal( new ProgressBarView().render().find( 'li' ).length, 5 );
} );
