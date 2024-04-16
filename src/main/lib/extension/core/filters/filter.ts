import {iteratorToMap} from "../../../helpers/iterator-to-map";
import {TwingCallable} from "../../../callable-wrapper";

export const filter: TwingCallable = async (_executionContext, map: any, callback: (...args: Array<any>) => Promise<boolean>): Promise<Map<any, any>> => {
    const result: Map<any, any> = new Map();

    map = iteratorToMap(map);

    for (const [key, value] of map) {
        if (await callback(value)) {
            result.set(key, value);
        }
    }

    return Promise.resolve(result);
};
