<?php
require_once __DIR__.'/vendor/autoload.php';

$app = new Silex\Application();
$app['config'] = require __DIR__ . '/config.php';

$app['debug'] = $app['config']['debug'];

$app->register( new Silex\Provider\SwiftmailerServiceProvider() );
$app['swiftmailer.transport'] = $app['config']['swiftmailer.transport'];

$app->get( '/', function() {
	return 'Hello.';
} );

$app->post( '/feedback', function() use( $app ) {
	return ( new AttributionGenerator\Actions\FeedbackAction( $app ) )->getResponse();
} );

return $app;
