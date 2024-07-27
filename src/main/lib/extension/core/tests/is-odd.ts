import {TwingCallable, TwingSynchronousCallable} from "../../../callable-wrapper";

export const isOdd: TwingCallable<[value: any], boolean> = (_executionContext, value) => {
    return Promise.resolve(value % 2 === 1);
};

export const isOddSynchronously: TwingSynchronousCallable<[value: any], boolean> = (_executionContext, value) => {
    return value % 2 === 1;
};
