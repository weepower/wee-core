import $router, { history } from 'wee-routes';
import sinon from 'sinon';
import $events from 'wee-events';
import $ from 'wee-dom';
import { QueueError } from 'routes/error';
import pjax from 'routes/pjax';
import * as pjaxModule from 'routes/pjax';
import * as pushState from 'routes/push-state';

const start = '<nav><a href="/" id="home">home</a><a href="/about" id="about">About</a><a href="/faq" id="faq">FAQ</a><a href="/contact" id="contact">Contact us</a></nav><main>This is the home page</main>';
const responses = {
	home: '<title>Homepage</title><main>This is the home page</main>',
	about: '<title>About</title><main>This is the about page</main>',
	faq: '<title>FAQ</title><main>This is the FAQ page</main>',
	contact: '<title>Contact</title><main><form action="/contact" method="POST"><input name="name" value="Donald Draper"><input name="email" value="don@gmail.com"><button>submit</button></form></main>',
	contactConfirmation: '<title>Contact confirmation</title><main>This is the contact confirmation page</main>'
};

describe('Router: pjax', () => {
	let stateArray = [];
	let server;
	let homeSpy;
	let aboutSpy;
	let faqSpy;
	let contactSpy;

	after($router.reset);

	beforeEach(() => {
		$router.reset();

		// Initialize fake server and initial page load (homepage)
		window.history.replaceState(0, '', '/');
		document.body.innerHTML = start;
		document.title = 'Homepage';
		server = sinon.fakeServer.create();

		// Set up server endpoints
		server.respondWith('GET', '/', [200, {}, responses.home]);
		server.respondWith('GET', '/about', [200, {}, responses.about]);
		server.respondWith('GET', '/faq', [200, {}, responses.faq]);
		server.respondWith('GET', '/contact', [200, {}, responses.contact]);
		server.respondWith('GET', '/contact-confirmation', [200, {}, responses.contactConfirmation]);
		server.respondWith('POST', '/contact', [200, {}, 'OK']);

		// Map routes
		homeSpy = sinon.stub();
		aboutSpy = sinon.stub();
		faqSpy = sinon.stub();
		contactSpy = sinon.stub();
		homeSpy.callsArg(2);
		aboutSpy.callsArg(2);
		faqSpy.callsArg(2);
		contactSpy.callsArg(2);

		$router.map([
			{
				path: '/',
				before: homeSpy
			},
			{
				path: '/about',
				before: aboutSpy
			},
			{
				path: '/faq',
				before: faqSpy
			},
			{
				path: '/contact',
				before: contactSpy
			}
		]);
	});

	afterEach(() => {
		server.restore();
		stateArray = [];
	});

	it('should bind events to designated elements', () => {
		$router.pjax({
			bind: {
				click: 'a'
			}
		}).run();

		expect($events.bound('a', 'click').length).to.equal(4);
	});

	it('should throw error if pjax.go request fails', done => {
		let spy = sinon.spy();
		let historyStub = sinon.stub(history, 'push');
		historyStub.returns(Promise.reject());

		let finish = function() {
			$events.trigger('#about', 'click');

			// Triggering click event is an asynchronous action
			// Need to move assertion to next tick
			setTimeout(() => {
				expect(spy.calledOnce).to.be.true;

				// Cleanup
				historyStub.restore();
				done();
			}, 0);
		}

		$router.pjax({
				onError: spy
			})
			.run()
			.then(finish, finish)
			.catch(done);
	});

	it('should replace target partials on navigation', done => {
		function finish() {
			$events.trigger('#about', 'click');
			server.respond();

			setTimeout(function() {
				expect($('title').text()).to.equal('About');
				expect($('main').text()).to.equal('This is the about page');
				done();
			}, 200);
		}

		$router.pjax().run().then(finish, finish);
	});

	it('should add window.history entry', done => {
		function finish() {
			// Ensure that history.length is not at max of 50 entries
			while (window.history.length > 49) {
				window.history.back();
			}

			const initial = window.history.length;

			// Triggering PJAX should call $router.push which will add history entry
			$events.trigger('#about', 'click');
			server.respond();

			setTimeout(function() {
				expect(window.history.length).to.equal(initial + 1);
				expect($('title').text()).to.equal('About');
				expect($('main').text()).to.equal('This is the about page');
				done();
			}, 200);
		}

		$router.pjax().run().then(finish, finish);
	});

	it('should add PJAX header', done => {
		function finish() {
			$events.trigger('#contact', 'click');
			server.respond();

			setTimeout(function() {
				expect(server.requests[0].requestHeaders['X-PJAX']).to.equal('true');
				expect(server.requests.length).to.equal(1);
				done();
			}, 0);
		}

		$router.pjax().run().then(finish, finish);
	});

	it('should update on popstate events', done => {
		function finish() {
			// Navigate to about page
			$events.trigger('#about', 'click');
			server.respond();

			// Navigate to faq page
			$events.trigger('#faq', 'click');
			server.respond();

			// Assert we are on FAQ page
			setTimeout(function() {
				expect(window.location.pathname).to.equal('/faq');
				expect($('title').text()).to.equal('FAQ');
				expect($('main').text()).to.equal('This is the FAQ page');

				// Trigger popstate, clicking back button
				window.history.back();

				// Server could not respond properly without deferring
				// history.back must be asynchronous
				setTimeout(function() {
					server.respond();

					setTimeout(function() {
						expect(window.location.pathname).to.equal('/about');
						expect($('title').text()).to.equal('About');
						expect($('main').text()).to.equal('This is the about page');

						done();
					}, 100);
				}, 300);
			}, 300);
		}

		$router.pjax().run().then(finish, finish);
	});

	describe('push', () => {
		it('should trigger PJAX request if enabled', done => {
			let finish = function() {
				expect(window.location.pathname).to.equal('/about');
				expect($('title').text()).to.equal('About');
				expect($('main').text()).to.equal('This is the about page');
			};

			$router.pjax().run()
				.then(() => {
					let promise = $router.push('/about');

					server.respond();

					return promise;
				}, done).then(finish, finish).then(done, done);
		});

		it('should be able to bypass PJAX', () => {
			let resolveSpy = sinon.spy();
			let rejectSpy = sinon.spy();
			let finish = function() {
				expect(resolveSpy.calledOnce).to.be.true;
				expect(rejectSpy.called).to.be.false;
				expect(window.location.pathname).to.equal('/about');
				expect($('title').text()).to.equal('Homepage');
				expect($('main').text()).to.equal('This is the home page');

				// Make sure that pjax was re-enabled after request
				expect(pjax.isPaused()).to.be.false;
			};

			return $router.pjax().run().then(() => {
				let process = $router.push('/about', true);

				server.respond();

				return process.then(resolveSpy, rejectSpy)
					.then(finish, finish);
			});
		});

		it('should override pjax partials', () => {
			let resolveSpy = sinon.spy();
			let rejectSpy = sinon.spy();
			let finish = function() {
				expect(resolveSpy.calledOnce).to.be.true;
				expect(rejectSpy.called).to.be.false;
				expect(window.location.pathname).to.equal('/faq');
				expect($('title').text()).to.equal('Homepage'); // Title from previous page
				expect($('main').text()).to.equal('This is the FAQ page');

				// Make sure that pjax was re-enabled after request
				expect(pjax.isPaused()).to.be.false;
			};

			return $router.pjax().run().then(() => {
				let process = $router.push('/faq', {
					partials: ['main'] // Leaving out title from partials list
				});

				server.respond();

				return process.then(resolveSpy, rejectSpy)
					.then(finish, finish);
			});
		});
	});

	describe('replace', () => {
		it('should trigger PJAX request if enabled', done => {
			let finish = function() {
				expect(window.location.pathname).to.equal('/about');
				expect($('title').text()).to.equal('About');
				expect($('main').text()).to.equal('This is the about page');
			};

			$router.pjax().run()
				.then(() => {
					let promise = $router.replace('/about');

					server.respond();

					return promise;
				}, done).then(finish, finish).then(done, done);
		});

		it('should be able to bypass PJAX', () => {
			let resolveSpy = sinon.spy();
			let rejectSpy = sinon.spy();
			let finish = function() {
				expect(resolveSpy.calledOnce).to.be.true;
				expect(rejectSpy.called).to.be.false;
				expect(window.location.pathname).to.equal('/about');
				expect($('title').text()).to.equal('Homepage');
				expect($('main').text()).to.equal('This is the home page');

				// Make sure that pjax was re-enabled after request
				expect(pjax.isPaused()).to.be.false;
			};

			$router.pjax().run();

			let process = $router.replace('/about', true);
			server.respond();

			return process.then(resolveSpy, rejectSpy).then(finish, finish);
		});

		it('should override pjax partials', () => {
			let resolveSpy = sinon.spy();
			let rejectSpy = sinon.spy();
			let finish = function() {
				expect(resolveSpy.calledOnce).to.be.true;
				expect(rejectSpy.called).to.be.false;
				expect(window.location.pathname).to.equal('/faq');
				expect($('title').text()).to.equal('Homepage'); // Title from previous page
				expect($('main').text()).to.equal('This is the FAQ page');

				// Make sure that pjax was re-enabled after request
				expect(pjax.isPaused()).to.be.false;
			};

			return $router.pjax().run().then(() => {
				let process = $router.replace('/faq', {
					partials: ['main'] // Leaving out title from partials list
				});

				server.respond();

				return process.then(resolveSpy, rejectSpy)
					.then(finish, finish);
			});
		});
	});

	describe('init', () => {
		it('should return false if push state is not supported', () => {
			let stub = sinon.stub(pushState, 'supportsPushState');
			stub.returns(false);

			expect(pjax.init()).to.be.false;

			// Cleanup
			stub.restore();
		});
	});

	describe('go', () => {
		it('should execute "next", passing in error if fetch request fails', (done) => {
			let nextSpy = sinon.spy();
			let stub = sinon.stub(pjaxModule.settings, 'fetch');
			let error = new Error();
			stub.returns(Promise.reject(error));

			pjax.go({}, {}, nextSpy);

			setTimeout(() => {
				expect(nextSpy.calledOnce).to.be.true;
				expect(nextSpy.calledWith(error)).to.be.true;

				// Cleanup
				stub.restore();

				done();
			}, 50);
		});

		it('should return false if not pushState not supported', () => {
			let locationStub = sinon.stub(pjax, '_setWindowLocation');
			let pushStateStub = sinon.stub(pushState, 'supportsPushState');
			pushStateStub.returns(false);
			locationStub.returns(false);

			expect(pjax.go({}, {})).to.be.false;

			// Cleanup
			pushStateStub.restore();
			locationStub.restore();
		});
	});
});