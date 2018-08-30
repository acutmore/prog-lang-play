/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

const input = document.getElementById('input');
const output = document.getElementById('output');
const evalButton = document.getElementById('eval-output');
const evalPreview = document.getElementById('eval-preview');
const {evaluateScript} = __webpack_require__(1);
const {generateHighlightRules} = __webpack_require__(2);
const {fib, selectionStart, selectionEnd} = __webpack_require__(3);

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
    input.value = fib;
    processInput();
    input.focus();
    input.setSelectionRange(selectionStart, selectionEnd);
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
    evalPreview.innerText = `...`;
    const e = evaluateScript(output.innerText);
    e.then(console.log, console.error);
    e.then(result => {
        evalPreview.innerText = `Result: ${result.number}`;
    }, err => {
        evalPreview.innerText = err.toString();
    });
};


/***/ }),
/* 1 */
/***/ (function(module, exports) {


const timeoutMs = 10 * 1000;

function evaluateScript(script) {
    return new Promise((resolve, reject) => {
        const worker = new Worker('./output-worker.js');
        const timerId = setTimeout(() => {
            reject(new Error('worker timeout'));
            worker.terminate();
        }, timeoutMs);

        worker.onmessage = function(e) {
            resolve(e.data);
            worker.terminate();
            clearTimeout(timerId);
        };
        worker.postMessage(script);
    });
}

exports.evaluateScript = evaluateScript;


/***/ }),
/* 2 */
/***/ (function(module, exports) {

/// @ts-check

/**
 * Convert number to binary string
 * @param {number} n
 * @returns {string}
 */
function numberToBStr(n) {
    return (n).toString(2).padStart(16, 0);
}

/**
 * Given a number 'N' generate the prefixes
 * binary numbers less than 'N' will have
 * @generator
 * @param {number} n
 */
function* lessThanPrefixes(n) {
    const a = numberToBStr(n);
    for (let i = 0; i < a.length; i++) {
        const char = a[i];
        switch (char) {
            case '1':
                yield a.substring(0, i) + '0';
            case '0':
                break;
            default: throw new Error('expected binary string');
        }
    }
}

/**
 * Generate the css styles to highlight the given range
 * @param {number} start
 * @param {number} end
 * @returns {string}
 */
function generateHighlightRules(start, end) {
    const setStyle = []
    const unsetStyle = [];
    setStyle.push(`span[data-lc-start^="0b${numberToBStr(start)}"]`);
    setStyle.push(`span[data-lc-end^="0b${numberToBStr(end)}"]`);
    for (const lessThanPrefix of lessThanPrefixes(end)) {
        setStyle.push(`span[data-lc-start^="0b${lessThanPrefix}"]`);
    }
    for (const lessThanPrefix of lessThanPrefixes(start)) {
        unsetStyle.push(`span[data-lc-end^="0b${lessThanPrefix}"]`);
    }
    let style = '';
    if (setStyle.length > 0) {
        style += `${setStyle.join(',\n')} { background-color: lightskyblue; }\n`;
    }
    if (unsetStyle.length > 0) {
        style += `${unsetStyle.join(',\n')} { background-color: unset }\n`;
    }
    return style;
}

exports.generateHighlightRules = generateHighlightRules;


/***/ }),
/* 3 */
/***/ (function(module, exports) {

const SEL_START = '>>';
const SEL_END = '<<';

let fib = `
let
  True =  λa.λb.a,
  False = λa.λb.b,
  isZero = λn.n (λ_.False) True,
  minusOne = λn.λf.λx.n (λg.λh.h (g f)) (λ_.x) (λi.i),
  minus = λm.λn. n minusOne m,
  minusTwo = λn.minus n 2,
  lessOrEqual = λn.λm. isZero (minus m n),
  leqOne = lessOrEqual 1,
  add = λn.λm.(λf.λx.m f (n f x)),
  ${SEL_START}fibFix = λfib.λn. (
    (isZero n)
      (λ_.0)
      (λ_.leqOne n
        1
        (add
          (fib fib (minusOne n))
          (fib fib (minusTwo n))
        )
      )
    ) True${SEL_END},
  fib = fibFix fibFix
in
  fib 8
`;
const selectionStart = fib.indexOf(SEL_START);
fib = fib.replace(SEL_START, '');
const selectionEnd = fib.indexOf(SEL_END);
fib = fib.replace(SEL_END, '');

module.exports = {
  fib,
  selectionStart,
  selectionEnd,
};


/***/ })
/******/ ]);