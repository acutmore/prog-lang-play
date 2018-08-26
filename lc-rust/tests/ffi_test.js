
/// @ts-check
'use strict';
const assert = require('assert');
const {makeProgram, transpileLc} = require('../ffi/ffi_node');

const tests = [];
const t = (name, test) => tests.push({name, test});
setTimeout(function run() {
    if (tests.length === 0) {
        console.log('Tests pass');
        return;
    }
    const {name, test} = tests.shift();
    console.log(`> ${name}`);
    makeProgram().then(test).then(run, console.error);
});

t('Identity', (compiler) => {
    assert.equal(
        transpileLc('\\x.x', compiler),
        '(x => x)'
    );
});

t(`Two errors in a row`, (compiler) => {
    assert.equal(
        transpileLc('{}', compiler),
`! Compiler error
(1,1) error : Unexpected character: '{'
{}
^`
    );
    assert.equal(
        transpileLc('?', compiler),
`! Compiler error
(1,1) error : Unexpected character: '?'
?
^`
    );
});

t(`Small program`, (compiler) => {
    assert.equal(
        transpileLc('100', compiler).length,
        112,
    );
});

t(`Medium program`, (compiler) => {
    assert.equal(
        transpileLc('500', compiler).length,
        124
    );
});

t(`Large program`, (compiler) => {
    assert.equal(
        transpileLc('999', compiler).length,
        285
    );
});

t('HTML', (compiler) => {
    assert.equal(
        transpileLc('\\x.x', compiler, { emit: 'html' }),
        '<span data-lc-start="0b0000000000000001" data-lc-end="0b0000000000000010">(x => </span><span data-lc-start="0b0000000000000011" data-lc-end="0b0000000000000100">x</span><span data-lc-start="0b0000000000000001" data-lc-end="0b0000000000000010">)</span>'
    );
});
