const Server = require('./server');
let serv = null;

module.exports.createServer = function(port = null) {
    if (port !== null) {
        serv = new Server(port);
    } else {
        serv = new Server();
    }
    return serv;
};

module.exports.getLastServer = function() {
    return serv;
};