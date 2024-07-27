import {createMarkup, TwingMarkup} from "../../../markup";
import type {TwingCallable} from "../../../callable-wrapper";
import {escapeValue, escapeValueSynchronously} from "../../../helpers/escape-value";
import {TwingSynchronousCallable} from "../../../callable-wrapper";

export const escape: TwingCallable<[
    value: string | TwingMarkup | null,
    strategy: string | null
], string | boolean | TwingMarkup | null> = (
    executionContext,
    value,
    strategy
) => {
    if (strategy === null) {
        strategy = "html";
    }
    
    const {template, environment} = executionContext;

    // todo: probably we need to use traceable method
    return escapeValue(template, environment, value, strategy, environment.charset)
        .then((value) => {
            if (typeof value === "string") {
                return createMarkup(value, environment.charset);
            }

            return value;
        });
};

export const escapeSynchronously: TwingSynchronousCallable<[
    value: string | TwingMarkup | null,
    strategy: string | null
], string | boolean | TwingMarkup | null> = (
    executionContext,
    value,
    strategy
) => {
    if (strategy === null) {
        strategy = "html";
    }

    const {template, environment} = executionContext;

    // todo: probably we need to use traceable method
    const escapedValue = escapeValueSynchronously(template, environment, value, strategy, environment.charset);

    if (typeof escapedValue === "string") {
        return createMarkup(escapedValue, environment.charset);
    }

    return escapedValue;
};
