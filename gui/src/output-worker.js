/**
 * Web worker script for safely executing generated code
 * - Infinite loops can be terminated
 * - Access can be controlled
 */

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

function churchNumeralToNumber(cn) {
    return cn(acc => acc + 1)(0);
}

self.onmessage=function(event) {
    const trap = new Proxy({}, {
        has: () => true,
        get: (_target, prop) => {
            if (prop === Symbol.unscopables) {
                return {};
            }
            throw new Error(`Unknown symbol '${prop.toString()}'`);
        }
    });
    let result = '';
    try {
        const functionBody = sandboxScript(event.data);
        const program = new Function('trap', functionBody);
        result = program(trap);
    } catch (e) {
        result = e;
    }
    postMessage({
        result: result.toString(),
        number: typeof result === 'function'
            ? churchNumeralToNumber(result).toString()
            : result.toString()
    });
};
