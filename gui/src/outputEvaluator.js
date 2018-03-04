
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
