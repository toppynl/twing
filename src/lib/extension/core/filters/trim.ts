import {createRuntimeError} from "../../../error/runtime";

const phpTrim = require('locutus/php/strings/trim');
const phpLeftTrim = require('locutus/php/strings/ltrim');
const phpRightTrim = require('locutus/php/strings/rtrim');

/**
 * Returns a trimmed string.
 *
 * @returns {Promise<string>}
 *
 * @throws TwingErrorRuntime When an invalid trimming side is used (not a string or not 'left', 'right', or 'both')
 */
export const trim = (string: string, characterMask: string | null, side: string): Promise<string> => {
    const _do = (): string => {
        if (characterMask === null) {
            characterMask = " \t\n\r\0\x0B";
        }

        switch (side) {
            case 'both':
                return phpTrim(string, characterMask);
            case 'left':
                return phpLeftTrim(string, characterMask);
            case 'right':
                return phpRightTrim(string, characterMask);
            default:
                throw createRuntimeError('Trimming side must be "left", "right" or "both".');
        }
    };

    try {
        return Promise.resolve(_do());
    }
    catch (error: any) {
        return Promise.reject(error);
    }
};
