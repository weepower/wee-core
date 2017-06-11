import $router from 'wee-routes';
import sinon from 'sinon';
import $events from 'wee-events';
import $ from 'wee-dom';
import { triggerEvent } from '../../helpers/events';

const basicRoutes = [
	{
		path: '/',
		init() {}
	},
	{
		path: '/about',
		init() {}
	},
	{
		path: '/faq',
		init() {}
	}
];
const start = '<nav><a href="/" id="home">home</a><a href="/about" id="about">About</a><a href="/faq" id="faq">FAQ</a></nav><main>This is the home page</main>';
const responses = {
	home: '<title>Homepage</title><main>This is the home page</main>',
	about: '<title>About</title><main>This is the about page</main>',
	faq: '<title>FAQ</title><main>This is the FAQ page</main>'
};

describe('pjax', () => {
	let stateArray = [];
	let server;

	beforeEach(() => {
		window.history.replaceState(0, '', '/');

		// Initialize fake server and initial page load (homepage)
		server = sinon.fakeServer.create();
		document.body.innerHTML = start;
		document.title = 'Homepage';

		// Set up server endpoints
		server.respondWith('GET', '/', [200, {}, responses.home]);
		server.respondWith('GET', '/about', [200, {}, responses.about]);
		server.respondWith('GET', '/faq', [200, {}, responses.faq]);

		// Set up router
		$router.map(basicRoutes);
	});

	afterEach(() => {
		server.restore();
		$router.reset();
		stateArray = [];
	});

	it('should bind events to default elements', () => {
		$router.pjax().run();

		expect($events.bound('a', 'click').length).to.equal(3);
	});

	it('should bind events to designated elements', () => {
		$router.pjax({
			bind: {
				hover: 'a'
			}
		}).run();

		expect($events.bound('a', 'hover').length).to.equal(3);
	});

	it('should replace defined DOM elements on navigation', done => {
		$router.pjax().run();

		$events.trigger('#about', 'click');
		server.respond();

		setTimeout(function() {
			expect($('title').text()).to.equal('About');
			expect($('main').text()).to.equal('This is the about page');
			done();
		}, 200);
	});

	it('should change resulting HTML with replace callback', done => {
		$router.pjax({
			replace(html) {
				return '<title>Modified About</title><main>Modified about page</main>';
			}
		}).run();

		$events.trigger('#about', 'click');
		server.respond();

		setTimeout(function() {
			expect($('title').text()).to.equal('Modified About');
			expect($('main').text()).to.equal('Modified about page');
			done();
		}, 200);
	});
});