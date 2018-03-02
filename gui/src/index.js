const input = document.getElementById('input');
const output = document.getElementById('output');
const compiler = require('../../lc').compileToJs;

input.onkeyup = () => {
    try {
        output.innerText = compiler(input.value);
    } catch (e) {
        if (e && e.userMessage) {
            output.innerText = e.userMessage(input.value);
        } else {
            console.error(e);
            output.innerText = `! Unexpected error`;
        }
    }
};
