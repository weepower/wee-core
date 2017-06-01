import fetchFactory from 'fetch/factory';
import bind from 'fetch/bind';
import { extend } from 'fetch/utils';

/**
 * Create a new instance of fetch
 *
 * @param defaultConfig
 * @returns {wrap}
 */
function createFetchInstance(defaultConfig) {
	const context = fetchFactory(defaultConfig);
	const instance = bind(context.request, context);

	// Copy properties from context
	extend(instance, context, context);

	return instance;
}

// Instantiate main fetch instance
const $fetch = createFetchInstance();

/**
 * Create a new instance
 *
 * @returns {wrap}
 */
$fetch.create = function create() {
	return createFetchInstance();
}

export default $fetch;