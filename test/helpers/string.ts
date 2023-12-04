/**
 * Convert a Unicode Codepoint to a literal UTF-8 character.
 *
 * @param {number} codepoint Unicode codepoint in hex notation
 *
 * @return string UTF-8 literal string
 */
export const codepointToUtf8 = (codepoint: number): string => {
    if (codepoint < 0x110000) {
        return String.fromCharCode(codepoint);
    }

    throw new Error('Codepoint requested outside of Unicode range.');
};
