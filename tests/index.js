// require all `**/*.js`
const testsContext = require.context('./', true, /\.js$/);

testsContext.keys().forEach(testsContext);

// require all `../lib/**`
const libContext = require.context('../lib', true);

libContext.keys().forEach(libContext);