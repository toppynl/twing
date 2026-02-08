import {TwingCallable, TwingSynchronousCallable} from "../../../callable-wrapper";

import phpStripTags from "locutus/php/strings/strip_tags";

export const striptags: TwingCallable = (_executionContext, input: string, allowedTags: string): Promise<string> => {
    return Promise.resolve(phpStripTags(input, allowedTags));
};

export const striptagsSynchronously: TwingSynchronousCallable = (_executionContext, input: string, allowedTags: string): string => {
    return phpStripTags(input, allowedTags);
};
