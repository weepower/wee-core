/**
 * Takes a string and parses out code comments, params, and returns
 * @param str
 * @returns array
 */

function parser (str) {
	const START = /^\/\*\*?/;
	const END = /^\*\//;
	const CONTENT = /(^[^@]+)?(@.*)/;
	const PARSE_PARAM = /(?:^(param|return)\s+)(?:\{([^\}]+)\}\s*)?(?:\[([\S]+)\]\s*|([\S]+)\s*)?(?:- +([\S ]+))?/g;

	let lines = str.split(/[\r\n]/);
	let linesLength = lines.length;
	let i = 0;
	let isComment = false;
	let afterCount;
	let comment = {};
	let comments = [];

	while (i < linesLength) {
		let line = lines[i++].trim();

		if (! isComment && START.test(line)) {
			comment = {
				begin: null,
				end: null,
				code: '',
				content: '',
				params: [],
				return: []
			};
			afterCount = 0;
			isComment = true;
			comment.begin = i;
		}

		if (isComment && END.test(line)) {
			let contentBreakdown = comment.content.match(CONTENT);
			comment.end = i;

			if (contentBreakdown !== null) {
				let lines = contentBreakdown[2].trim().split('@');

				comment.description = contentBreakdown[1].trim();

				lines.shift();

				lines.forEach(param => {
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
						comment.return = result;
					} else {
						comment.params.push(result);
					}
				});
			}

			comments.push(comment);
			isComment = false;
		}

		if (isComment && i > comment.begin) {
			if (isMiddle(line)) {
				let stripped = stripStars(line);

				if (stripped.length) {
					comment.content += stripped;
				}
			}
		}

		if (! isComment && comment.end && i > comment.end && afterCount < 2) {
			if (!isWhitespace(line)) {
				comment.codeStart = i;
			}
			comment.code += line + '\n';
			afterCount++;
			}

			if (comment.begin && comment.code !== '') {
				comment.code = comment.code.trim();
			}
		}

	return comments;
}

/**
 * Strips out stars
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
 * Checks for whitespace
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