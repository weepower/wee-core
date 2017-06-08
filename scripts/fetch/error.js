/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
export function createError(message, config, code, request, response) {
	let error = new Error(message);

	error.config = config;
	error.request = request;
	error.response = response;

	if (code) {
		error.code = code;
	}

	return error;
};