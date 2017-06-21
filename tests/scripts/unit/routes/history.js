import sinon from 'sinon';
import $router from 'wee-routes';
import { history } from 'wee-routes';
import { setPath } from '../../helpers/browsers';

describe('Router: history', () => {
	after($router.reset);

	beforeEach(() => {
		$router.reset();
		window.history.replaceState(0, '', '/');
	});

	it('should execute onReady after $router has already been initialized', done => {
		let spy = sinon.spy();

		$router.map([
			{ path: '/' }
		]).run();

		expect(history.ready).to.be.true;

		$router.onReady(spy);

		expect(spy.called).to.be.true;
		done();
	});

	describe('navigate', () => {
		it('should throw SameRouteError when navigating to current URL', () => {
			const resolveSpy = sinon.spy();
			const rejectSpy = sinon.spy();
			const finish = function() {
				expect(resolveSpy.called).to.be.false;
				expect(rejectSpy.called).to.be.true

				const error = rejectSpy.args[0][0];
				// Should return on first rejection
				expect(rejectSpy.args[0].length).to.equal(1);
				expect(error.errorType).to.equal('SameRouteError');
				expect(error.message).to.equal('attempted to navigate to /');
			}

			$router.map([
				{ path: '/' }
			]).run();

			return history.navigate('/').then(resolveSpy, rejectSpy).then(finish, finish);
		});
	});
});