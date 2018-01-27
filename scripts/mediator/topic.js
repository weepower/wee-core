import Subscriber from './subscriber';

export default class Topic {
    constructor(namespace = null, parent = null) {
        this.namespace = namespace;
        this.subscribers = [];
        this.topics = {};
        this.parent = parent;
        this.stopped = false;
    }

    /**
     * Add subscriber to topic
     *
     * @param {Function} fn
     * @returns {Subscriber}
     */
    addSubscriber(fn) {
        const subscriber = new Subscriber(fn);

        this.subscribers.push(subscriber);
        subscriber.topic = this;

        return subscriber;
    }

    /**
     * Retrieve registered subscriber from topic
     *
     * @param {Function|string} identifier
     * @returns {*}
     */
    getSubscriber(identifier) {
        const length = this.subscribers.length;

        for (let i = 0; i < length; i++) {
            const subscriber = this.subscribers[i];

            if (subscriber.fn === identifier || subscriber.id === identifier) {
                return subscriber;
            }
        }
    }

    /**
     * Add child topic
     *
     * @param {string} topicName
     */
    addTopic(topicName) {
        this.topics[topicName] = new Topic((this.namespace ? `${this.namespace}.` : '') + topicName, this);
    }

    /**
     * Register child topic
     *
     * @param {string} topicName
     * @returns {Topic}
     */
    getTopic(topicName) {
        return this.topics[topicName];
    }

    /**
     * Remove subscriber from topic
     *
     * @param {Function|string} identifier - function reference or id
     * @returns {*}
     */
    removeSubscriber(identifier) {
        const length = this.subscribers.length;

        if (! identifier) {
            this.subscribers = [];
            return;
        }

        for (let i = 0; i < length; i++) {
            const subscriber = this.subscribers[i];

            if (subscriber.fn === identifier || subscriber.id === identifier) {
                this.subscribers[i].topic = null;
                this.subscribers.splice(i, 1);
                return subscriber;
            }
        }
    }

    /**
     * Execute subscriber callbacks registered to topic
     *
     * @param {Array} data
     */
    publish(data) {
        this.subscribers.forEach(sub => sub.fn.apply(sub.context || {}, data));
    }
}
