(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["core"] = factory();
	else
		root["Wee"] = root["Wee"] || {}, root["Wee"]["core"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/**
 * Determine if value is a function
 *
 * @param {*} obj
 * @returns {boolean}
 */
const $isFunction = obj => {
	return $type(obj) == 'function';
};
/* harmony export (immutable) */ __webpack_exports__["$isFunction"] = $isFunction;


/**
 * Cast value to array if it isn't one
 *
 * @param {*} val
 * @returns {Array} value
 */
const $toArray = val => {
	return val !== undefined ? (Array.isArray(val) ? val : [val]) : [];
};
/* harmony export (immutable) */ __webpack_exports__["$toArray"] = $toArray;


/**
 * Determine the JavaScript type of an object
 *
 * @param {*} obj
 * @returns string
 */
const $type = obj => {
	return obj === undefined ? 'undefined' :
		Object.prototype.toString.call(obj)
			.replace(/^\[object (.+)]$/, '$1')
			.toLowerCase();
};
/* harmony export (immutable) */ __webpack_exports__["$type"] = $type;


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_core_types__ = __webpack_require__(0);


const isBrowser = typeof window === 'object';
/* harmony export (immutable) */ __webpack_exports__["isBrowser"] = isBrowser;


/**
 * Extend object storage with object or key -> val
 *
 * @protected
 * @param {object} obj
 * @param {(object|string)} a
 * @param {*} [b]
 */
const _extend = (obj, a, b) => {
	let val = a;

	if (typeof a == 'string') {
		val = [];
		val[a] = b;
	}

	_extend(obj, val);
};

/**
 * Get value from function or directly
 *
 * @private
 * @param {*} val
 * @param {object} [options]
 * @returns {*}
 */
const _val = (val, options) => {
	return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0_core_types__["$isFunction"])(val) ?
		$exec(val, options) :
		val;
};

/**
 * Execute specified function or array of functions
 *
 * @param {array|function} fn
 * @param {object} [options]
 * @param {array} [options.args]
 * @param {object} [options.scope]
 * @returns {*} [response]
 */
const $exec = (fn, options = {}) => {
	let fns = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0_core_types__["$toArray"])(fn),
		len = fns.length,
		i = 0,
		response;

	for (; i < len; i++) {
		let conf = _extend({
				args: []
			}, options);

		response = fns[i].apply(
			conf.scope,
			__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0_core_types__["$toArray"])(conf.args)
		);

		if (len === 1) {
			return response;
		}
	}
};
/* harmony export (immutable) */ __webpack_exports__["$exec"] = $exec;


/**
 * Get current environment or set current environment against
 * specified object
 *
 * @param {object} [rules]
 * @param {string} [fallback=local]
 * @returns {string} environment
 */
const $env = (rules, fallback = 'local') => {
	let env = fallback;

	if (rules) {
		let host = location.hostname;

		for (let rule in rules) {
			let val = rules[rule];

			if (val == host || _val(val, {
					args: host
				}) === true) {
				env = rule;
				break;
			}
		}
	}

	return env;
};
/* harmony export (immutable) */ __webpack_exports__["$env"] = $env;


/***/ })
/******/ ]);
});