/**
 * Module dependencies
 */

const _ = require('lodash');
const arrayify = require('arrayify-compact');
const extract = require('extract-comments');
const utils = require('./lib/utils');

function parser (str, opts) {
  return parser.codeContext(str, opts);
}

parser.nolinks = [];
parser.links = {};

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
      _.merge(o, parser.parseDescription(o));
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

  // Extract leads from comments
  let parsedDesc = parser.parseLead(comment.description);
  comment.description = parsedDesc.desc;
  return comment;
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
    _.merge(comment, parser.normalizeDesc(comment));
  }

  // @example tags, strip trailing whitespace
  if (comment.example) {
    comment.example = utils.trimRight(comment.example);
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
 * Parse the subproperties from parameters.
 *
 * @param  {String} `param`
 * @return {Object}
 */

parser.parseSubprop = function (match, params) {
  let subprop = match[2];
  if (/\./.test(subprop)) {
    let parts = subprop.split('.');
    let def = parts[1].split('=');
    params.name = def[0];
    params['default'] = def[1] || null;
    subprop = parts[0];
  }
  params.parent = subprop;
  return params;
};

/**
 * Parse the parameters from a string.
 *
 * @param  {String} `param`
 * @return {Object}
 */

parser.mergeSubprops = function (c, subprop) {
  if (c.hasOwnProperty(subprop) && typeof c[subprop] === 'object') {
    let o = {};

    c[subprop].forEach(function (child) {
      o[child.parent] = o[child.parent] || [];
      o[child.parent].push(child);
      delete child.parent;
    });

    if (c.hasOwnProperty('params')) {
      c.params = c.params.map(function (param) {
        if (o[param.name]) {
          param[subprop] = o[param.name];
        }
        return param;
      });
    }
  }
  return c;
};

/**
 * Parse `@return` comments.
 *
 * @param  {String} `str`
 * @return {Object}
 */

parser.parseReturns = function (str) {
  let match = /^\{([^\}]+)\}/.exec(str);
  return match && match[1];
};

/**
 * Parse the "lead" from a description.
 *
 * @param  {String} `str`
 * @return {Object}
 */

parser.parseLead = function (str) {
  let re = /^([\s\S]+?)(?:\n\n)/;

  let lead = '';
  let description = str.replace(re, function (match, a) {
    lead += a.split('\n').join(' ');
    return match.replace(a, '');
  });

  return {
    desc: description,
    lead: lead
  };
};

/**
 * Parse links.
 *
 * @param  {String} `str`
 * @return {Object}
 */

parser.parseLink = function (str) {
  let re = /^!?\[((?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*)\]\(\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*\)/;
  let match = str.match(re);
  if (match) {
    return {
      text: match[1],
      url: match[2],
      alt: match[3]
    };
  }
};

/**
 * Parse nolinks.
 *
 * @param  {String} `str`
 * @return {Object}
 */

parser.parseNolink = function (str) {
  let nolink = /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/;
  let ref = /^!?\[((?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*)\]\s*\[([^\]]*)\]/;
  let match;
  if (match = str.match(nolink)) {
    return match[0];
  } else if (match = str.match(ref)) {
    return match[0];
  }
  return null;
};

/**
 * Extract links
 *
 * @param {Object} `c` Comment object.
 * @param {String} `line`
 */

parser.extractLinks = function (c, line) {
  let href = parser.parseLink(line);
  if (href) {
    parser.links[href.text] = href;
  }

  let nolink = parser.parseNolink(line);
  if (nolink) {
    parser.nolinks.push(nolink);
  }
};

/**
 * Parse `@tags`.
 *
 * @param  {Object} `comment` A comment object.
 * @param  {Object} `options`
 * @return {Object}
 */

parser.parseTags = function (comment, options) {
  let opts = options || {};

  // parse @param tags (`singular: plural`)
  let props = _.merge({
    'return': 'returns',
    param   : 'params',
    property: 'properties',
    option  : 'options'
  }, opts.subprops);

  props = _.omit(props, ['api', 'constructor', 'class', 'static', 'type']);

  Object.keys(props).forEach(function (key) {
    let value = props[key];
    if (comment[key]) {

      let arr = comment[key] || [];
      comment[value] = arrayify(arr).map(function (str) {
        return parser.parseParams(str);
      });
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
      parser.extractLinks(c, line);

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
        } else {
          if (c.example) {
            c.example += '\n' + line;
          } else {
            c.example = line;
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
      } else {
        if (c.example) {
          c.example += '\n' + line;
        }
      }
    }
    i++;
    return c;
  }, {});

  let singular = _.keys(opts.subprops);
  let plural = _.values(opts.subprops);

  let diff = _.difference(props, singular).filter(function (prop) {
    return prop !== 'param' &&
      prop !== 'constructor' &&
      prop !== 'return' &&
      prop !== 'static' &&
      prop !== 'class' &&
      prop !== 'type' &&
      prop !== 'api';
  });

  // let pluralized = diff.map(function (name) {
  //   return inflect.pluralize(name);
  // });
  //
  // singular = _.union(diff, singular);
  // plural = _.union([], pluralized, plural);
  //
  let comments = this.parseTags(comment, {
    subprops: _.zipObject(singular, plural)
  });

  // Pass custom subprops (plural/arrays)
  plural.forEach(function (prop) {
    this.mergeSubprops(comments, prop);
  }.bind(this));

  return comments;
};

/**
 * Expose `parser`
 */

module.exports = parser;
