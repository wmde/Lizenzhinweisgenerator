'use strict';

var LicenceStore = require( '../js/app/LicenceStore' ),
	Asset = require( '../js/app/Asset' ),
	AttributionDialogue = require( '../js/app/AttributionDialogue' ),
	licences = new LicenceStore( require( '../js/app/LICENCES' ) );

var TestHelpers = {
	newDefaultAttributionDialogue: function() {
		var dialogue = new AttributionDialogue( new Asset( '', '', licences.getLicence( 'cc-by-2.0' ), null, [] ) );
		dialogue.init();

		return dialogue;
	}
};

module.exports = TestHelpers;
