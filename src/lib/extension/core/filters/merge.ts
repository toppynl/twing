import {mergeIterables} from "../../../helpers/merge-iterables";
import {isTraversable} from "../../../helpers/is-traversable";
import {TwingRuntimeError} from "../../../error/runtime";
import {iteratorToMap} from "../../../helpers/iterator-to-map";

/**
 * Merges an array with another one.
 *
 * <pre>
 *  {% set items = { 'apple': 'fruit', 'orange': 'fruit' } %}
 *
 *  {% set items = items|merge({ 'peugeot': 'car' }) %}
 *
 *  {# items now contains { 'apple': 'fruit', 'orange': 'fruit', 'peugeot': 'car' } #}
 * </pre>
 *
 * @param {any} iterable1 An iterable
 * @param {any} source An iterable
 *
 * @return {Promise<Map<any, any>>} The merged map
 */
export const merge = (iterable1: any, source: any): Promise<Map<any, any>> => {
    const isIterable1NullOrUndefined = (iterable1 === null) || (iterable1 === undefined);

    if (isIterable1NullOrUndefined || (!isTraversable(iterable1) && (typeof iterable1 !== 'object'))) {
        return Promise.reject(new TwingRuntimeError(`The merge filter only works on arrays or "Traversable", got "${!isIterable1NullOrUndefined ? typeof iterable1 : iterable1}".`));
    }

    const isSourceNullOrUndefined = (source === null) || (source === undefined);

    if (isSourceNullOrUndefined || (!isTraversable(source) && (typeof source !== 'object'))) {
        return Promise.reject(new TwingRuntimeError(`The merge filter only accepts arrays or "Traversable" as source, got "${!isSourceNullOrUndefined ? typeof source : source}".`));
    }

    return Promise.resolve(mergeIterables(iteratorToMap(iterable1), iteratorToMap(source)));
};
