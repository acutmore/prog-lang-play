const input = document.getElementById('input');
const output = document.getElementById('output');
const evalButton = document.getElementById('eval-output');
const {frontend} = require('../../lc');
const JsHighlighter = require('./jsHighlightTranspiler').jsHighlightTranspiler;
const {linePositions, shiftToTokenStart} = require('./linePositions');
const {evaluateScript} = require('./outputEvaluator');

function compileWithHighlight(input, start, end) {
    const program = frontend(input);
    const shiftedStart = shiftToTokenStart(input, start);
    return program.accept(new JsHighlighter(shiftedStart, end));
}

function processInput() {
    const inStr = input.value;
    const {start, end} = linePositions(inStr, input.selectionStart, input.selectionEnd);

    try {
        output.innerHTML = compileWithHighlight(inStr, start, end);
    } catch (e) {
        if (e && e.userMessage) {
            output.innerText = e.userMessage(input.value);
        } else {
            console.error(e);
            output.innerText = `! Unexpected error`;
        }
    }
}

input.onkeyup = processInput;
input.onchange = processInput;
document.onselectionchange = processInput;
window.onselectionchange = processInput;

evalButton.onclick = () => {
    evaluateScript(output.innerText).then(console.log, console.error);
};
