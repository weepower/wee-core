export default class FetchError extends Error {
	constructor(message, config, request = null, code = null, response = null) {
		super(message);

		this.config = config;
		this.request = request;
		this.response = response;
		this.code = code;
	}
}