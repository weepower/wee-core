export class QueueError extends Error {
	constructor(message) {
		super(message);

		this.errorType = 'QueueError';
	}
}

export class SameRouteError extends Error {
	constructor(message) {
		super(message);

		this.errorType = 'SameRouteError';
	}
}