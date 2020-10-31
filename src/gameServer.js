// Import
const serverFactory = require('./server');

// Instantiate server
const server = serverFactory.createServer();

// Export
module.exports.start = function() {
    console.log('start');
};

module.exports.stop = function() {

};