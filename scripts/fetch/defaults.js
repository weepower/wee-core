import { $copy, $isArrayBuffer, $isArrayBufferView, $isBlob, $isFile, $isFormData, $isObject, $isString } from '../core/types';
import { normalizeHeader } from 'fetch/headers';

const DEFAULT_CONTENT_TYPE = {
	'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
};

function setContentTypeIfUnset(headers, value) {
	if ($isObject(headers) && ! headers['Content-Type']) {
		headers['Content-Type'] = value;
	}
}

let defaults = {
	args: [],
	baseUrl: '',
	data: null,
	disableCache: false,
	headers: {
		common: {
			'Accept': 'application/json, text/plain, */*'
		}
	},
	jsonpElement: false,
	method: 'get',
	processData: true,
	params: {},
	responseType: 'json',
	scope: null,

	/**
	 * Default logic for transforming request body
	 *
	 * @param {Object|string|null} data
	 * @param {Object} headers
	 * @returns {*}
	 */
	transformRequest: function transformRequest(data, headers) {
		normalizeHeader(headers, 'Content-Type');

		if ($isFormData(data) ||
			$isArrayBuffer(data) ||
			$isFile(data) ||
			$isBlob(data)
		) {
			return data;
		}

		if ($isArrayBufferView(data)) {
			return data.buffer;
		}

		if ($isObject(data)) {
			setContentTypeIfUnset(headers, 'application/json;charset=utf-8');

			return JSON.stringify(data);
		}

		return data;
	},

	/**
	 * Default logic for transforming response data
	 *
	 * @param {string|ArrayBuffer|Blob} data
	 * @returns {*}
	 */
	transformResponse: function transformResponse(data) {
		// Ensure that JSON is parsed appropriately
		if ($isString(data)) {
			try {
				data = JSON.parse(data);
			} catch (e) { /* Ignore */ }
		}

		return data;
	},
	timeout: 0,

	/**
	 * Default status code to look for
	 *
	 * @param {Object} response
	 * @returns {boolean}
	 */
	validateStatus(response) {
		return response.status >= 200 && response.status < 400;
	}
};

// Add headers for various methods
['delete', 'get', 'head'].forEach(method => {
	defaults.headers[method] = {};
});

['post', 'put', 'patch'].forEach(method => {
	defaults.headers[method] = $copy(DEFAULT_CONTENT_TYPE);
});

export default defaults;