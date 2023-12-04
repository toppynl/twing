import {TwingCallable} from "../../../callable-wrapper";

/**
 * Return the absolute value of a number.
 *
 * @param _executionContext
 * @param x
 * @returns {Promise<number>}
 */
export const abs: TwingCallable = (_executionContext, x: number): Promise<number> => {
    return Promise.resolve(Math.abs(x));
};
