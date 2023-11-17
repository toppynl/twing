import {iteratorToMap} from "../../../helpers/iterator-to-map";

/**
 * Returns the keys of the passed array.
 *
 * @param {Array<any>} array An array
 *
 * @returns {Promise<Array<any>>} The keys
 */

export const keys = (array: Array<any>): Promise<Array<any>> => {
    let traversable;

    if ((array === null) || (array === undefined)) {
        traversable = new Map();
    } else {
        traversable = iteratorToMap(array);
    }

    return Promise.resolve([...traversable.keys()]);
};
