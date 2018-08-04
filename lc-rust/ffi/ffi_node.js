/// @ts-check
const fs = require('fs');
const stringDecoder = new (require('string_decoder').StringDecoder)('utf8');

/**
 * Compile the wasm file into an active instance of the compiler
 * @returns {WebAssembly.Instance}
 */
function makeProgram() {
    return WebAssembly.instantiate(
        new Uint8Array(fs.readFileSync('./target/wasm32-unknown-unknown/release/lc.wasm'))
    )
    .then(mod => mod.instance);
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

module.exports = {
    makeProgram,
    transpileLc
};
