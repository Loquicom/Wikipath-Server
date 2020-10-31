const colors = require('colors');

function title(str) {
    console.info(str.bold.underline.italic.brightBlue);
}

function info(str) {
    console.info('>'.bold.green, str.bold);
}

function warn(str) {
    console.log('>'.bold.yellow, str.bold);
}
    
function error(str) {
    console.error('>'.bold.red, str.bold);
}

function fatal(str) {
    console.error(`> ${str}`.bold.bgBrightRed.white)
}

function important(str) {
    console.info('  ==>'.bold.magenta, str.bold, '<==  '.bold.magenta);
}
    
function list(it, space = 2) {
    // Generate blank
    let blank = '';
    for(let i = 0; i<space; i++) {
        blank += ' ';
    }
    //Print content
    for (const prop in it) {
        if (typeof it[prop] === 'string') {
            console.info(`${blank}->`.bold.blue, it[prop].bold);
        } else if (typeof it[prop] === 'object') {
            console.info(`${blank}=>`.bold.blue, `${prop}:`.bold);
            list(it[prop], space + 2);
        }
    }
}

module.exports = {
    title: title,
    info: info,
    warn: warn,
    error: error,
    fatal: fatal,
    important: important,
    list: list
}