// const extract = require('extract-comments');
// const utils = require('../utils');

/**
 * Takes a string and parses out code comments, params, and returns
 * @param str
 * @returns array
 */

function parser (str) {
	const START = /^\/\*\*?/,
		CONTENT = /(^[^@]+)?(@.*)/,
		END = /^\*\//;

	let lines = str.split(/[\r\n]/),
		linesLength = lines.length,
		i = 0,
		isComment = false,
		afterCount,
		o = {},
		b,
		comments = {},
		commentsArray = [];

	while (i < linesLength) {
		let line = lines[i++].trim();

		if (! isComment && START.test(line)) {
			o = {
				begin: null,
				end: null,
				code: '',
				content: '',
				params: [],
				return: []
			};
			afterCount = 0;
			isComment = true;
			o.begin = b = i; // TODO: set this to i
		}

		if (isComment && END.test(line)) {
			let contentBreakdown = o.content.match(CONTENT);
			o.end = i;

			if (contentBreakdown !== null) {
				let lines = contentBreakdown[2].trim().split('@');
				o.description = contentBreakdown[1].trim();

				lines.shift();

				lines.forEach(param => {
					const PARSE_PARAM = /(?:^(param|return)\s+)(?:\{([^\}]+)\}\s*)?(?:\[([\S]+)\]\s*|([\S]+)\s*)?(?:- +([\S ]+))?/g;
					let name = '';
					let required = true;
					let match = PARSE_PARAM.exec(param);

					if (! match) {
						return;
					}

					let type = match[1];

					if (match[3]) {
						name = match[3];
						required = false;
					} else if (match[4]) {
						name = match[4];
					}

					let result = {
						type: match[2],
						name: name,
						required: required,
						description: (match[5] || '').replace(/^\s*-\s*/, '')
					};

					if (type === 'return') {
						o.return = result;
					} else {
						o.params.push(result);
					}
				});
			}

			comments[b] = o; // TODO: convert array and push items in
			isComment = false;
		}

		if (isComment && i > o.begin) {
			if (isMiddle(line)) {
				let stripped = stripStars(line);

				if (stripped.length) {
					o.content += stripped;
				}
			}
		}

		if (! isComment && o.end && i > o.end && afterCount < 2) {
			if (!isWhitespace(line)) {
				o.codeStart = i;
			}
			o.code += line + '\n';
			afterCount++;
			}

			if (b && o.code !== '') {
				o.code = o.code.trim();
			}
		}

	for (item in comments) {
		commentsArray.push(comments[item]);
	}

	return commentsArray;
}

/**
 * Strips out starts
 *
 * @param str
 * @returns {string}
 */

function stripStars(str) {
  str = str.replace(/^\s*/, '');
  if (str.charAt(0) === '/') {
    str = str.slice(1);
  }
  if (str.charAt(0) === '*') {
    str = str.slice(1);
  }
  if (str.charAt(0) === ' ') {
    str = str.slice(1);
  }
  return str;
}

/**
 * Detect if the given line is in the middle
 * of a comment.
 */

function isMiddle(str) {
  return typeof str === 'string'
   && str.charAt(0) === '*'
   && str.charAt(1) !== '/';
}

/**
 *
 */
let cache;

function isWhitespace(str) {
  return (typeof str === 'string') && regex().test(str);
}

function regex() {
  // ensure that runtime compilation only happens once
  return cache || (cache = new RegExp('^[\\s\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF"]+$'));
}

module.exports = parser;