
const timeoutMs = 10 * 1000;

const workerScript = (function(){
    self.onmessage=function(event) {
        const toRun = event.data;
        const program = new Function(`return (${toRun})`);
        const result = program();
        postMessage(result.toString());
    }
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
