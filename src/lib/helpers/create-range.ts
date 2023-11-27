import {iteratorToMap} from "./iterator-to-map";

const phpRange = require('locutus/php/array/range');

export function createRange<V>(low: V, high: V, step: number): Map<number, V> {
    let range: V[] = phpRange(low, high, step);

    return iteratorToMap(range);
}
