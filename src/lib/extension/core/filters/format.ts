import {TwingCallable} from "../../../callable-wrapper";

const sprintf = require('locutus/php/strings/sprintf');

export const format: TwingCallable = (_executionContext, ...args: any[]): Promise<string> => {
    return Promise.resolve(sprintf(...args.map((arg) => {
        return arg.toString();
    })));
};
