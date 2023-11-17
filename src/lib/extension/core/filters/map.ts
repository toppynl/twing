import {iteratorToMap} from "../../../helpers/iterator-to-map";

export const map = async (map: any, callback: (...args: Array<any>) => Promise<any>): Promise<Map<any, any>> => {
    const result: Map<any, any> = new Map();

    map = iteratorToMap(map);

    for (const [key, value] of map) {
        result.set(key, await callback(value, key));
    }

    return Promise.resolve(result);
};
