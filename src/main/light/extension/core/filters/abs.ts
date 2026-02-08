import {TwingCallable, TwingSynchronousCallable} from "../../../callable-wrapper";

/**
 * Return the absolute value of a number.
 *
 * @param _executionContext
 * @param x
 */
export const abs: TwingCallable = (_executionContext, x: number): Promise<number> => {
    return Promise.resolve(Math.abs(x));
};

export const absSynchronously: TwingSynchronousCallable = (_executionContext, x: number): number => {
    return Math.abs(x);
};
