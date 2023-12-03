import {sortAsynchronously} from "./sort";

/**
 * Sort a map and maintain index association.
 *
 * @param {Map<*, *>} map
 * @param {Function} handler
 * @returns {Map<* ,*>}
 */
export async function asort(map: Map<any, any>, compareFunction?: (a: any, b: any) => Promise<-1 | 0 | 1>) {
    const sortedMap = new Map();
    const keys: Array<any> = ([] as Array<any>).fill(null, 0, map.size);
    const values = [...map.values()];

    let sortedValues: Array<any>;

    if (compareFunction) {
        sortedValues = await sortAsynchronously(values, compareFunction);
    }
    else {
        sortedValues = values.sort();
    }

    for (const [key, value] of map) {
        const index = sortedValues.indexOf(value);

        keys[index] = key;
    }

    for (const key of keys) {
        sortedMap.set(key, map.get(key));
    }

    map.clear();

    for (const [key, value] of sortedMap) {
        map.set(key, value);
    }
}
