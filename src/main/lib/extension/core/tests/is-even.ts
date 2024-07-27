import {TwingCallable, TwingSynchronousCallable} from "../../../callable-wrapper";

export const isEven: TwingCallable<[value: any], boolean> = (_executionContext, value) => {
    return Promise.resolve(value % 2 === 0);
};

export const isEvenSynchronously: TwingSynchronousCallable<[value: any], boolean> = (_executionContext, value) => {
    return value % 2 === 0;
};
