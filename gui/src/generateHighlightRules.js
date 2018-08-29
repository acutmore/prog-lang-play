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
