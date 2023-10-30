const parser = require('regex-parser');

/**
 * @param {string} input
 * @returns {RegExp}
 */
export function parseRegularExpression(input: string) {
    return parser(input);
}
