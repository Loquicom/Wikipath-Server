const Server = require('./server');
let serv = null;

module.exports.createServer = function(port = null, protocoleVersion = null) {
    if (protocoleVersion !== null) {
        serv = new Server(port, protocoleVersion);
    } else {
        serv = new Server(port);
    }
    return serv;
};

module.exports.getLastServer = function() {
    return serv;
};