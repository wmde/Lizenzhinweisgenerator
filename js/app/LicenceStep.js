'use strict';

var $ = require( 'jquery' ),
	DialogueStep = require( './DialogueStep' ),
	LicenceStore = require( './LicenceStore' ),
	config = require( '../config.json' ),
	licences = new LicenceStore( require( './LICENCES' ), config.portedLicences ),
	LicenceStepView = require( './views/LicenceStepView' );

var LicenceStep = function( licence ) {
	this._name = 'licence';
	if( licence.isInGroup( 'ported' ) && !licence.isInGroup( 'knownPorted' ) ) {
		licence = licences.getLicence( licence.getUnportedVersionId() );
	}
	this._view = new LicenceStepView( licence, licences.findCompatibilities( licence.getId() ) );
};

$.extend( LicenceStep.prototype, DialogueStep.prototype );

module.exports = LicenceStep;
