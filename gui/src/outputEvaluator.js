
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
