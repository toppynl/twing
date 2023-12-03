import {createRange} from "../../../helpers/create-range";
import {TwingCallable} from "../../../callable-wrapper";

type Range<V = any> = TwingCallable<[
    low: V,
    high: V,
    step: number
], Map<number, V>>;

export const range: Range = (_executionContext, low, high, step) => {
    return Promise.resolve(createRange(low, high, step));
}
