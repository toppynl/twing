import type {TwingSource} from "../source";
import {TwingBaseError} from "./base";

const Levenshtein = require('levenshtein');

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

export class TwingParsingError extends TwingBaseError<typeof parsingErrorName> {
    constructor(message: string, line?: number, column?: number, source?: TwingSource, previous?: Error) {
        super(parsingErrorName, message, line, column, source, previous);
    }

    addSuggestions(name: string, items: Array<string>) {
        const alternatives: string[] = [];

        let levenshtein;

        for (const item of items) {
            levenshtein = new Levenshtein(name, item);

            if (levenshtein.distance <= (name.length / 3) || item.indexOf(name) > -1) {
                alternatives.push(item);
            }
        }

        if (alternatives.length < 1) {
            return;
        }

        alternatives.sort();

        this.appendMessage(` Did you mean "${alternatives.join(', ')}"?`);
    }
}
