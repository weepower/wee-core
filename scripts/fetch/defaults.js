import { $copy } from '../core/types';

const DEFAULT_CONTENT_TYPE = {
	'Content-Type': 'application/x-www-form-urlencoded'
};

let defaults = {
	args: [],
	baseUrl: '',
	data: {},
	disableCache: false,
	headers: {
		common: {
			'Accept': 'application/json, text/plain, */*'
		}
	},
	method: 'get',
	responseType: 'json',
	transformRequest: function transformRequest() {

	},
	transformResponse: function transformResponse() {

	},
	timeout: 0
};

// Add headers for various methods
['delete', 'get', 'head'].forEach(method => {
	defaults.headers[method] = {};
});

['post', 'put', 'patch'].forEach(method => {
	defaults.headers[method] = $copy(DEFAULT_CONTENT_TYPE);
});

export default defaults;