import {iteratorToArray} from "../../../helpers/iterator-to-array";
import {min as phpMin} from "locutus/php/math";
import type {TwingCallable} from "../../../callable-wrapper";

export const min: TwingCallable<[
    ...values: Array<any>
]> = (_executionContext, ...values) => {
    if (values.length === 1) {
        values = values[0];
    }

    return Promise.resolve(phpMin(iteratorToArray(values)));
};
