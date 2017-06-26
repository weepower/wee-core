import $router from 'wee-routes';
import transition from 'routes/transitions';
import { $hasClass } from 'dom/index';
import setPath from '../../helpers/routes';
import sinon from 'sinon';

describe('Router: transitions', () => {
	const hideClass = '-is-hidden';

	before(() => {
		setPath('/');
	});

	beforeEach(() => {
		$router.reset();
	});

	it('should remove a class from the designated element on initial evaluation', done => {
		$router({
			transition: {
				target: 'body',
				class: hideClass
			}
		}).map([
			{
				path: '/',
				init() {
					// Make sure class is not added by router on initial evaluation
					expect(document.body.className).to.equal('');
					document.body.className = hideClass;
					expect($hasClass(document.body, hideClass)).to.be.true;
				}
			}
		]).onError(done).onReady(() => {
			expect($hasClass(document.body, hideClass)).to.be.false;
			done();
		}).run();
	});

	describe('with history navigation', () => {
		let beforeSpy;

		beforeEach(() => {
			beforeSpy = sinon.stub();
			beforeSpy.callsArg(2);

			setPath('/');

			$router.map([
				{ path: '/' }
			]).run();
		});

		it('should add and then remove a class on history navigation', () => {
			let events = [];
			let originalAddEventListener = document.body.addEventListener;

			// Mock addEventListener on body element
			document.body.addEventListener = function(event, method) {
				events.push(method);
			};

			let finish = function() {
				expect(beforeSpy.calledOnce).to.be.true;
				expect($hasClass(document.body, hideClass)).to.be.false;
			}

			$router({
				transition: {
					target: 'body',
					class: hideClass
				}
			}).map([
				{
					path: '/other',
					before: beforeSpy, // Ensure that init is getting executed
					init() {
						expect($hasClass(document.body, hideClass)).to.be.true;
					}
				}
			]);

			let promise = $router.push('/other');

			// Trigger fake events
			events.forEach(fn => fn());

			// Reset addEventListener on body
			document.body.addEventListener = originalAddEventListener;

			return promise.then(finish, finish);
		});

		it('should execute enter and leave callbacks', () => {
			let enterSpy = sinon.spy();
			let leaveSpy = sinon.spy();
			let finish = function() {
				expect(beforeSpy.calledOnce).to.be.true;
				expect(enterSpy.calledOnce).to.be.true;
				expect(leaveSpy.calledOnce).to.be.true;
			}

			$router({
				transition: {
					enter: enterSpy,
					leave: leaveSpy
				}
			}).map([
				{
					path: '/other',
					before: beforeSpy // Ensure that init is getting executed
				}
			]);

			return $router.push('/other').then(finish, finish);
		});
	});

	describe('enter', () => {
		it('should remove class to designated element', () => {
			document.body.className = hideClass;
			expect($hasClass(document.body, hideClass)).to.be.true;

			transition.enter({
				target: 'body',
				class: hideClass
			});

			expect($hasClass(document.body, hideClass)).to.be.false;
		});

		it('should execute enter callback', () => {
			let to = {};
			let from = {};
			let spy = sinon.spy();

			transition.enter({
				enter: spy
			}, to, from);

			expect(spy.calledOnce).to.be.true;
			expect(spy.calledWith(to, from)).to.be.true;
		});
	});

	describe('leave', () => {
		it('should add class to designated element', () => {
			transition.leave({
				target: 'body',
				class: hideClass
			});

			expect($hasClass(document.body, hideClass)).to.be.true;
			document.body.className = '';
		});

		it('should execute leave callback', () => {
			let to = {};
			let from = {};
			let spy = sinon.spy();

			transition.leave({
				leave: spy
			}, to, from);

			expect(spy.calledOnce).to.be.true;
			expect(spy.calledWith(to, from)).to.be.true;
		});
	});
});