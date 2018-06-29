import { $each, $setRef, $sel } from 'core/dom';
import { $extend, $isObject, $isString, $toArray } from 'core/types';
import { $exec } from 'core/core';
import { _doc } from 'core/variables';
import events from 'events/events';

let custom = {};
let bound = [];

function _bind(els, obj, options) {
    // Redefine variables when delegating
    if (options && options.delegate) {
        options.targ = els;
        els = options.delegate;
    }

    // For each element attach events
    $each(els, (el) => {
        // Loop through object events
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const evts = key.split(' ');
                let	i = 0;

                for (; i < evts.length; i++) {
                    const conf = $extend({
                        args: [],
                        once: false,
                        scope: el,
                    }, options);
                    const fn = obj[key];
                    const f = fn;
                    let	evt = evts[i];
                    let	ev = evt;
                    const parts = ev.split('.');
                    evt = parts[0];

                    if (parts.length == 1 && conf.namespace) {
                        ev += `.${conf.namespace}`;
                    }

                    // Prepend element to callback arguments if necessary
                    if (conf.args[1] !== el) {
                        conf.args.unshift(0, el);
                    }

                    (function (el, evt, fn, f, conf) {
                        const cb = (e) => {
                            let cont = true;
                            conf.args[0] = e;

                            // If watch within ancestor make sure the target
                            // matches the selector
                            if (conf.targ) {
                                let targ = conf.targ;
                                const sel = targ._$ ? targ.sel : targ;

                                // Update refs when targeting ref
                                if ($isString(sel) &&
                                    sel.indexOf('ref:') > -1) {
                                    $setRef(el);
                                }

                                cont = $toArray($sel(sel)).some(el => el.contains(e.target) && (targ = el));

                                // Ensure element argument is the target
                                conf.args[1] = conf.scope = targ;
                            }

                            if (cont) {
                                $exec(fn, conf);

                                // Unbind after first execution
                                if (conf.once) {
                                    _off(el, evt, f);
                                }
                            }
                        };

                        // Ensure the specified element, event, and function
                        // combination hasn't already been bound
                        if (evt != 'init' && ! _bound(el, ev, f, conf.targ).length) {
                            // Determine if the event is native or custom
                            if (`on${evt}` in el || events.indexOf(evt) > -1) {
                                el.addEventListener(evt, cb, false);
                            } else if (custom[evt]) {
                                custom[evt][0](el, fn, conf);
                            }

                            bound.push({
                                el,
                                ev,
                                evt,
                                cb,
                                fn: f,
                                targ: conf.targ,
                            });
                        }

                        if (evt == 'init' || conf.init === true) {
                            cb();
                        }
                    }(el, evt, fn, f, conf));
                }
            }
        }
    }, options);
}

/**
 * Detach event(s) from element
 *
 * @private
 * @param {(HTMLElement|string)} [sel]
 * @param {string} [evt]
 * @param {Function} [fn]
 */
function _off(sel, evt, fn) {
    $each(_bound(sel, evt, fn), (e) => {
        if (`on${e.evt}` in _doc) {
            e.el.removeEventListener(e.evt, e.cb);
        } else if (custom[e.evt]) {
            custom[e.evt][1](e.el, e.cb);
        }

        bound.splice(bound.indexOf(e), 1);
    });
}

function _bound(target, event = '', fn = null, delegateTarg = undefined) {
    const segs = event.split('.');
    const	matches = [];
    target = target || [0];

    $each(target, (el) => {
        Object.keys(bound).forEach((e) => {
            const binding = bound[e];
            const newSel = $isObject(delegateTarg) ? delegateTarg.sel : delegateTarg;
            const oldSel = $isObject(binding.targ) ? binding.targ.sel : binding.targ;
            const parts = binding.ev.split('.');
            let match = true;

            if (el && el !== binding.el) {
                match = false;
            }

            if (event && (segs[0] !== '' && segs[0] != parts[0]) || (segs[1] && segs[1] != parts[1])) {
                match = false;
            }

            if (fn && String(fn) !== String(binding.fn)) {
                match = false;
            }

            // If delegated event, check against target element
            if (newSel !== oldSel) {
                match = false;
            }

            if (match) {
                matches.push(binding);
            }
        });
    });

    return matches;
}

const eventsModule = {
    /**
     * Bind event function to element
     *
     * @param {(HTMLElement|object|string)} target
     * @param {(Object|string)} a - event name or object of events
     * @param {(Function|object)} [b] - event callback or options object
     * @param {(Object|string)} [c] - event options
     * @param {Array} [c.args] - callback arguments
     * @param {(HTMLElement|string)} [c.context=document]
     * @param {(HTMLElement|string)} [c.delegate]
     * @param {boolean} [c.once=false] - remove event after first execution
     * @param {Oject} [c.scope]
     */
    on(target, a, b, c) {
        let evts = [];

        if ($isObject(target) && ! target._$) {
            const keys = Object.keys(target);
            let	i = 0;

            for (; i < keys.length; i++) {
                const key = keys[i];
                evts = target[key];

                _bind(key, evts, a);
            }
        } else {
            if ($isString(a)) {
                evts[a] = b;
            } else {
                evts = a;
                c = b;
            }

            _bind(target, evts, c);
        }
    },

    /**
     * Remove specified event from specified element
     *
     * @param {(HTMLElement|string)} [target]
     * @param {(Object|string)} a - event name or object of events
     * @param {Function} [b] - specific function to remove
     */
    off(target, a, b) {
        let obj = a;

        if (! target && ! a) {
            bound = [];
            custom = {};
            return;
        }

        if (a) {
            if ($isString(a)) {
                obj = [];
                obj[a] = b;
            }

            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    const evts = key.split(' ');
                    let	i = 0;

                    for (; i < evts.length; i++) {
                        const evt = evts[i];
                        const fn = obj[evt];

                        _off(target, evt, fn);
                    }
                }
            }
        } else {
            _off(target);
        }
    },

    /**
     * Get currently bound events to optional specified element and event|function
     *
     * @param {(boolean|HTMLElement|string)} [target]
     * @param {string} [event] - event name to match
     * @param {Function} [fn] - specific function to match
     * @param {HTMLElement} [delegateTarg] - targets of delegated event
     * @returns {Array} matches
     */
    bound(target, event, fn, delegateTarg) {
        return _bound(target, event, fn, delegateTarg);
    },

    /**
     * Execute bound event for each matching selection
     *
     * @param {(HTMLElement|string)} target
     * @param {string} name
     */
    trigger(target, name) {
        const fn = function () {};

        _bound(target, name).forEach((e) => {
            e.cb({
                target: e.el,
                preventDefault: fn,
                stopPropagation: fn,
            });
        });
    },

    /**
     * Add a custom event
     *
     * @param {string} name
     * @param {Function} on
     * @param {Function} off
     */
    addEvent(name, on, off) {
        custom[name] = [on, off];
    },
};

/**
 * Unbind namespaced events
 *
 * @param {string} namespace
 */
export function unbindEvents(namespace) {
    eventsModule.off(false, `.${namespace}`);
}

export default eventsModule;
