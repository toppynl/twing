const parser = require('regex-parser');

/**
 * @param {string} input
 * @returns {RegExp}
 */
export function parseRegularExpression(input: string): RegExp {
    return parser(input);
}
