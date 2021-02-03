const constant = {
    VERSION: '0.2.0',
    PROTOCOL_VERSION: 1, 
    DEFAULT_CONFIG: {
        name: "Wikipath Server",
        lang: "en",
        maxPlayer: 10,
        firstFinish: true,
        destinationInfo: true,
        fullPage: true,
        nat: true,
        ip: null
    },
    CONFIG_PATH: './config.json',
    PORT: 42826,
    TTL: 43200,
    ERROR: {
        IN_GAME: {
            code: 1,
            message: 'error.in-game'
        },
        SERVER_FULL: {
            code: 2,
            message: 'error.server-full'
        },
        UNKNOWN_COMMAND: {
            code: 3,
            message: 'error.unknown-command'
        }
    }
};

module.exports = constant;