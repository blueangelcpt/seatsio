<?php
App::uses('HttpSocket', 'Network/Http');
class SeatsioComponent extends Component {
	public $settings = array(
		'publicKey' => '',
		'secretKey' => ''
	);
	private $url = 'https://app.seats.io/api/';
	private $eventKey = '';
	private $reservationToken = '';
	private $socket = '';
	private $tag = 'seatsio';

	public function initialize(Controller $controller, $settings = array()) {
		// saving the controller reference for later use
		$this->controller = $controller;
		$this->settings = array_merge($this->settings, $settings);
		$this->socket = new HttpSocket();
	}

	public function setEventKey($eventKey) {
		$this->log('Setting event key: ' . $eventKey, $this->tag);
		$this->eventKey = $eventKey;
	}

	public function setReservationToken($reservationToken) {
		$this->log('Setting reservation token: ' . $reservationToken, $this->tag);
		$this->reservationToken = $reservationToken;
	}

	public function getReservationToken($tickets) {
		$url = $this->url . 'reservationToken/' . $this->settings['publicKey'] . '/create';
		$result = $this->socket->post($url, json_encode(array(
			'objects' => $tickets,
			'eventKey' => $this->eventKey,
			'secretKey' => $this->settings['secretKey']
		)));
		$this->reservationToken = json_decode($result->body);
		$this->log('Getting reservation token: ' . $this->reservationToken, $this->tag);
		return $this->reservationToken;
	}

	public function book($tickets) {
		$payload = json_encode(array(
			'objects' => $tickets,
			'eventKey' => $this->eventKey,
			'secretKey' => $this->settings['secretKey'],
			'reservationToken' => $this->reservationToken,
		));
		$this->log('Booking Reservation: ' . $payload, $this->tag);
		$result = $this->socket->post($this->url . 'book', $payload);
		$this->log('Result: ' . json_encode($result), $this->tag);
		return ($result->code == 200) ? true : false;
	}

	public function release($tickets) {
		$payload = json_encode(array(
			'objects' => $tickets,
			'eventKey' => $this->eventKey,
			'secretKey' => $this->settings['secretKey'],
			'reservationToken' => $this->reservationToken,
		));
		$this->log('Releasing reservation: ' . $payload, $this->tag);
		$result = $this->socket->post($this->url . 'release', $payload);
		$this->log('Result: ' . json_encode($result), $this->tag);
		return ($result->code == 200) ? true : false;
	}

	public function reserve($tickets) {
		$payload = json_encode(array(
			'objects' => $tickets,
			'event' => $this->eventKey,
			'publicKey' => $this->settings['publicKey'],
			'reservationToken' => $this->reservationToken,
		));
		$this->log('Making reservation: ' . $payload, $this->tag);
		$result = $this->socket->post($this->url . 'reserve', $payload);
		$this->log('Result: ' . json_encode($result), $this->tag);
		return ($result->code == 200) ? true : false;
	}
}