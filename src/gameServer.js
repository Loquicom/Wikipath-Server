// Import
const print = require('./helper/print');
const constant = require('../constant');
const serverFactory = require('./server');
const wikipedia = require('./wikipedia');

// Instantiate server
const server = serverFactory.createServer(constant.PORT);
// Create variables
const player = {};
let inGame = false;
let finish = 0;

// Utility functions
function playersReady(players) {
    for(let playerId in players) {
        const p = player[playerId];
        if (!p.ready) {
            return false;
        }
    }
    return true;
}

async function play() {
    // Server enter in in-game mode
    inGame = true;
    // Get the start and end wikipedia page
    let startPage;
    let endPage;
    wikipedia.setLang(config.lang);
    try {
        startPage = await wikipedia.getRandomPage();
        endPage = await wikipedia.getRandomPage();
    } catch (err) {
        print.error('Unable to retrieve wikipedia pages');
        print.error('Error: ' + err.message);
        wikipathServerEvent.emit('stop');
        return;
    }
    console.log(startPage);
    console.log(endPage);
    // Send informations to all players
    server.broadcast('play', {});
}

// Configure event on server
function setupEvent() {
    // New player connection
    server.on('connection', (socket) => {
        print.info(`New player with id: ${socket.getId()}`);
        // Check if game is launch
        if (inGame) {
            print.info(`Game already launch, player ${socket.getId()} disconnects`);
            socket.send('error', constant.ERROR.IN_GAME);
            socket.close();
        }
        // Check if server is full
        if (server.getNumberOfClients() >= config.maxPlayer) {
            print.info(`Server is full, player ${socket.getId()} disconnects`);
            socket.send('error', constant.ERROR.SERVER_FULL);
            socket.close();
        }
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
        // Send config information
        socket.send('config', config);
        // Register
        player[socket.getId()] = {
            id: socket.getId(),
            pseudo: data.pseudo,
            ready: false
        };
        print.info(`Player ${socket.getId()} pseudo is ${data.pseudo}`);
        // Send informations about all players and alert other players
        const newPlayer = {
            id: socket.getId(),
            pseudo: data.pseudo,
        };
        socket.respond({players: player, self: newPlayer});
        socket.broadcastOther('new-player', newPlayer);
    });
    // Player quit the game
    server.action('quit', (data, socket) => {
        // Inform other players
        socket.broadcastOther('player-quit', {id: socket.getId()});
        // Disconnect
        server.clientDisconnect(socket.getId());
        print.info(`${player[socket.getId()].pseudo} (player ${socket.getId()}) leave the game`);
        delete player[socket.getId()];
    });
    // Player ready to start
    server.action('ready', (data, socket) => {
        player[socket.getId()].ready = true;
        // Alert other players
        socket.broadcastOther('player-ready', {id: socket.getId()});
        // Check if all players are ready
        if (playersReady(player)) {
            play();
        }
    });
    server.action('unready', (data, socket) => {
        player[socket.getId()].ready = false;
        // Alert other players
        socket.broadcastOther('player-unready', {id: socket.getId()});
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
    server.stop();
};