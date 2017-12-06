'use strict';

var $ = require( 'jquery' ),
	template = require( '../templates/LicenceStep.handlebars' ),
	LicenceStore = require( '../LicenceStore' ),
	config = require( '../../config.json' ),
	licences = new LicenceStore( require( '../LICENCES' ), config.portedLicences ),
	Messages = require( '../Messages' );

var LicenceStepView = function( original, compatibles ) {
	this._original = original;
	this._compatibles = compatibles;
};

$.extend( LicenceStepView.prototype, {
	render: function() {
		var title, name, url, defaultId;
		if (this._original.isPublicDomain()) {
			var cc0Licence = licences.getLicence('cc-zero');
			defaultId = cc0Licence.getId();
			title = Messages.t('dialogue.mark-as-pd');
			name = cc0Licence.getName();
			url = cc0Licence.getUrl();
		} else {
			defaultId = 'original';
			title = Messages.t('dialogue.same-licence');
			name = this._original.getName();
			url = this._original.getUrl();
		}

		return $( template( {
			defaultChoice: { title: title, name: name, url: url, id: defaultId},
			compatibles: this._compatibles
		} ) );
	}
} );

module.exports = LicenceStepView;
