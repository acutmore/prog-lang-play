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

const workerScript = (function(){
    function sandboxScript(script) {
        const illegalChars = `\`[]."'{}+-*`;
        const lookUp = new RegExp(
            `[${illegalChars.split('').map(v => `\\${v}`).join('')}]`
        , 'g');

        if (lookUp.test(script)) {
            throw new Error(`script contains illegal characters: ${illegalChars}`);
        }

        return `
            with (trap) {
                return (${script});
            }
        `;
    }

    function churchNumerialToNumber(cn) {
        return cn(acc => acc + 1)(0);
    }

    self.onmessage=function(event) {
        const trap = new Proxy({}, {
            has: () => true,
            get: () => (f => x => x)
        });
        const functionBody = sandboxScript(event.data);
        const program = new Function('trap', functionBody);
        const result = program(trap);
        postMessage({
            result: result.toString(),
            number: churchNumerialToNumber(result)
        });
    };
}).toString().slice('function() {'.length, -1);

function evaluateScript(script) {
    return new Promise((resolve, reject) => {
        const worker = new Worker('data:application/javascript,' +
                        encodeURIComponent(workerScript));
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
    style += `${setStyle.join(',\n')} { background-color: lightskyblue; }\n`;
    style += `${unsetStyle.join(',\n')} { background-color: unset }\n`;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgM2I3OWJkYWU5Nzg2NzAyYjk0NTgiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LmpzIiwid2VicGFjazovLy8uL3NyYy9vdXRwdXRFdmFsdWF0b3IuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2dlbmVyYXRlSGlnaGxpZ2h0UnVsZXMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2V4YW1wbGVzL2ZpYm9uYWNjaS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLGVBQWU7QUFDdEIsT0FBTyx1QkFBdUI7QUFDOUIsT0FBTyxrQ0FBa0M7O0FBRXpDO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQyxjQUFjO0FBQ3pELEtBQUs7QUFDTDtBQUNBLEtBQUs7QUFDTDs7Ozs7Ozs7QUNqR0E7O0FBRUE7QUFDQTtBQUNBLHVDQUF1QztBQUN2QztBQUNBLGdCQUFnQixxQ0FBcUMsRUFBRSxZQUFZO0FBQ25FOztBQUVBO0FBQ0EsbUVBQW1FLGFBQWE7QUFDaEY7O0FBRUE7QUFDQTtBQUNBLDBCQUEwQixPQUFPO0FBQ2pDO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxpQ0FBaUM7QUFDakM7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxDQUFDLGdDQUFnQzs7QUFFakM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTs7Ozs7OztBQzFEQTs7QUFFQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQjtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsY0FBYztBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsT0FBTztBQUNsQixhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0Q0FBNEMsb0JBQW9CO0FBQ2hFLDBDQUEwQyxrQkFBa0I7QUFDNUQ7QUFDQSxnREFBZ0QsZUFBZTtBQUMvRDtBQUNBO0FBQ0EsZ0RBQWdELGVBQWU7QUFDL0Q7QUFDQTtBQUNBLGdCQUFnQixxQkFBcUIsRUFBRSxnQ0FBZ0MsRUFBRTtBQUN6RSxnQkFBZ0IsdUJBQXVCLEVBQUUsMEJBQTBCO0FBQ25FO0FBQ0E7O0FBRUE7Ozs7Ozs7QUN0REE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSxVQUFVO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSAwKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCAzYjc5YmRhZTk3ODY3MDJiOTQ1OCIsImNvbnN0IGlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lucHV0Jyk7XG5jb25zdCBvdXRwdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb3V0cHV0Jyk7XG5jb25zdCBldmFsQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2V2YWwtb3V0cHV0Jyk7XG5jb25zdCBldmFsUHJldmlldyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdldmFsLXByZXZpZXcnKTtcbmNvbnN0IHtldmFsdWF0ZVNjcmlwdH0gPSByZXF1aXJlKCcuL291dHB1dEV2YWx1YXRvcicpO1xuY29uc3Qge2dlbmVyYXRlSGlnaGxpZ2h0UnVsZXN9ID0gcmVxdWlyZSgnLi9nZW5lcmF0ZUhpZ2hsaWdodFJ1bGVzJyk7XG5jb25zdCB7ZmliLCBzZWxlY3Rpb25TdGFydCwgc2VsZWN0aW9uRW5kfSA9IHJlcXVpcmUoJy4vZXhhbXBsZXMvZmlib25hY2NpJyk7XG5cbmNvbnN0IHRleHRFbmNvZGVyID0gbmV3IFRleHRFbmNvZGVyKCk7XG5jb25zdCB0ZXh0RGVjb2RlciA9IG5ldyBUZXh0RGVjb2RlcigndXRmLTgnKTtcblxuZnVuY3Rpb24gZ2V0Q29tcGlsZXIoKSB7XG4gICAgcmV0dXJuIGZldGNoKCcuL2xjLndhc20nKVxuICAgICAgICAudGhlbihyZXEgPT4gcmVxLmFycmF5QnVmZmVyKCkpXG4gICAgICAgIC50aGVuKGJ5dGVzID0+IFdlYkFzc2VtYmx5Lmluc3RhbnRpYXRlKGJ5dGVzKSlcbiAgICAgICAgLnRoZW4odyA9PiB3Lmluc3RhbmNlKTtcbn1cblxubGV0IGNvbXBpbGVySW5zdGFuY2UgPSB2b2lkIDA7XG5nZXRDb21waWxlcigpLnRoZW4oaSA9PiB7XG4gICAgY29tcGlsZXJJbnN0YW5jZSA9IGk7XG4gICAgaW5wdXQudmFsdWUgPSBmaWI7XG4gICAgcHJvY2Vzc0lucHV0KCk7XG4gICAgaW5wdXQuZm9jdXMoKTtcbiAgICBpbnB1dC5zZXRTZWxlY3Rpb25SYW5nZShzZWxlY3Rpb25TdGFydCwgc2VsZWN0aW9uRW5kKTtcbn0pO1xuXG5mdW5jdGlvbiB0cmFuc2ZlcklucHV0KGluc3RhbmNlLCBzdHIpIHtcbiAgICBjb25zdCBlbmNvZGVkID0gdGV4dEVuY29kZXIuZW5jb2RlKHN0cik7XG4gICAgY29uc3QgcHRyID0gaW5zdGFuY2UuZXhwb3J0cy5yZWFsbG9jX3NoYXJlZF9zdHJpbmcoZW5jb2RlZC5sZW5ndGgpO1xuICAgIGNvbnN0IHZpZXcgPSBuZXcgVWludDhBcnJheShpbnN0YW5jZS5leHBvcnRzLm1lbW9yeS5idWZmZXIsIHB0ciwgZW5jb2RlZC5sZW5ndGgpO1xuICAgIHZpZXcuc2V0KGVuY29kZWQpO1xufVxuXG5mdW5jdGlvbiB0cmFuc2VyT3V0cHV0KGluc3RhbmNlLCBwdHIpIHtcbiAgICBjb25zdCBsZW4gPSBpbnN0YW5jZS5leHBvcnRzLmdldF9tZXNzYWdlX2xlbmd0aCgpO1xuICAgIGNvbnN0IHZpZXcgPSBuZXcgVWludDhBcnJheShpbnN0YW5jZS5leHBvcnRzLm1lbW9yeS5idWZmZXIsIHB0ciwgbGVuKTtcbiAgICByZXR1cm4gdGV4dERlY29kZXIuZGVjb2RlKHZpZXcpO1xufVxuXG5mdW5jdGlvbiB0cmFuc3BpbGUoaW5zdGFuY2UsIHN0cikge1xuICAgIHRyYW5zZmVySW5wdXQoaW5zdGFuY2UsIHN0cik7XG4gICAgY29uc3QgRU1JVF9IVE1MID0gMjtcbiAgICBjb25zdCBwdHIgPSBpbnN0YW5jZS5leHBvcnRzLnByb2Nlc3MoRU1JVF9IVE1MKTtcbiAgICByZXR1cm4gdHJhbnNlck91dHB1dChpbnN0YW5jZSwgcHRyKTtcbn1cblxubGV0IGxhc3RJbnB1dCA9IGlucHV0LnZhbHVlO1xuZnVuY3Rpb24gcHJvY2Vzc0lucHV0KCkge1xuICAgIGlmICghY29tcGlsZXJJbnN0YW5jZSkge1xuICAgICAgICByZXR1cm4gdm9pZCAwO1xuICAgIH1cbiAgICBjb25zdCBpblN0ciA9IGlucHV0LnZhbHVlO1xuICAgIGlmIChsYXN0SW5wdXQgPT09IGluU3RyKSB7XG4gICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgfVxuICAgIGxhc3RJbnB1dCA9IGluU3RyO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcnVzdE91dCA9IHRyYW5zcGlsZShjb21waWxlckluc3RhbmNlLCBpblN0cik7XG4gICAgICAgIG91dHB1dC5pbm5lckhUTUwgPSBydXN0T3V0O1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgb3V0cHV0LmlubmVyVGV4dCA9IGAhIFVuZXhwZWN0ZWQgZXJyb3JgO1xuICAgICAgICBjb21waWxlckluc3RhbmNlID0gdm9pZCAwO1xuICAgICAgICBnZXRDb21waWxlcigpLnRoZW4oaSA9PiB7XG4gICAgICAgICAgICBjb21waWxlckluc3RhbmNlID0gaTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5jb25zdCBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG5zdHlsZS50eXBlID0gJ3RleHQvY3NzJztcblxuZnVuY3Rpb24gcHJvY2Vzc0hpZ2hsaWdodCgpIHtcbiAgICBjb25zdCBpblN0YXJ0ID0gaW5wdXQuc2VsZWN0aW9uU3RhcnQ7XG4gICAgY29uc3QgaW5FbmQgPSBpbnB1dC5zZWxlY3Rpb25FbmQ7XG4gICAgaWYgKHR5cGVvZiBpblN0YXJ0ICE9PSAnbnVtYmVyJykgcmV0dXJuO1xuICAgIGlmICh0eXBlb2YgaW5FbmQgIT09ICdudW1iZXInKSByZXR1cm47XG4gICAgY29uc3QgcnVsZXMgPSBnZW5lcmF0ZUhpZ2hsaWdodFJ1bGVzKGluU3RhcnQsIGluRW5kKTtcbiAgICBzdHlsZS5pbm5lckhUTUwgPSBydWxlcztcbiAgICBzdHlsZS5yZW1vdmUoKTtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLmFwcGVuZENoaWxkKHN0eWxlKTtcbn1cblxuaW5wdXQub25rZXl1cCA9IHByb2Nlc3NJbnB1dDtcbmlucHV0Lm9uY2hhbmdlID0gcHJvY2Vzc0lucHV0O1xuZG9jdW1lbnQub25zZWxlY3Rpb25jaGFuZ2UgPSBwcm9jZXNzSGlnaGxpZ2h0O1xud2luZG93Lm9uc2VsZWN0aW9uY2hhbmdlID0gcHJvY2Vzc0hpZ2hsaWdodDtcbmV2YWxCdXR0b24ub25jbGljayA9ICgpID0+IHtcbiAgICBldmFsUHJldmlldy5pbm5lclRleHQgPSBgLi4uYDtcbiAgICBjb25zdCBlID0gZXZhbHVhdGVTY3JpcHQob3V0cHV0LmlubmVyVGV4dCk7XG4gICAgZS50aGVuKGNvbnNvbGUubG9nLCBjb25zb2xlLmVycm9yKTtcbiAgICBlLnRoZW4ocmVzdWx0ID0+IHtcbiAgICAgICAgZXZhbFByZXZpZXcuaW5uZXJUZXh0ID0gYFJlc3VsdDogJHtyZXN1bHQubnVtYmVyfWA7XG4gICAgfSwgZXJyID0+IHtcbiAgICAgICAgZXZhbFByZXZpZXcuaW5uZXJUZXh0ID0gZXJyLnRvU3RyaW5nKCk7XG4gICAgfSk7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiXG5jb25zdCB0aW1lb3V0TXMgPSAxMCAqIDEwMDA7XG5cbmNvbnN0IHdvcmtlclNjcmlwdCA9IChmdW5jdGlvbigpe1xuICAgIGZ1bmN0aW9uIHNhbmRib3hTY3JpcHQoc2NyaXB0KSB7XG4gICAgICAgIGNvbnN0IGlsbGVnYWxDaGFycyA9IGBcXGBbXS5cIid7fSstKmA7XG4gICAgICAgIGNvbnN0IGxvb2tVcCA9IG5ldyBSZWdFeHAoXG4gICAgICAgICAgICBgWyR7aWxsZWdhbENoYXJzLnNwbGl0KCcnKS5tYXAodiA9PiBgXFxcXCR7dn1gKS5qb2luKCcnKX1dYFxuICAgICAgICAsICdnJyk7XG5cbiAgICAgICAgaWYgKGxvb2tVcC50ZXN0KHNjcmlwdCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgc2NyaXB0IGNvbnRhaW5zIGlsbGVnYWwgY2hhcmFjdGVyczogJHtpbGxlZ2FsQ2hhcnN9YCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYFxuICAgICAgICAgICAgd2l0aCAodHJhcCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAoJHtzY3JpcHR9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgYDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjaHVyY2hOdW1lcmlhbFRvTnVtYmVyKGNuKSB7XG4gICAgICAgIHJldHVybiBjbihhY2MgPT4gYWNjICsgMSkoMCk7XG4gICAgfVxuXG4gICAgc2VsZi5vbm1lc3NhZ2U9ZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgY29uc3QgdHJhcCA9IG5ldyBQcm94eSh7fSwge1xuICAgICAgICAgICAgaGFzOiAoKSA9PiB0cnVlLFxuICAgICAgICAgICAgZ2V0OiAoKSA9PiAoZiA9PiB4ID0+IHgpXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBmdW5jdGlvbkJvZHkgPSBzYW5kYm94U2NyaXB0KGV2ZW50LmRhdGEpO1xuICAgICAgICBjb25zdCBwcm9ncmFtID0gbmV3IEZ1bmN0aW9uKCd0cmFwJywgZnVuY3Rpb25Cb2R5KTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gcHJvZ3JhbSh0cmFwKTtcbiAgICAgICAgcG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgICAgcmVzdWx0OiByZXN1bHQudG9TdHJpbmcoKSxcbiAgICAgICAgICAgIG51bWJlcjogY2h1cmNoTnVtZXJpYWxUb051bWJlcihyZXN1bHQpXG4gICAgICAgIH0pO1xuICAgIH07XG59KS50b1N0cmluZygpLnNsaWNlKCdmdW5jdGlvbigpIHsnLmxlbmd0aCwgLTEpO1xuXG5mdW5jdGlvbiBldmFsdWF0ZVNjcmlwdChzY3JpcHQpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBjb25zdCB3b3JrZXIgPSBuZXcgV29ya2VyKCdkYXRhOmFwcGxpY2F0aW9uL2phdmFzY3JpcHQsJyArXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmNvZGVVUklDb21wb25lbnQod29ya2VyU2NyaXB0KSk7XG4gICAgICAgIGNvbnN0IHRpbWVySWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ3dvcmtlciB0aW1lb3V0JykpO1xuICAgICAgICAgICAgd29ya2VyLnRlcm1pbmF0ZSgpO1xuICAgICAgICB9LCB0aW1lb3V0TXMpO1xuXG4gICAgICAgIHdvcmtlci5vbm1lc3NhZ2UgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICByZXNvbHZlKGUuZGF0YSk7XG4gICAgICAgICAgICB3b3JrZXIudGVybWluYXRlKCk7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZXJJZCk7XG4gICAgICAgIH07XG4gICAgICAgIHdvcmtlci5wb3N0TWVzc2FnZShzY3JpcHQpO1xuICAgIH0pO1xufVxuXG5leHBvcnRzLmV2YWx1YXRlU2NyaXB0ID0gZXZhbHVhdGVTY3JpcHQ7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9vdXRwdXRFdmFsdWF0b3IuanNcbi8vIG1vZHVsZSBpZCA9IDFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8vIEB0cy1jaGVja1xuXG4vKipcbiAqIENvbnZlcnQgbnVtYmVyIHRvIGJpbmFyeSBzdHJpbmdcbiAqIEBwYXJhbSB7bnVtYmVyfSBuXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBudW1iZXJUb0JTdHIobikge1xuICAgIHJldHVybiAobikudG9TdHJpbmcoMikucGFkU3RhcnQoMTYsIDApO1xufVxuXG4vKipcbiAqIEdpdmVuIGEgbnVtYmVyICdOJyBnZW5lcmF0ZSB0aGUgcHJlZml4ZXNcbiAqIGJpbmFyeSBudW1iZXJzIGxlc3MgdGhhbiAnTicgd2lsbCBoYXZlXG4gKiBAZ2VuZXJhdG9yXG4gKiBAcGFyYW0ge251bWJlcn0gblxuICovXG5mdW5jdGlvbiogbGVzc1RoYW5QcmVmaXhlcyhuKSB7XG4gICAgY29uc3QgYSA9IG51bWJlclRvQlN0cihuKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgY2hhciA9IGFbaV07XG4gICAgICAgIHN3aXRjaCAoY2hhcikge1xuICAgICAgICAgICAgY2FzZSAnMSc6XG4gICAgICAgICAgICAgICAgeWllbGQgYS5zdWJzdHJpbmcoMCwgaSkgKyAnMCc7XG4gICAgICAgICAgICBjYXNlICcwJzpcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcignZXhwZWN0ZWQgYmluYXJ5IHN0cmluZycpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEdlbmVyYXRlIHRoZSBjc3Mgc3R5bGVzIHRvIGhpZ2hsaWdodCB0aGUgZ2l2ZW4gcmFuZ2VcbiAqIEBwYXJhbSB7bnVtYmVyfSBzdGFydFxuICogQHBhcmFtIHtudW1iZXJ9IGVuZFxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gZ2VuZXJhdGVIaWdobGlnaHRSdWxlcyhzdGFydCwgZW5kKSB7XG4gICAgY29uc3Qgc2V0U3R5bGUgPSBbXVxuICAgIGNvbnN0IHVuc2V0U3R5bGUgPSBbXTtcbiAgICBzZXRTdHlsZS5wdXNoKGBzcGFuW2RhdGEtbGMtc3RhcnRePVwiMGIke251bWJlclRvQlN0cihzdGFydCl9XCJdYCk7XG4gICAgc2V0U3R5bGUucHVzaChgc3BhbltkYXRhLWxjLWVuZF49XCIwYiR7bnVtYmVyVG9CU3RyKGVuZCl9XCJdYCk7XG4gICAgZm9yIChjb25zdCBsZXNzVGhhblByZWZpeCBvZiBsZXNzVGhhblByZWZpeGVzKGVuZCkpIHtcbiAgICAgICAgc2V0U3R5bGUucHVzaChgc3BhbltkYXRhLWxjLXN0YXJ0Xj1cIjBiJHtsZXNzVGhhblByZWZpeH1cIl1gKTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBsZXNzVGhhblByZWZpeCBvZiBsZXNzVGhhblByZWZpeGVzKHN0YXJ0KSkge1xuICAgICAgICB1bnNldFN0eWxlLnB1c2goYHNwYW5bZGF0YS1sYy1lbmRePVwiMGIke2xlc3NUaGFuUHJlZml4fVwiXWApO1xuICAgIH1cbiAgICBsZXQgc3R5bGUgPSAnJztcbiAgICBzdHlsZSArPSBgJHtzZXRTdHlsZS5qb2luKCcsXFxuJyl9IHsgYmFja2dyb3VuZC1jb2xvcjogbGlnaHRza3libHVlOyB9XFxuYDtcbiAgICBzdHlsZSArPSBgJHt1bnNldFN0eWxlLmpvaW4oJyxcXG4nKX0geyBiYWNrZ3JvdW5kLWNvbG9yOiB1bnNldCB9XFxuYDtcbiAgICByZXR1cm4gc3R5bGU7XG59XG5cbmV4cG9ydHMuZ2VuZXJhdGVIaWdobGlnaHRSdWxlcyA9IGdlbmVyYXRlSGlnaGxpZ2h0UnVsZXM7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9nZW5lcmF0ZUhpZ2hsaWdodFJ1bGVzLmpzXG4vLyBtb2R1bGUgaWQgPSAyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImNvbnN0IFNFTF9TVEFSVCA9ICc+Pic7XG5jb25zdCBTRUxfRU5EID0gJzw8JztcblxubGV0IGZpYiA9IGBcbmxldFxuICBUcnVlID0gIM67YS7Ou2IuYSxcbiAgRmFsc2UgPSDOu2EuzrtiLmIsXG4gIGlzWmVybyA9IM67bi5uICjOu18uRmFsc2UpIFRydWUsXG4gIG1pbnVzT25lID0gzrtuLs67Zi7Ou3gubiAozrtnLs67aC5oIChnIGYpKSAozrtfLngpICjOu2kuaSksXG4gIG1pbnVzID0gzrttLs67bi4gbiBtaW51c09uZSBtLFxuICBtaW51c1R3byA9IM67bi5taW51cyBuIDIsXG4gIGxlc3NPckVxdWFsID0gzrtuLs67bS4gaXNaZXJvIChtaW51cyBtIG4pLFxuICBsZXFPbmUgPSBsZXNzT3JFcXVhbCAxLFxuICBhZGQgPSDOu24uzrttLijOu2Yuzrt4Lm0gZiAobiBmIHgpKSxcbiAgJHtTRUxfU1RBUlR9ZmliRml4ID0gzrtmaWIuzrtuLiAoXG4gICAgKGlzWmVybyBuKVxuICAgICAgKM67Xy4wKVxuICAgICAgKM67Xy5sZXFPbmUgblxuICAgICAgICAxXG4gICAgICAgIChhZGRcbiAgICAgICAgICAoZmliIGZpYiAobWludXNPbmUgbikpXG4gICAgICAgICAgKGZpYiBmaWIgKG1pbnVzVHdvIG4pKVxuICAgICAgICApXG4gICAgICApXG4gICAgKSBUcnVlJHtTRUxfRU5EfSxcbiAgZmliID0gZmliRml4IGZpYkZpeFxuaW5cbiAgZmliIDhcbmA7XG5jb25zdCBzZWxlY3Rpb25TdGFydCA9IGZpYi5pbmRleE9mKFNFTF9TVEFSVCk7XG5maWIgPSBmaWIucmVwbGFjZShTRUxfU1RBUlQsICcnKTtcbmNvbnN0IHNlbGVjdGlvbkVuZCA9IGZpYi5pbmRleE9mKFNFTF9FTkQpO1xuZmliID0gZmliLnJlcGxhY2UoU0VMX0VORCwgJycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZmliLFxuICBzZWxlY3Rpb25TdGFydCxcbiAgc2VsZWN0aW9uRW5kLFxufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2V4YW1wbGVzL2ZpYm9uYWNjaS5qc1xuLy8gbW9kdWxlIGlkID0gM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiXSwic291cmNlUm9vdCI6IiJ9