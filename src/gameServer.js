// Import
const constant = require('../constant');
const serverFactory = require('./server');
const print = require('./helper/print');

// Instantiate server
const server = serverFactory.createServer();
// Create variables
const player = {};
let inGame = false;
let finish = 0;

// Configure event on server
function setupEvent() {
    // New player connection
    server.on('connection', (socket) => {
        print.info(`New player with id: ${socket.getId()}`);
        // Check if game is launch
        if (inGame) {
            print.info(`Game already launch, disconnection player ${socket.getId()}`);
            socket.send('error', constant.ERROR.IN_GAME);
            socket.close();
        }
        // Check if server is full
        if (server.getNumberOfClients() >= config.maxPlayer) {
            print.info(`Server is full, disconnection player ${socket.getId()}`);
            socket.send('error', constant.ERROR.SERVER_FULL);
            socket.close();
        }
        // Send config information
        socket.send('config', config);
    });
    // Disconection
    server.on('disconnection', (id) => {
        if (player[id] === undefined) {
            print.info(`Player ${id} disconnected`);
        } else {
            print.info(`${player[id].pseudo} (player ${id}) disconnected`);
            delete player[id];
        }
    });
    // Broken connection
    server.on('broken', (id) => {
        if (player[id] === undefined) {
            print.info(`Connection with player ${id} lost`);
        } else {
            print.info(`Connection with ${player[id].pseudo} (player ${id}) lost`);
            delete player[id];
        }
    });
    // Error
    server.on('error', (error) => {
        print.error(`Server error: ${error.message}`);
    });
}

// Configure server action
function setupAction() {
    // Player register pseudo
    server.action('register', (data, socket) => {
        player[socket.getId()] = {
            pseudo: data.pseudo,
        };
    });
    // Player ready to start
    server.action('ready', (data, socket) => {
        
    });
    // Player find a path
    server.action('finish', (data, socket) => {

    });
    // Default action
    server.action('default', (data, socket) => {
        // Unknow action, close connection
        if (player[id] === undefined) {
            print.info(`Unknown command from player ${id}, disconnection`);
        } else {
            print.info(`Unknown command from ${player[id].pseudo} (player ${id}), disconnection`);
            delete player[id];
        }
        // Send error message before closing the connection
        socket.send('error', constant.ERROR.UNKNOWN_COMMAND);
        socket.close();
    });
}

// Export
module.exports.start = function() {
    // Setup server
    setupEvent();
    setupAction();
    server.start(() => {
        print.info('Server started');
    });
};

module.exports.stop = function() {

};