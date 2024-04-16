import {TwingCallable} from "../../../callable-wrapper";

export const isSameAs: TwingCallable<[a: any, comparand: any], boolean> = (_executionContext, a, comparand) => {
    return Promise.resolve(a === comparand);
};
