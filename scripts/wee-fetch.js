import fetchFactory from './fetch/factory';
import bind from './fetch/bind';
import defaults from './fetch/defaults';
import { extend } from './fetch/utils';
import { $extend } from './core/types';

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
const $fetch = createFetchInstance(defaults);

/**
 * Create a new instance
 *
 * @returns {wrap}
 */
$fetch.create = function create(instanceDefaults) {
    return createFetchInstance($extend({}, defaults, instanceDefaults));
};

export default $fetch;
