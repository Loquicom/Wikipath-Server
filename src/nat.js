// Import
const { networkInterfaces } = require('os');
const upnp = require('nat-upnp-2').createClient();
const print = require('./helper/print');

// Functions
async function openPort(port, ttl) {
    return new Promise((resolve, reject) => {
        upnp.portMapping({public: port, private: port, ttl: ttl}, (error) => {
            if (error) {
                print.error(`Unable to map port ${port}: ${error.message}`);
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
}

function closePort(port) {
    upnp.portUnmapping({public: port})
    print.info(`Port ${port} closed`);
}

function getExternalIp() {
    return new Promise((resolve, reject) => {
        upnp.externalIp(function(error, ip) {
            if (error) {
                print.error(`Unable to have external IP: ${error.message}`);
                resolve(false);
            } else {
                resolve(ip);
            }
        });
    });
}

function getInternalIps() {
    const nets = networkInterfaces();
    const results = {};
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                if (!results[name]) {
                    results[name] = [];
                }
                results[name].push(net.address);
            }
        }
    }
    return results;
}

// Export
module.exports = {
    openPort: openPort,
    closePort: closePort,
    getExternalIp: getExternalIp,
    getInternalIps: getInternalIps
}