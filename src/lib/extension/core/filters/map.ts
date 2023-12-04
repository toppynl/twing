import {iteratorToMap} from "../../../helpers/iterator-to-map";
import {TwingCallable} from "../../../callable-wrapper";

export const map: TwingCallable<[
    map: any,
    callback: (...args: Array<any>) => Promise<any>
], Map<any, any>> = async (_executionContext, map, callback) => {
    const result: Map<any, any> = new Map();

    map = iteratorToMap(map);

    for (const [key, value] of map) {
        result.set(key, await callback(value, key));
    }

    return Promise.resolve(result);
};
