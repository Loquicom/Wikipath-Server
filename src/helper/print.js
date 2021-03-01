const colors = require('colors');

function indentation(nb) {
    let str = '';
    for(let i = 0; i < nb; i++) {
        str += '  ';
    }
    return str;
}

function title(str) {
    console.info(str.bold.underline.italic.brightBlue);
}

function info(str, indent = 0) {
    console.info(`${indentation(indent)}>`.bold.green, str.bold);
}

function warn(str, indent = 0) {
    console.log(`${indentation(indent)}>`.bold.yellow, str.bold);
}
    
function error(str, indent = 0) {
    console.error(`${indentation(indent)}>`.bold.red, str.bold);
}

function fatal(str, indent = 0) {
    console.error(`${indentation(indent)}> ${str}`.bold.bgBrightRed.white)
}

function important(str) {
    console.info('  ==>'.bold.magenta, str.bold, '<==  '.bold.magenta);
}
    
function list(it, space = 2, indent = 0) {
    // Generate blank
    let blank = '';
    for(let i = 0; i<space; i++) {
        blank += ' ';
    }
    //Print content
    for (const prop in it) {
        if (typeof it[prop] === 'string') {
            console.info(`${indentation(indent)}${blank}->`.bold.blue, it[prop].bold);
        } else if (typeof it[prop] === 'object') {
            console.info(`${indentation(indent)}${blank}=>`.bold.blue, `${prop}:`.bold);
            list(it[prop], space + 2);
        }
    }
}

const print = {
    title: title,
    info: info,
    warn: warn,
    error: error,
    fatal: fatal,
    important: important,
    list: list
}
print.nl = function () {
    console.info('');
    return print;
}

module.exports = print;