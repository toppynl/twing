import {TwingCallable, TwingSynchronousCallable} from "../../../callable-wrapper";

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
export const trim: TwingCallable = (_executionContext, string: string | null, characterMask: string | null, side: string): Promise<string | null> => {
    const _do = (): string | null => {
        if (string === null) {
            return null;
        }
        
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
                throw new Error('Trimming side must be "left", "right" or "both".');
        }
    };

    try {
        return Promise.resolve(_do());
    } catch (error: any) {
        return Promise.reject(error);
    }
};

export const trimSynchronously: TwingSynchronousCallable = (_executionContext, string: string | null, characterMask: string | null, side: string): string | null => {
    if (string === null) {
        return null;
    }
    
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
            throw new Error('Trimming side must be "left", "right" or "both".');
    }
};

