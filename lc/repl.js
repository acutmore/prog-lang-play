// @ts-check

const {scan} = require('./scanner');
const {parse} = require('./parser');
const {JavascriptVisitor} = require('./jsTranspiler');
const readline = require('readline');

const visitor = new JavascriptVisitor(str => process.stdout.write(str));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', function(line){
    try {
        const exp = parse(scan(line));
        exp.accept(visitor);
        process.stdout.write(`\n`);
    } catch (e) {
        if (e.userMessage) {
            console.error(e.userMessage(line));
        } else {
            console.error(e);
        }
    }
});
