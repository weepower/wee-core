import sinon from 'sinon';
import Topic from 'mediator/topic';
import Subscriber from 'mediator/subscriber';

describe('Mediator: Topic', () => {
    it('should generate a new topic', () => {
        const topic = new Topic('channel');

        expect(topic.namespace).to.equal('channel');
        expect(topic).to.be.instanceOf(Topic);
        expect(topic.subscribers).to.be.an('array')
        expect(topic.topics).to.be.an('object');
        expect(topic.parent).to.be.null;
        expect(topic.stopped).to.be.false;
    });

    it('should be able to add subscribers', () => {
        const fn = () => {};
        const topic = new Topic();

        topic.addSubscriber(fn);

        expect(topic.subscribers.length).to.equal(1);
        expect(topic.subscribers[0].fn).to.equal(fn);
    });

    it('should be able to publish to subscribers', () => {
        const fn = sinon.spy();
        const data = ['test']; // Must be array
        const topic = new Topic();

        topic.addSubscriber(fn);
        topic.publish(data);

        expect(fn.calledOnce).to.be.true;
        expect(fn.args[0]).to.deep.equal(data);
    });

    it('should register child topics', () => {
        const topic = new Topic('parent');

        topic.addTopic('child');

        expect(topic.topics['child']).to.be.instanceOf(Topic);
        expect(topic.topics['child'].namespace).to.equal('parent.child');
    });

    it('should retrieve child topics', () => {
        const topic = new Topic('parent');

        topic.addTopic('child');
        const childTopic = topic.getTopic('child');

        expect(childTopic).to.be.instanceOf(Topic);
        expect(childTopic.namespace).to.equal('parent.child');
    });

    describe('removeSubscriber', () => {
        let topic;
        let fn;
        let otherFn;
        let addedSubscriber;

        beforeEach(() => {
            fn = () => {};
            otherFn = () => {};

            topic = new Topic();

            // Add multiple subscribers to test proper identification of
            // subscriber to be removed
            topic.addSubscriber(fn);
            addedSubscriber = topic.addSubscriber(otherFn);
        });

        it('should remove all subscribers if no argument provided', () => {
            expect(topic.subscribers.length).to.equal(2);

            topic.removeSubscriber();

            expect(topic.subscribers.length).to.equal(0);
        });

        it('should remove subscriber by passing function as identifier', () => {
            expect(topic.subscribers.length).to.equal(2);

            let subscriber = topic.removeSubscriber(fn);

            expect(topic.subscribers.length).to.equal(1);
            expect(subscriber).to.be.instanceOf(Subscriber);
            expect(subscriber.fn).to.equal(fn);
        });

        it('should remove subscriber by passing guid as identifier', () => {
            expect(topic.subscribers.length).to.equal(2);

            let subscriber = topic.removeSubscriber(addedSubscriber.id);

            expect(topic.subscribers.length).to.equal(1);
            expect(subscriber).to.be.instanceOf(Subscriber);
            expect(subscriber.fn).to.equal(otherFn);
        });
    });

    describe('getSubscriber', () => {
        let topic;
        let fn;
        let otherFn;
        let subscriber1;
        let subscriber2;

        beforeEach(() => {
            fn = () => {};
            otherFn = () => {};

            topic = new Topic();

            // Add multiple subscribers to test proper identification of
            // subscriber to be removed
            subscriber1 = topic.addSubscriber(fn);
            subscriber2 = topic.addSubscriber(otherFn);
        });

        it('should get subscriber by passing function as identifier', () => {
            let subscriber = topic.getSubscriber(fn);

            expect(subscriber).to.equal(subscriber1);
            expect(subscriber.fn).to.equal(fn);
        });

        it('should get subscriber by passing guid as identifier', () => {
            let subscriber = topic.getSubscriber(subscriber2.id);

            expect(subscriber).to.equal(subscriber2);
            expect(subscriber.fn).to.equal(otherFn);
        });
    });
});
