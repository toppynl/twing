import {isTraversable} from "../../../helpers/is-traversable";
import {iteratorToMap} from "../../../helpers/iterator-to-map";
import {isPlainObject} from "../../../helpers/is-plain-object";
import {TwingCallable, TwingSynchronousCallable} from "../../../callable-wrapper";

/**
 * Return the values from a single column in the input array.
 *
 * @param {*} thing An iterable
 * @param {*} columnKey The column key
 *
 * @return {Promise<Array<any>>} The array of values
 */
export const column: TwingCallable = (_executionContext, thing: any, columnKey: any): Promise<Array<any>> => {
    let map: Map<any, any>;

    if (!isTraversable(thing) || isPlainObject(thing)) {
        return Promise.reject(new Error(`The column filter only works with arrays or "Traversable", got "${typeof thing}" as first argument.`));
    } else {
        map = iteratorToMap(thing);
    }

    const result: Array<any> = [];

    for (const value of map.values()) {
        const valueAsMap: Map<any, any> = iteratorToMap(value);

        for (const [key, value] of valueAsMap) {
            if (key === columnKey) {
                result.push(value);
            }
        }
    }

    return Promise.resolve(result);
};

export const columnSynchronously: TwingSynchronousCallable = (_executionContext, thing: any, columnKey: any): Array<any> => {
    let map: Map<any, any>;

    if (!isTraversable(thing) || isPlainObject(thing)) {
        throw new Error(`The column filter only works with arrays or "Traversable", got "${typeof thing}" as first argument.`);
    } else {
        map = iteratorToMap(thing);
    }

    const result: Array<any> = [];

    for (const value of map.values()) {
        const valueAsMap: Map<any, any> = iteratorToMap(value);

        for (const [key, value] of valueAsMap) {
            if (key === columnKey) {
                result.push(value);
            }
        }
    }

    return result;
};
