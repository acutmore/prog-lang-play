/// @ts-check
'use strict';
const readline = require('readline');
const {makeProgram, transpileLc} = require('./ffi/ffi_node');

console.log('loading...');
makeProgram().then(instance => {
    console.log('ready');
    startRepl(instance);
});

/**
 * @param {WebAssembly.Instance} instance
 * @returns {void}
 */
function startRepl(instance) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.on('line', function(line){
        try {
            const js = transpileLc(line, instance);
            process.stdout.write(`${js}\n`);
        } catch (e) {
            console.error(e);
        }
        rl.prompt();
    });
    rl.prompt();
}
