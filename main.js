// Import
const events = require('events');
const portfinder = require('portfinder');
const keypress = require('keypress');
const constant = require('./constant');
const file = require('./src/helper/file');
const print = require('./src/helper/print');
const iphex = require('./src/helper/iphex');
const nat = require('./src/nat');
const server = require('./src/server');

// Handle signal
process.on('SIGINT', stop);

// Variable
global.config = null;
global.wikipathServerEvent = new events.EventEmitter();
let natInterval = null;
const devMode = process.argv.length > 2 && process.argv[2] === '--dev';

// Main functions
async function main() {
    print.title(`Wikipath Server Ver ${constant.VERSION} (Protocol version: ${constant.PROTOCOL_VERSION})`);
    // Load config
    print.info('Loading config file');
    config = getConfig();
    if (!config) {
        console.error('Unable to load the config file');
        process.exit(9);
    }
    print.info('Config file loaded');
    // Check port if nat is enabled
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
    let natEnabled = false;
    if (config.nat) {
        print.info('Open port');
        natEnabled = await enableNat();
    }
    print.info('Generating code');
    await generateCode(natEnabled);
    print.info('You can stop the server with Ctrl+C or Cmd+.');
    print.info('Server is started');
}

function stop() {
    print.nl().info('Stopping server');
    server.stop();
    // Close port if it is an online game
    if (config.nat) {
        print.info('Closing port');
        nat.closePort(constant.PORT);
        clearInterval(natInterval);
    }
    // End
    print.info('Server stopped');
    // Check if dev mode is enabled
    if (devMode) {
        // In dev mode just stop the program
        process.exit();
    }
    // Otherwise waits for the user to press a key
    keypress(process.stdin);
    process.stdin.on('keypress', () => {
        process.exit();
    });
    process.stdin.setRawMode(true);
    print.info('Press any key to close...');
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

async function enableNat() {
    const isOpen = await nat.openPort(constant.PORT, constant.TTL);
    // Fail
    if(!isOpen) {
        print.warn('Unable to open port');
        config.nat = false;
        return false;
    }
    // Interval to reopen port after TTL
    natInterval = setInterval(async function() {
        print.info('Open port TTL expired, re-open')
        const isSuccess = await nat.openPort(constant.PORT, constant.TTL);
        if(!isSuccess) {
            print.warn('Unable to re-open port');
            stop();
            return;
        }
        print.info('Port re-opened')
    }, (constant.TTL * 1000) - 1000);
    // Success
    print.info('Port opened');
    return true;
}

async function getIp(natEnabled) {
    // Get external IP if nat is enabled
    if (natEnabled) {
        print.info('Retrieving the IP');
        const ip = await nat.getExternalIp();
        if (ip) {
            return ip;
        }
        print.warn('Unable to retrieving the IP');
    }
    // Get ip from the config file
    print.info('Get IP from config file');
    return config.ip;
}

async function generateCode(natEnabled) {
    // Get ip
    const ip = await getIp(natEnabled);
    // Show information
    print.info('You can connect with the code or an IP');
    if (natEnabled) {
        print.info('You can use one of yours internals (local) IP or your external IP');
        if (ip) {
            print.info(`Your external IP is ${ip}`);
        } else {
            print.info('You can find your external IP in IPv4 on https://www.whatismyip.com');
        }
    } else {
        print.info('You can use one of yours internals (local) IP');
    }
    print.info('Yours internals IP are:');
    print.list(nat.getInternalIps());
    // Generate code
    if (!ip) {
        print.warn('Unable to generate code, no IP');
        return false;
    }
    const code = iphex.encode(ip);
    print.info('Your code is:');
    print.important(code);
    return code;
}

// Events
wikipathServerEvent.on('stop', () => {
    stop();
});

// Launch main function
main();