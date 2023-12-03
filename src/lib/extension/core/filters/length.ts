import {TwingCallable} from "../../../callable-wrapper";

/**
 * Returns the length of a thing.
 *
 * @param {any} thing A thing
 *
 * @returns {Promise<number>} The length of the thing
 */
export const length: TwingCallable = (_executionContext,thing: any): Promise<number> => {
    let length: number;

    if ((thing === null) || (thing === undefined)) {
        length = 0;
    } else if (thing.length !== undefined) {
        length = thing.length;
    } else if (thing.size !== undefined) {
        length = thing.size;
    } else if (thing.toString && (typeof thing.toString === 'function')) {
        length = thing.toString().length;
    } else {
        length = 1;
    }

    return Promise.resolve(length);
};
