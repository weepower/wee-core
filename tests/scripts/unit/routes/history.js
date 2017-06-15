import sinon from 'sinon';
import $router from 'wee-routes';
import { history } from 'wee-routes';
import { setPath } from '../../helpers/browsers';

describe('Router: history', () => {
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
});