/**
 * Process queue with async capability
 *
 * @param {Array} queue - Items to be processed (usually functions)
 * @param {Function} iterator - Process each item in queue
 * @param {Function} callback - Exit runQueue and initiate rest of sequence that called runQueue
 */
export default function runQueue(queue, iterator, callback) {
	const queueCount = queue.length;
	const step = function step(index) {
		if (index >= queueCount) {
			callback();
		} else {
			iterator(queue[index], next => {
				if (next === false) {
					callback(true);
				} else {
					step(index + 1);
				}
			});
		}
	}

	// Initiate recursive function call
	step(0);
}