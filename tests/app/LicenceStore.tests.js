( function( define ) {

define( ['qunit', 'LicenceStore', 'Licence'], function( QUnit, LicenceStore, Licence ) {

	QUnit.module( 'LicenceStore' );

	var testSet = [
		{
			licence: new Licence( 'PD', 'PD-text', /^(PD|Public domain)\b/i ),
			detectable: [
				['PD NASA']
			]
		},
		{
			licence: new Licence( 'cc-by-3.0', 'CC BY 3.0', /^CC-BY-3.0(([^\-]+.+|-migrated)*)?$/i, 'cc-by-3.0 link' ),
			detectable: [
				['CC-BY-SA-3.0', 'CC-BY-3.0']
			]
		},
		{
			licence: new Licence( 'cc-by-sa-3.0-de', 'CC BY-SA 3.0 DE', 'cc-by-3.0-de link' ),
			detectable: [
				['CC-BY-SA-3.0-DE']
			]
		},
		{
			licence: new Licence( 'cc-by-sa-3.0', 'CC BY-SA 3.0', /^CC-BY-SA-3.0(([^\-]+.+|-migrated)*)?$/i, 'cc-by-sa-3.0 link' ),
			detectable: [
				['CC-BY-SA-3.0', 'some other string'],
				['some other string', 'CC-BY-SA-3.0'],
				['CC-BY-SA-2.0', 'CC-BY-SA-3.0,2.5,2.0,1.0']
			]
		}
	];

	/**
	 * @param {Object} testSet
	 * @return {Licence[]}
	 */
	function extractLicences( testSet ) {
		var licences = [];
		for( var i = 0; i < testSet.length; i++ ) {
			licences.push( testSet[i].licence );
		}
		return licences;
	}

	QUnit.test( 'Instantiation & getLicences()', function( assert ) {
		var licenceStore = new LicenceStore(),
			licences = extractLicences( testSet );

		assert.ok(
			licenceStore.getLicences(),
			'Instantiated empty licence store.'
		);

		licenceStore = new LicenceStore( licences );

		assert.equal(
			licenceStore.getLicences().length,
			licences.length,
			'Instantiated licence store with ' + licences.length + ' licences.'
		)
	} );

	QUnit.test( 'appendLicence()', function( assert ) {
		var licenceStore = new LicenceStore(),
			licences = extractLicences( testSet );

		assert.ok(
			licenceStore.getLicences(),
			'Instantiated empty licence store.'
		);

		licenceStore.appendLicence( licences[0] );

		assert.equal(
			licenceStore.getLicences().length,
			1,
			'Appended a licence.'
		);

		assert.equal(
			licenceStore.getLicence( licences[0].getId() ),
			licences[0],
			'Validated appended licence.'
		);

		assert.throws(
			function() {
				licenceStore.append( 'invalid' );
			},
			'Throwing an error when trying to append an invalid licence.'
		);
	} );

	QUnit.test( 'getLicence()', function( assert ) {
		var licences = extractLicences( testSet ),
			licenceStore = new LicenceStore( licences ),
			maxIndex = licences.length - 1;

		assert.equal(
			licenceStore.getLicence( licences[maxIndex].getId() ),
			licences[maxIndex],
			'Retrieved expected licence from the store.'
		);

		assert.strictEqual(
			licenceStore.getLicence( 'non-existent id' ),
			null,
			'Trying to get a licence with an id not registered returns "null".'
		);
	} );

	QUnit.test( 'detectLicence()', function( assert ) {
		var licenceStore = new LicenceStore(),
			detectables = [];

		for( var i = 0; i < testSet.length; i++ ) {
			licenceStore.appendLicence( testSet[i].licence );
			detectables.push( testSet[i].detectable );
		}

		for( i = 0; i < detectables.length; i++ ) {
			for( var j = 0; j < detectables[i].length; j++ ) {
				assert.equal(
					licenceStore.detectLicence( detectables[i][j] ),
					testSet[i].licence,
					'Detected licence "' + testSet[i].licence.getId() + '" on "' + detectables[i][j]
						+ '"'
				)
			}
		}

		assert.equal(
			licenceStore.detectLicence( 'nothing to detect' ),
			null,
			'Returning "null" when no licence can be detected.'
		);
	} );

} );

}( define ) );
