// Import
const constant = require('./constant');
const file = require('./src/helper/file');


// Main function
async function main() {
    // Load config
    const config = getConfig();
    if (!config) {
        console.error('Unable to load the config file');
        process.exit(9);
    }
}

// Other functions
function getConfig() {
    // If file exist
    if (file.exist('./config.json')) {
        // Read file
        return file.loadJson(constant.CONFIG_PATH);
    } else {
        // File not exist, create config file
        if(!file.writeJson(constant.CONFIG_PATH, constant.DEFAULT_CONFIG)) {
            return false;
        }
        return constant.DEFAULT_CONFIG;
    }
}

// Launch main function
main();