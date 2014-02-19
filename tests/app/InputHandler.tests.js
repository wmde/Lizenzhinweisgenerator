( function( define ) {

define( ['qunit', 'InputHandler'], function( QUnit, InputHandler ) {

	QUnit.module( 'InputHandler' );

	var testCases = {
		'Helene Fischer 2010.jpg': [
			'http://commons.wikimedia.org/wiki/File:Helene_Fischer_2010.jpg',
			'http://upload.wikimedia.org/wikipedia/commons/8/84/Helene_Fischer_2010.jpg',
			'http://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Helene_Fischer_2010.jpg/171px-Helene_Fischer_2010.jpg'
		],
		'JapaneseToiletControlPanel.jpg': [
			'http://commons.wikimedia.org/wiki/File:JapaneseToiletControlPanel.jpg',
			'http://upload.wikimedia.org/wikipedia/commons/e/e4/JapaneseToiletControlPanel.jpg',
			'http://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/JapaneseToiletControlPanel.jpg/320px-JapaneseToiletControlPanel.jpg'
		],
		'Gerardus t\' Hooft at Harvard.jpg': [
			'http://commons.wikimedia.org/wiki/File:Gerardus_t%27_Hooft_at_Harvard.jpg',
			'http://upload.wikimedia.org/wikipedia/commons/f/f4/Gerardus_t%27_Hooft_at_Harvard.jpg',
			'http://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Gerardus_t%27_Hooft_at_Harvard.jpg/180px-Gerardus_t%27_Hooft_at_Harvard.jpg'
		],
		'"Граничар" - Туховища.JPG': [
			'http://commons.wikimedia.org/wiki/File:%22%D0%93%D1%80%D0%B0%D0%BD%D0%B8%D1%87%D0%B0%D1%80%22_-_%D0%A2%D1%83%D1%85%D0%BE%D0%B2%D0%B8%D1%89%D0%B0.JPG',
			'http://upload.wikimedia.org/wikipedia/commons/9/9c/%22%D0%93%D1%80%D0%B0%D0%BD%D0%B8%D1%87%D0%B0%D1%80%22_-_%D0%A2%D1%83%D1%85%D0%BE%D0%B2%D0%B8%D1%89%D0%B0.JPG',
			'http://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/%22%D0%93%D1%80%D0%B0%D0%BD%D0%B8%D1%87%D0%B0%D1%80%22_-_%D0%A2%D1%83%D1%85%D0%BE%D0%B2%D0%B8%D1%89%D0%B0.JPG/640px-%22%D0%93%D1%80%D0%B0%D0%BD%D0%B8%D1%87%D0%B0%D1%80%22_-_%D0%A2%D1%83%D1%85%D0%BE%D0%B2%D0%B8%D1%89%D0%B0.JPG'
		]
	};

	QUnit.test( 'getFilename()', function( assert ) {
		var inputHandler = new InputHandler();

		$.each( testCases, function( filename, inputTests ) {
			for( var i = 0; i < inputTests.length; i++ ) {

				QUnit.stop();

				inputHandler.getFilename( inputTests[i] )
				.done( function( parsedFilename ) {
					assert.equal(
						parsedFilename,
						filename,
						'Detected correct filename "' + filename + '".'
					);
				} )
				.fail( function() {
					assert.ok(
						false,
						'Input parsing failed.'
					)
				} )
				.always( function() {
					QUnit.start();
				} );

			}
		} );

	} );

} );

}( define ) );
