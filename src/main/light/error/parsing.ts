import {createBaseError, TwingErrorLocation, TwingBaseError} from "./base";
import type {TwingSource} from "../source";
import Levenshtein from "levenshtein";

export const parsingErrorName = 'TwingParsingError';

export interface TwingParsingError extends TwingBaseError<typeof parsingErrorName> {
    /**
     * Tweaks the error message to include suggestions.
     *
     * @param {string} name The original name of the item that does not exist
     * @param {Array<string>} items An array of possible items
     */
    addSuggestions(name: string, items: Array<string>): void;
}

export const createParsingError = (
    message: string, location: TwingErrorLocation, source: TwingSource, previous?: Error
): TwingParsingError => {
    const baseError = createBaseError(parsingErrorName, message, location, source, previous);

    Error.captureStackTrace(baseError, createParsingError);

    return Object.create(baseError, {
        addSuggestions: {
            value: (name: string, items: Array<string>) => {
                const alternatives: string[] = [];
                
                for (const item of items) {
                    const levenshtein = new Levenshtein(name, item);

                    if (levenshtein.distance <= (name.length / 3) || item.indexOf(name) > -1) {
                        alternatives.push(item);
                    }
                }

                if (alternatives.length < 1) {
                    return;
                }

                alternatives.sort();

                baseError.appendMessage(` Did you mean "${alternatives.join(', ')}"?`);
            }
        }
    });
};
