import bind from './bind';
import { $isFunction } from '../core/types';

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
export function extend(a, b, thisArg) {
    Object.keys(b).forEach((key) => {
        const val = b[key];

        if (thisArg && $isFunction(val)) {
            a[key] = bind(val, thisArg);
        } else {
            a[key] = val;
        }
    });

    return a;
}
