const sprintf = require('locutus/php/strings/sprintf');

export const format = (...args: any[]): Promise<string> => {
    return Promise.resolve(sprintf(...args.map((arg) => {
        return arg.toString();
    })));
};
