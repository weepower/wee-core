import Subscriber from 'mediator/subscriber';

describe('Mediator: Subscriber', () => {
	it('should create a new subscriber', () => {
		const fn = () => {};
		const subscriber = new Subscriber(fn);

		expect(subscriber.id).to.exist;
		expect(subscriber.fn).to.equal(fn);
		expect(subscriber.topic).to.be.null;
	});
});