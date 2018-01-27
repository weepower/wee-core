/**
 * Process queue with async capability
 *
 * @param {Array} queue - Items to be processed (usually functions)
 * @param {Function} iterator - Process each item in queue
 */
export default function runQueue(queue, iterator) {
    return new Promise((resolve, reject) => {
        const queueCount = queue.length;
        const step = function step(index) {
            if (index >= queueCount) {
                resolve();
            } else if (queue[index]) {
                iterator(queue[index], (error) => {
                    if (error instanceof Error) {
                        reject(error);
                    } else {
                        step(index + 1);
                    }
                });
            } else {
                step(index + 1);
            }
        };

        // Initiate recursive function call
        step(0);
    });
}
