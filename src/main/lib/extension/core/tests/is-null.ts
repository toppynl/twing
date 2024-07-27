import {TwingCallable, TwingSynchronousCallable} from "../../../callable-wrapper";

export const isNull: TwingCallable<[value: any], boolean> = (_executionContext, value) => {
    return Promise.resolve(value === null);
};

export const isNullSynchronously: TwingSynchronousCallable<[value: any], boolean> = (_executionContext, value) => {
    return value === null;
};
