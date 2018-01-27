import { $each } from 'core/dom';
import { _doc } from 'core/variables';
import { _slice } from 'core/types';
import { $addClass, $removeClass } from 'dom/index';
import { warn } from 'core/warn';

/**
 * Detect what transition property to listen for
 *
 * @returns {*}
 * @private
 */
function _whichTransitionEvent() {
    const el = document.createElement('meta');
    const animations = {
        transition: 'transitionend',
        OTransition: 'oTransitionEnd',
        MozTransition: 'transitionend',
        WebkitTransition: 'webkitTransitionEnd',
    };

    for (const t in animations) {
        if (el.style[t] !== undefined) {
            return animations[t];
        }
    }
}

const transitionEvent = _whichTransitionEvent();
const supportsTransitionEvent = !!transitionEvent;

export default class Transition {
    constructor(config) {
        this.transitionEvent = transitionEvent;
        this.target = config.target || null;
        this.class = config.class || null;
        this.enterCallback = config.enter || null;
        this.leaveCallback = config.leave || null;
        this.timeout = typeof config.timeout === 'number' ? config.timeout : null;
        this.countEvents = null;
        this.completed = 0;
    }

    /**
     * Select DOM element(s)
     *
     * @param {string} target
     * @returns {*}
     * @private
     */
    _select(target) {
        return _slice.call(_doc.querySelectorAll(target));
    }

    /**
     * Remove class from target/execute enterCallback
     *
     * @param {Object} to
     * @param {Object} from
     */
    enter(to, from) {
        if (this.class && this.target) {
            const elements = this._select(this.target);

            if (! elements.length) {
                warn('routes', 'no elements found - cannot apply enter transition');
            }

            elements.forEach((el) => {
                if (supportsTransitionEvent) {
                    el.removeEventListener(this.transitionEvent, this.countEvents);
                }

                $removeClass(el, this.class);
            });
        }

        if (this.enterCallback) {
            this.enterCallback(to, from);
        }
    }

    /**
     * Apply class to target/execute leaveCallback
     *
     * @param {Object} to
     * @param {Object} from
     * @returns {Promise}
     */
    leave(to, from) {
        const scope = this;

        return new Promise((resolve, reject) => {
            if (this.class && this.target) {
                const elements = this._select(this.target);

                if (! elements.length) {
                    warn('routes', 'no elements found - cannot apply leave transition');
                    return resolve(scope);
                }

                this.countEvents = function countEvents() {
                    scope.completed += 1;

                    if (elements.length === scope.completed) {
                        resolve(scope);
                    }
                };

                // Add class to targets
                $each(elements, (el) => {
                    if (supportsTransitionEvent) {
                        el.addEventListener(this.transitionEvent, this.countEvents);
                    }

                    $addClass(el, this.class);
                });

                if (! supportsTransitionEvent) {
                    resolve(scope);
                }
            } else if (this.leaveCallback) {
                this.leaveCallback(to, from, (error) => {
                    if (error instanceof Error) {
                        return reject(error);
                    }

                    resolve(scope);
                });
            }

            if (this.timeout !== null) {
                setTimeout(() => {
                    resolve(scope);
                }, this.timeout);
            }
        });
    }
}
