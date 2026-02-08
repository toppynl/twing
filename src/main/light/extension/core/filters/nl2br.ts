import type {TwingMarkup} from "../../../markup";
import {createMarkup} from "../../../markup";
import {TwingCallable, TwingSynchronousCallable} from "../../../callable-wrapper";

import phpNl2br from "locutus/php/strings/nl2br";

export const nl2br: TwingCallable = (_executionContext, ...args: Array<any>): Promise<TwingMarkup> => {
    return Promise.resolve(createMarkup(phpNl2br(...args)));
};

export const nl2brSynchronously: TwingSynchronousCallable = (_executionContext, ...args: Array<any>): TwingMarkup => {
    return createMarkup(phpNl2br(...args));
};
