'use strict';

var cookie = require( 'cookie' );

var getCookieExpiryDate = function() {
	var now = new Date();
	var time = now.getTime();
	// 3 months
	var expireTime = time + ( 60 * 24 * 90 ) * 60000;
	now.setTime( expireTime );
	return now;
};

var getCookie = function( name ) {
	var value = '; ' + document.cookie;
	var parts = value.split( '; ' + name + '=' );
	if( parts.length === 2 ) {
		return parts.pop().split( ';' ).shift();
	}
	return null;
};

var userCookie = getCookie( 'filereuseuser' );
var uid;

if( userCookie !== null ) {
	uid = userCookie;
} else {
	uid = Math.round( ( Math.pow( 36, 16 + 1 ) - Math.random() * Math.pow( 36, 16 ) ) ).toString( 36 ).slice( 1 );
}

document.cookie = cookie.serialize( 'filereuseuser', uid, { 'expires': getCookieExpiryDate() } );

window.filereuseuser = uid;
