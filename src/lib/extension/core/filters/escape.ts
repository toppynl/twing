import {createMarkup, TwingMarkup} from "../../../markup";
import type {TwingCallable} from "../../../callable-wrapper";

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
    
    const {template, charset} = executionContext;

    return template.escape(value, strategy, charset)
        .then((value) => {
            if (typeof value === "string") {
                return createMarkup(value, charset);
            }

            return value;
        });
};
