const input = document.getElementById('input');
const output = document.getElementById('output');
const evalButton = document.getElementById('eval-output');
const {evaluateScript} = require('./outputEvaluator');
const {generateHighlightRules} = require('./generateHighlightRules');

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder('utf-8');

function getCompiler() {
    return fetch('./lc.wasm')
        .then(req => req.arrayBuffer())
        .then(bytes => WebAssembly.instantiate(bytes))
        .then(w => w.instance);
}

let compilerInstance = void 0;
getCompiler().then(i => {
    compilerInstance = i;
});

function transferInput(instance, str) {
    const encoded = textEncoder.encode(str);
    const ptr = instance.exports.realloc_shared_string(encoded.length);
    const view = new Uint8Array(instance.exports.memory.buffer, ptr, encoded.length);
    view.set(encoded);
}

function transerOutput(instance, ptr) {
    const len = instance.exports.get_message_length();
    const view = new Uint8Array(instance.exports.memory.buffer, ptr, len);
    return textDecoder.decode(view);
}

function transpile(instance, str) {
    transferInput(instance, str);
    const EMIT_HTML = 2;
    const ptr = instance.exports.process(EMIT_HTML);
    return transerOutput(instance, ptr);
}

let lastInput = input.value;
function processInput() {
    if (!compilerInstance) {
        return void 0;
    }
    const inStr = input.value;
    if (lastInput === inStr) {
        return void 0;
    }
    lastInput = inStr;

    try {
        const rustOut = transpile(compilerInstance, inStr);
        output.innerHTML = rustOut;
    } catch (e) {
        console.error(e);
        output.innerText = `! Unexpected error`;
        compilerInstance = void 0;
        getCompiler().then(i => {
            compilerInstance = i;
        });
    }
}

const style = document.createElement('style');
style.type = 'text/css';

function processHighlight() {
    const inStart = input.selectionStart;
    const inEnd = input.selectionEnd;
    if (typeof inStart !== 'number') return;
    if (typeof inEnd !== 'number') return;
    const rules = generateHighlightRules(inStart, inEnd);
    style.innerHTML = rules;
    style.remove();
    document.getElementsByTagName('head')[0].appendChild(style);
}

input.onkeyup = processInput;
input.onchange = processInput;
document.onselectionchange = processHighlight;
window.onselectionchange = processHighlight;
evalButton.onclick = () => {
    evaluateScript(output.innerText).then(console.log, console.error);
};
