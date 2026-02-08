import {TwingCallable, TwingSynchronousCallable} from "../../../callable-wrapper";

import sprintf from "locutus/php/strings/sprintf";

export const format: TwingCallable = (_executionContext, ...args: any[]): Promise<string> => {
    return Promise.resolve(sprintf(...args.map((arg) => {
        return arg.toString();
    })));
};

export const formatSynchronously: TwingSynchronousCallable = (_executionContext, ...args: any[]): string => {
    return sprintf(...args.map((arg) => {
        return arg.toString();
    }));
};
