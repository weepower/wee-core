export class QueueError extends Error {
	constructor(message, type = null) {
		super(message);

		this.type = type;
	}
}