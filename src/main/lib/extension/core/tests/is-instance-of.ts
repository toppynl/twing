import {TwingCallable, TwingSynchronousCallable} from "../../../callable-wrapper";

export const isInstanceOf: TwingCallable<[value: any, constructor: any], boolean> = (_executionContext, value, constructor) => {
    return Promise.resolve(value instanceof constructor);
};

export const isInstanceOfSynchronously: TwingSynchronousCallable<[value: any, constructor: any], boolean> = (_executionContext, value, constructor) => {
    return value instanceof constructor;
};
