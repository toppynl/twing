import {iterate, iterateSynchronously} from "../../../helpers/iterate";
import {createMarkup, TwingMarkup} from "../../../markup";
import {varDump} from "../../../helpers/php";
import type {TwingCallable, TwingSynchronousCallable} from "../../../callable-wrapper";

export const dump: TwingCallable<[
    ...vars: Array<any>
], TwingMarkup> = (executionContext, ...vars) => {
    if (vars.length < 1) {
        const vars_ = new Map();

        return iterate(executionContext.context, (key, value) => {
            vars_.set(key, value);

            return Promise.resolve();
        }).then(() => {
            return createMarkup(varDump(vars_));
        });
    }

    return Promise.resolve(createMarkup(varDump(...vars)));
};

export const dumpSynchronously: TwingSynchronousCallable<[
    ...vars: Array<any>
], TwingMarkup> = (executionContext, ...vars) => {
    if (vars.length < 1) {
        const vars_ = new Map();

        iterateSynchronously(executionContext.context, (key, value) => {
            vars_.set(key, value);
        });
        
        return createMarkup(varDump(vars_));
    }

    return createMarkup(varDump(...vars));
};

