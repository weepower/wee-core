let utils = module.exports = {};

utils.trimRight = function(str) {
  return str.replace(/\s+$/, '');
};

utils.stripStars = function (line) {
  let re = /^(?:\s*[\*]{1,2}\s)/;
  return utils.trimRight(line.replace(re, ''));
};
