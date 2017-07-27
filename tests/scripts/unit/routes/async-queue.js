import sinon from 'sinon';
import runQueue from 'routes/async-queue';

describe('Routes: Async Queue', () => {
	describe('runQueue', () => {
		it('should account for queue items being removed during processing', () => {
			let stub1 = sinon.stub();
			let iterator = function(hook, next) {
				hook(() => {
					next();
				});
			}

			stub1.callsArg(0);

			let queue = [
				stub1,
				function(next) {
					// Do something asynchronous that allows for
					// changing the queue before it completes
					setTimeout(next, 250);
				},
				stub1
			];

			let promise = runQueue(queue, iterator).then(() => {
				expect(stub1.callCount).to.equal(1);
			});

			// Remove item from queue after initializing queue process
			queue.pop();

			return promise;
		});
	});
});