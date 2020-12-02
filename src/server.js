// Import
const print = require('./helper/print');
const constant = require('../constant');
const Server = require('./wsa/server');
const wikipedia = require('./wikipedia');

// Instantiate server
const server = new Server(constant.PORT, constant.PROTOCOL_VERSION);
// Create variables
const player = {};
let inGame = false;
let finisher = [];

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

function gameIsOver(players) {
    let nbFinish = 0;
    for(let playerId in players) {
        const p = player[playerId];
        if (p.finish) {
            nbFinish++;
        }
    }
    return nbFinish >= Object.keys(players).length - 1;
}

async function play() {
    // Server enter in in-game mode
    inGame = true;
    server.broadcast('loading-game');
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
    // Send informations to all players
    server.broadcast('play', {start: startPage, end: endPage});
}

function checkGameStatus() {
    if (inGame) {
        if (Object.keys(player).length === 0) {
            // No remaining player, reset game
            print.info('No remaining player');
            reset();
        } else if (gameIsOver(player)) {
            // Game is over with the remaining players
            endGame();
            reset();
        }
    }
}

function endGame() {
    print.info('End game');
    // Generate result array
    const result = [];
    for(let i = 0; i < finisher.length; i++) {
        const p = player[finisher[i]];
        result.push({
            pseudo: p.pseudo,
            pos: (i + 1),
            history: p.history
        });
    }
    // Broadcast result to all players
    server.broadcast('result', result);
}

function reset() {
    print.info('Reset game');
    inGame = false;
    finisher = [];
    for(let playerId in player) {
        player[playerId].ready = false;
        player[playerId].finish = false;
        player[playerId].history = null;
    }
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
        checkGameStatus();
    });
    // Broken connection
    server.on('broken', (id) => {
        if (player[id] === undefined) {
            print.info(`Connection with player ${id} lost`);
        } else {
            print.info(`Connection with ${player[id].pseudo} (player ${id}) lost`);
            delete player[id];
        }
        checkGameStatus();
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
            ready: false,
            finish: false,
            history: null
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
        checkGameStatus();
    });
    // Player ready to start
    server.action('ready', (data, socket) => {
        player[socket.getId()].ready = true;
        // Alert other players
        socket.broadcastOther('player-ready', {id: socket.getId()});
        // Check if all players are ready
        if (playersReady(player)) {
            print.info(`Game started with ${Object.keys(player).length} player(s)`);
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
        finisher.push(socket.getId());
        print.info(`${player[socket.getId()].pseudo} (player ${socket.getId()}) find a path, ranked: ${finisher.length}`);
        // Add information
        player[socket.getId()].finish = true;
        player[socket.getId()].history = data.history;
        // Check if the game is over
        let over = true;
        if (!config.firstFinish) {
            over = gameIsOver(player);
        }
        // If game is over send result and reset the game
        if (over) {
            endGame();
            reset();
        }
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
        print.info('Server ready');
    });
};

module.exports.stop = function() {
    server.stop();
};