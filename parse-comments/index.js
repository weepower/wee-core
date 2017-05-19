const extract = require('extract-comments');
const utils = require('./lib/utils');

function parser (str, opts) {
  return parser.codeContext(str, opts);
}

/**
 * Extract code comments, and merge in code context.
 *
 * @param  {String} `str`
 * @return {Array} Array of comment objects.
 */

parser.codeContext = function (str, opts) {
  let comments = extract(str);
  let res = [];

  for (let key in comments) {
    if (comments.hasOwnProperty(key)) {
      let comment = comments[key];
      let o = parser.parseComment(comment.content, opts);
      o.comment = comment;
      Object.assign(o, parser.parseDescription(o));
      res.push(o);
    }
  }
  return res;
};

/**
 * Normalize descriptions.
 *
 * @param  {Object} `comment`
 * @return {Object}
 */

parser.normalizeDesc = function (comment) {
  // strip trailing whitespace from description
  comment.description = utils.trimRight(comment.description);
};

/**
 * Parse code examples from a `comment.description`.
 *
 * @param  {Object} `comment`
 * @return {Object}
 */

parser.parseDescription = function (comment) {
  // strip trailing whitespace from description
  if (comment.description) {
    Object.assign(comment, parser.normalizeDesc(comment));
  }
  return comment;
};

/**
 * Parse the parameters from a string.
 *
 * @param  {String} `param`
 * @return {Object}
 */

parser.parseParams = function (param) {
  let re = /(?:^\{([^\}]+)\}\s+)?(?:\[([\S]+)\]\s*|([\S]+)\s*)?(?:- +([\S ]+))?/,
      name = '',
      required = true;
  if (typeof param !== 'string') return {};
  let match = param.match(re);

  if (match[2]) {
    name = match[2];
    required = false;
  } else if (match[3]) {
    name = match[3];
  }

  let params = {
    type: match[1],
    name: name,
    required: required,
    description: (match[4] || '').replace(/^\s*-\s*/, '')
  };
  return params;
};

/**
 * Parse `@return` comments.
 *
 * @param  {String} `str`
 * @return {Object}
 */

/**
 * Parse `@tags`.
 *
 * @param  {Object} `comment` A comment object.
 * @param  {Object} `options`
 * @return {Object}
 */

parser.parseTags = function (comment, opts = {}) {

  // parse @param tags (`singular: plural`)
  let props = Object.assign({
    param: 'params',
    property: 'properties',
    option: 'options',
    return: 'return'
  }, opts.subprops);

  Object.keys(props).forEach(function (key) {
    let value = props[key];

    if (comment[key]) {
      const arr = comment[key] || [];
      const count = arr.length;
      let result = [];

      for (let i = 0; i < count; i++) {
        const item = arr[i];

        if (Array.isArray(item)) {
          result.concat(item);
        } else if (item) {
          result.push(item);
        }
      }

      comment[value] = result.map(str => parser.parseParams(str));
    }
  });
  return comment;
};

/**
 * Parse comments from the given `content` string with the
 * specified `options.`
 *
 * @param  {String} `content`
 * @param  {Object} `options`
 * @return {Object}
 */

parser.parseComment = function (content, options) {
  let opts = options || {};
  let afterNewLine = false;
  let afterTags = false;
  let props = [];
  let lastTag;
  let i = 0;

  let lines = content.split('\n');
  let comment = lines.reduce(function (c, str) {
    // strip leading asterisks
    let line = utils.stripStars(str);
    if (/\s*@/.test(line)) {
      line = line.replace(/^\s+/, '');
    }

    if (line) {

      let match = line.match(/^(\s*@[\S]+)\s*(.*)/);
      if (match) {
        afterTags = true;
        let tagname = match[1].replace(/@/, '');
        props.push(tagname);

        let tagvalue = match[2].replace(/^\s+/, '');
        lastTag = tagname;
        if (c.hasOwnProperty(tagname)) {
          // tag already exists
          if (!Array.isArray(c[tagname])) {
            c[tagname] = [c[tagname]];
          }

          c[tagname].push(tagvalue);
        } else {
          // new tag
          c[tagname] = tagvalue || true;
        }
      } else if (lastTag && !afterNewLine) {
        let val = line.replace(/^\s+/, '');
        if (Array.isArray(c[lastTag])) {
          c[lastTag][c[lastTag].length - 1] += ' ' + val;
        } else {
          c[lastTag] += ' ' + val;
        }
      } else {
        lastTag = null;
        if (!afterTags) {
          if (c.description) {
            c.description += '\n' + line;
          } else {
            c.description = line;
          }
        }
      }
      afterNewLine = false;
    } else {
      afterNewLine = true;
      if (!afterTags) {
        if (c.description) {
          c.description += '\n' + line;
        }
      }
    }
    i++;
    return c;
  }, {});

  let comments = this.parseTags(comment);

  return comments;
};

module.exports = parser;