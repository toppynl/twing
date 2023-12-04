import {iteratorToMap} from "../../../helpers/iterator-to-map";
import {TwingCallable} from "../../../callable-wrapper";

/**
 * Returns the keys of the passed array.
 *
 * @param _executionContext
 * @param values An array
 *
 * @returns {Promise<Array<any>>} The keys
 */
export const keys: TwingCallable<[
    values: Array<any>
], Array<any>> = (
    _executionContext,
    values
) => {
    let traversable;

    if ((values === null) || (values === undefined)) {
        traversable = new Map();
    } else {
        traversable = iteratorToMap(values);
    }

    return Promise.resolve([...traversable.keys()]);
};
