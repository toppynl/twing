import type {TwingCallable} from "../../../callable-wrapper";
import {TwingSynchronousCallable} from "../../../callable-wrapper";

export const isDivisibleBy: TwingCallable<[a: any, divisor: any], boolean> = (_executionContext, a, divisor) => {
    return Promise.resolve(a % divisor === 0);
};

export const isDivisibleBySynchronously: TwingSynchronousCallable<[a: any, divisor: any], boolean> = (_executionContext, a, divisor) => {
    return a % divisor === 0;
};
