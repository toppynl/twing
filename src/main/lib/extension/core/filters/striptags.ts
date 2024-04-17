import {TwingCallable} from "../../../callable-wrapper";

const phpStripTags = require('locutus/php/strings/strip_tags');

export const striptags: TwingCallable = (_executionContext, input: string, allowedTags: string): Promise<string> => {
    return Promise.resolve(phpStripTags(input, allowedTags));
};
