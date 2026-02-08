import {TwingCallable, TwingSynchronousCallable} from "../../../callable-wrapper";

export const isSameAs: TwingCallable<[a: any, comparand: any], boolean> = (_executionContext, a, comparand) => {
    return Promise.resolve(a === comparand);
};

export const isSameAsSynchronously: TwingSynchronousCallable<[a: any, comparand: any], boolean> = (_executionContext, a, comparand) => {
    return a === comparand;
};
