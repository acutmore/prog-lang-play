const input = document.getElementById('input');
const output = document.getElementById('output');
const frontend = require('../../lc').frontend;
const JsHighlighter = require('./jsHighlightTranspiler').jsHighlightTranspiler;
const linePositions = require('./linePositions').linePositions;

function compileWithHighlight(input, start, end) {
    const program = frontend(input);
    return program.accept(new JsHighlighter(start, end));
}

input.onkeyup = () => {
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
};
