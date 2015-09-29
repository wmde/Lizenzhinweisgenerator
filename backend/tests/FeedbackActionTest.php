<?php

use \Silex\WebTestCase;

class FeedbackActionTest extends WebTestCase {
	public function createApplication() {
		return require __DIR__ . '/../app.php';
	}

	private function sendWithData( array $data ) {
		$client = $this->createClient();

		$client->request(
			'POST',
			'/feedback',
			$data
		);

		return $client;
	}

	public function testSendFeedback() {
		$client = $this->sendWithData( [
			'name' => 'Alice',
			'feedback' => 'Yay!',
		] );

		$this->assertTrue( $client->getResponse()->isOk() );
		$this->assertContains( 'Vielen Dank für Dein Feedback', $client->getResponse()->getContent() );
	}

	public function testFailsWithoutName() {
		$client = $this->sendWithData( [
			'name' => '',
			'feedback' => 'Yay!',
		] );

		$this->assertContains( 'Alle Felder des Feedback-Formulars müssen ausgefüllt werden', $client->getResponse()->getContent() );
	}

	public function testFailsWithoutFeedback() {
		$client = $this->sendWithData( [
			'name' => 'Bob',
			'feedback' => '',
		] );

		$this->assertContains( 'Alle Felder des Feedback-Formulars müssen ausgefüllt werden', $client->getResponse()->getContent() );
	}
}
