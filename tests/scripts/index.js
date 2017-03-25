// require all `**/*.js`
const testsContext = require.context('./unit/', true, /\.js$/);

testsContext.keys().forEach(testsContext);

// require all `../lib/**`
const libContext = require.context('../../scripts/', true, /\.js$/);

libContext.keys().forEach(libContext);