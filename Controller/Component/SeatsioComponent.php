<?php
App::import('Vendor', 'SeatsioClient', array('file' => 'seatsio-php/src/SeatsioClient.php'));
App::import('Vendor', 'Autoload', array('file' => 'seatsio-php/vendor/autoload.php'));

class SeatsioComponent extends Component {
	public $settings = array(
		'publicKey' => '',
		'secretKey' => ''
	);
	private $url = 'https://app.seats.io/api/';
	private $eventKey = '';
	private $reservationToken = '';
	private $socket = '';
	private $client = '';
	private $tag = 'seatsio';

	public function initialize(Controller $controller, $settings = array()) {
		// saving the controller reference for later use
		$this->controller = $controller;
		$this->settings = array_merge($this->settings, $settings);
		$this->client = new \Seatsio\SeatsioClient($this->settings['secretKey']);
	}

	public function setEventKey($eventKey) {
		$this->eventKey = $eventKey;
	}

	public function book($tickets) {
		$result = $this->client->events->book($this->eventKey, $tickets);
		$this->log(json_encode($result, true), 'seatsio');
		return ($result->code == 200) ? true : false;
	}

	public function release($tickets) {
		$result = $this->client->events->release($this->eventKey, $tickets);
		$this->log(json_encode($result, true), 'seatsio');
		return ($result->code == 200) ? true : false;
	}
}