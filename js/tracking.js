/**
 * @licence GNU GPL v3
 * @author Addshore
 */
'use strict';

var $ = require( 'jquery' ),
	cookie = require( 'cookie' ),
	config = require( './config.json' ),
	piwikUrl = 'https://' + window.location.host + config.piwikDir,
	piwik = require( 'piwik' ).setup( piwikUrl );

/**
 * Tracking Handler.
 * @constructor
 */
var Tracking = function() {
	this._cookieName = 'filereuseuser';
	// 1 day
	this._cookieExpiryDays = 60 * 24;
	this._piwikSiteId = config.piwikSiteId;
};

$.extend( Tracking.prototype, {

	/**
	 * @type {string}
	 */
	_cookieName: null,

	/**
	 * @type {int}
	 */
	_cookieExpiryDays: null,

	/**
	 * @type {int}
	 */
	_piwikSiteId: null,

	/**
	 * Track an event to piwik if allowed by the user
	 * @param category
	 * @param action
	 * @param name
	 * @param value
	 */
	trackEvent: function( category, action, name, value ) {
		if( !this.shouldTrack() ) {
			return;
		}

		var vars = {
			idsite: this._piwikSiteId,
			rec: 1,
			url: window.location.href,
			_id: this._getUserId(),
			// jscs:disable
			e_c: category,
			e_a: action
			// jscs:enable
		};
		if( typeof name !== 'undefined' ) {
			// jscs:disable
			vars.e_n = name;
			// jscs:enable
		}
		if( typeof value !== 'undefined' ) {
			// jscs:disable
			vars.e_v = value;
			// jscs:enable
		}

		piwik.track(
			vars,
			function( err, data ) {
				if( err ) {
					console.log( err );
				}
			}
		);
	},

	/**
	 * Track a pageload to piwik if allowed by the user
	 * @param pageName
	 */
	trackPageLoad: function( pageName ) {
		if( !this.shouldTrack() ) {
			return;
		}
		piwik.track(
			{
				idsite: this._piwikSiteId,
				rec: 1,
				url: window.location.href,
				// jscs:disable
				action_name: pageName,
				// jscs:enable
				_id: this._getUserId()
			},
			function( err, data ) {
				if( err ) {
					console.log( err );
				}
			}
		);
	},

	/**
	 * @returns {Date}
	 * @private
	 */
	_getCookieExpiryDate: function( expiryDays ) {
		var now = new Date();
		var time = now.getTime();
		// 3 months
		var expireTime = time + ( expiryDays * 60000 );
		now.setTime( expireTime );
		return now;
	},

	/**
	 * @returns {*}
	 * @private
	 */
	_getCookie: function( cookieName ) {
		var value = '; ' + document.cookie;
		var parts = value.split( '; ' + cookieName + '=' );
		if( parts.length === 2 ) {
			return parts.pop().split( ';' ).shift();
		}
		return null;
	},

	/**
	 * @private
	 */
	_setUserIdCookie: function( userId ) {
		document.cookie = cookie.serialize(
			this._cookieName,
			userId,
			{ 'expires': this._getCookieExpiryDate( this._cookieExpiryDays ) }
		);
	},

	/**
	 * @returns {string}
	 * @private
	 */
	_getUserId: function() {
		var userId = this._getCookie( this._cookieName );
		if( userId !== null ) {
			return userId;
		} else {
			userId = this._getFreshUserId();
			this._setUserIdCookie( userId );
			return userId;
		}
	},

	/**
	 * @returns {string}
	 * @private
	 */
	_getFreshUserId: function() {
		return Math.round( Math.pow( 36, 16 + 1 ) - Math.random() * Math.pow( 36, 16 ) ).toString( 36 ).slice( 1 );
	},

	/**
	 * Set a cookie showing this user does not want to be tracked
	 */
	setDoNotTrackCookie: function() {
		document.cookie = cookie.serialize(
			this._cookieName + '_notrack',
			'notrack',
			{ 'expires': this._getCookieExpiryDate( 365 ) }
		);
	},

	/**
	 * Unset a cookie showing that this user now wants to be tracked again
	 */
	removeDoNotTrackCookie: function() {
		document.cookie = cookie.serialize(
			this._cookieName + '_notrack',
			'notrack',
			{ 'expires': this._getCookieExpiryDate( -365 ) }
		);
	},

	/**
	 * Check if we should track the current user
	 * @returns {boolean}
	 */
	shouldTrack: function() {
		var noTrack = this._getCookie( this._cookieName + '_notrack' );
		return ( noTrack === null );
	}

} );

module.exports = Tracking;
