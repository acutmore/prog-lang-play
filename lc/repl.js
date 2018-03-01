// @ts-check

const {compileToJs} = require('./index');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', function(line){
    try {
        const js = compileToJs(line);
        process.stdout.write(`${js}\n`);
    } catch (e) {
        if (e.userMessage) {
            console.error(e.userMessage(line));
        } else {
            console.error(e);
        }
    }
});
