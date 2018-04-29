/// @ts-check
'use strict';
const fs = require('fs');
const readline = require('readline');
const stringDecoder = new (require('string_decoder').StringDecoder)('utf8');

console.log('loading...');
WebAssembly.instantiate(
    new Uint8Array(fs.readFileSync('./target/wasm32-unknown-unknown/release/lc.wasm'))
).then(mod => {
    console.log('ready');
    startRepl(mod.instance);
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

/**
 * Transpile the LC input into Javascript
 * @param {string} src
 * @param {WebAssembly.Instance} instance
 * @returns {string}
 */
function transpileLc(src, instance) {
    transferInput(src, instance);
    const ptr = instance.exports.process();
    return transferOutput(ptr, instance);
}

/**
 * Move the input LC code into the wasm instance ready for processing
 * @param {string} code
 * @param {WebAssembly.Instance} instance
 * @returns {number} Number of bytes transfered
 */
function transferInput(code, instance) {
    const buffer = Buffer.from(code, 'utf8');
    const size = Buffer.byteLength(code, 'utf8');
    const ptr = instance.exports.realloc_shared_string(size);
    const memory = instance.exports.memory.buffer;
    const view = new Uint8Array(memory, ptr, size);
    buffer.copy(view, 0, 0, size);
    return size;
}

/**
 * Read the shared string out of the wasm instance
 * @param {number} ptr The address to read from
 * @param {WebAssembly.Instance} instance
 * @returns {string} compilation output
 */
function transferOutput(ptr, instance) {
    const memory = instance.exports.memory.buffer;
    const length = instance.exports.get_message_length();
    return stringDecoder
        .write(Buffer.from(new Uint8Array(memory, ptr, length)));
}
