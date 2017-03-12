import { ready } from 'core/dom';

describe('Core: DOM', () => {
	describe('ready', () => {
		it('should execute callback when document has finished loading', done => {
			let state = false;

			ready(() => {
				state = true;
				expect(state).to.be.true;
				done();
			});
		});
	});
});