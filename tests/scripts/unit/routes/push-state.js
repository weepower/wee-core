import sinon from 'sinon';
import * as key from 'routes/key';
import { pushState } from 'routes/push-state';

describe('Router: push-state', () => {
	it('should set key on window.history state object', done => {
		let stub = sinon.stub(key, 'genTimeKey').returns(1234);

		// Add two entries so that going back to previous route will
		// yield a generated state object
		pushState('/path1');
		pushState('/path2');

		window.addEventListener('popstate', e => {
			expect(e.state.key).to.be.defined;
			expect(e.state.key).to.equal(1234);
			done();
		});

		window.history.back();
		stub.restore();
	});
});