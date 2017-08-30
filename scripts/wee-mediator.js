import Topic from 'mediator/topic';

export class Mediator {
	constructor() {
		this.topic = new Topic('');
	}

	/**
	 * Retrieve topic
	 *
	 * @param {string} name
	 * @returns {Topic}
	 */
	getTopic(name) {
		let namespace = name.split('.');
		let topic = this.topic;

		if (name === '') {
			return this.topic;
		}

		if (namespace.length > 0) {
			const namespaceLength = namespace.length;

			for (let i = 0; i < namespaceLength; i++) {
				if (! topic.topics.hasOwnProperty(namespace[i])) {
					topic.addTopic(namespace[i]);
				}

				topic = topic.getTopic(namespace[i]);
			}
		}

		return topic;
	}

	/**
	 * Subscribe to topic
	 *
	 * @param {string} topicName
	 * @param {Function} fn
	 */
	on(topicName, fn) {
		const topic = this.getTopic(topicName);

		return topic.addSubscriber(fn);
	}

	/**
	 * Publish to topic
	 *
	 * @param {string} topicName
	 * @param {Array} args
	 */
	emit(topicName, ...args) {
		const topic = this.getTopic(topicName);

		topic.publish(args);
	}

	/**
	 * Remove subscriber by id or all subscribers from topic
	 *
	 * @param  {string} topicName
	 * @param  {string} identifier
	 */
	remove(topicName, identifier) {
		this.getTopic(topicName).removeSubscriber(identifier);
	}
}

export default new Mediator();