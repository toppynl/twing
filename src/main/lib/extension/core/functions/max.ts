import {iteratorToArray} from "../../../helpers/iterator-to-array";
import {max as phpMax} from "locutus/php/math";
import type {TwingCallable} from "../../../callable-wrapper";

export const max: TwingCallable<[
    ...values: Array<any>
]> = (_executionContext, ...values) => {
    if (values.length === 1) {
        values = values[0];
    }

    return Promise.resolve(phpMax(iteratorToArray(values)));
};
