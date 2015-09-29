<?php

use Silex\WebTestCase;

class ApplicationTest extends WebTestCase {
	public function createApplication() {
		return require __DIR__ . '/../app.php';
	}

	public function testAppRunning() {
		$client = $this->createClient();
		$client->request( 'GET', '/' );
		$this->assertTrue( $client->getResponse()->isOk() );
	}
}
