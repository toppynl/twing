import {TwingCallable, TwingSynchronousCallable} from "../../../callable-wrapper";

const checkInstanceOf = (value: any, constructor: any): boolean => {
    if (typeof constructor !== 'function') {
        throw new Error(
            `The "instanceof" test expects a constructor function as its argument, got "${typeof constructor}".`
        );
    }
    return value instanceof constructor;
};

export const isInstanceOf: TwingCallable<[value: any, constructor: any], boolean> = (_executionContext, value, constructor) => {
    return Promise.resolve(checkInstanceOf(value, constructor));
};

export const isInstanceOfSynchronously: TwingSynchronousCallable<[value: any, constructor: any], boolean> = (_executionContext, value, constructor) => {
    return checkInstanceOf(value, constructor);
};
