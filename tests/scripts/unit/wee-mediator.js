import sinon from 'sinon';
import $mediator, { Mediator } from 'wee-mediator';

describe('Mediator', () => {
	it('should subscribe an action to a topic', () => {
		const message = 'hello world';
		let spy = sinon.spy();

		$mediator.on('newTopic', spy);
		$mediator.emit('newTopic', message);

		expect(spy.calledOnce).to.be.true;
		expect(spy.args[0][0]).to.equal(message);
	});

	it('should subscribe multiple actions to a single topic', () => {
		const message = 'hello world';
		let firstSpy = sinon.spy();
		let secondSpy = sinon.spy();

		$mediator.on('newTopic', firstSpy);
		$mediator.on('newTopic', secondSpy);
		$mediator.emit('newTopic', message);

		expect(firstSpy.calledOnce).to.be.true;
		expect(firstSpy.args[0][0]).to.equal(message);
		expect(secondSpy.calledOnce).to.be.true;
		expect(secondSpy.args[0][0]).to.equal(message);
	});

	it('should remove subscribers from a topic', () => {
		const message = 'hello world';
		let firstSpy = sinon.spy();
		let secondSpy = sinon.spy();

		$mediator.on('newTopic', firstSpy);
		$mediator.on('newTopic', secondSpy);
		$mediator.emit('newTopic', message);

		expect(firstSpy.calledOnce).to.be.true;
		expect(firstSpy.args[0][0]).to.equal(message);
		expect(secondSpy.calledOnce).to.be.true;
		expect(secondSpy.args[0][0]).to.equal(message);
	});

	describe('getTopic', () => {
		let $mediatorInstance;

		before(() => {
			$mediatorInstance = new Mediator();

			$mediatorInstance.on('grandparent.parent.child', () => {});
		});

		it('should retrieve top level topic', () => {
			$mediatorInstance = new Mediator();

			$mediatorInstance.on('', () => {});
		});

		it('should retrieve topic by name', () => {
			const topic = $mediatorInstance.getTopic('grandparent');

			expect(topic.namespace).to.equal('grandparent');
		});

		it('should retrieve topic by namespace hierarchy', () => {
			const topic = $mediatorInstance.getTopic('grandparent.parent.child');

			expect(topic.namespace).to.equal('grandparent.parent.child');
			expect(topic.parent.namespace).to.equal('grandparent.parent');
			expect(topic.parent.parent.namespace).to.equal('grandparent');
		});
	});
});