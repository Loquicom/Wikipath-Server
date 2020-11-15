// Import
const portfinder = require('portfinder');
const constant = require('./constant');
const file = require('./src/helper/file');
const print = require('./src/helper/print');
const iphex = require('./src/helper/iphex');
const nat = require('./src/nat');
const server = require('./src/gameServer');

// Handle signal
process.on('SIGINT', stop);

// Variable
global.config = null

// Main functions
async function main() {
    print.title(`Wikipath Server (Ver ${constant.VERSION})`);
    // Load config
    print.info('Loading config file');
    config = getConfig();
    if (!config) {
        console.error('Unable to load the config file');
        process.exit(9);
    }
    print.info('Config file loaded');
    // Check port
    print.info('Checking port');
    const portAvailable = await portIsAvailable(constant.PORT);
    if (!portAvailable) {
        print.fatal('Error unable to start server');
        process.exit(5);
    }
    print.info(`Port ${constant.PORT} available`);
    // Start server
    print.info('Starting server');
    server.start();
    // Start the correct mode
    if (config.internet) {
        print.info('Starting online game');
        await onlineGame();
    } else {
        print.info('Starting local game');
        localGame();
    }
}

function stop() {
    print.info('Stopping server');
    server.stop();
    // Close port in it is an online game
    if (config.internet) {
        print.info('Closing port');
        nat.closePort(constant.PORT);
    }
    // End
    print.info('Server stop');
    process.exit();
}

// Other functions
function getConfig() {
    // If file exist
    if (file.exist('./config.json')) {
        // Read file
        return file.loadJson(constant.CONFIG_PATH);
    } else {
        // File not exist, create config file
        print.info('Config file not found, generation of a new config file');
        if(!file.writeJson(constant.CONFIG_PATH, constant.DEFAULT_CONFIG)) {
            return false;
        }
        return constant.DEFAULT_CONFIG;
    }
}

async function portIsAvailable(port) {
    // Change port search scope
    portfinder.basePort = port;
    portfinder.highestPort = port;
    // Check if port is available
    try {
        await portfinder.getPortPromise();
    } catch (e) {
        print.error(`Port ${port} not available: ${e.message}`);
        return false;
    }
    return true
}

async function onlineGame() {
    const isOpen = await nat.openPort(constant.PORT, constant.TTL);
    // Fail
    if(!isOpen) {
        print.warn('Impossible to activate the online game, only the local game is available');
        config.internet = false;
        print.info('Starting local game');
        localGame();
        return false;
    }
    // Success
    print.info('Online game enabled');
    // Get external IP
    print.info('Generating online code');
    const ip = await nat.getExternalIp();
    if (!ip) {
        print.warn('Unable to generate code');
        print.info('Use your external ip to connect to the server (you can find it in IPv4 on https://www.whatismyip.com)');
        return false;
    }
    // Generate code
    const code = iphex.encode(ip);
    print.info('Your code is:');
    print.important(code);
    return code;
}

function localGame() {
    print.info('Use the internal ip of the server to connect')
    print.info('The internal ip is one of these:');
    print.list(nat.getInternalIps());
}

// Launch main function
main();