import {iteratorToMap} from "../../../helpers/iterator-to-map";
import {TwingCallable, TwingSynchronousCallable} from "../../../callable-wrapper";

export const find: TwingCallable = async (_executionContext, map: any, callback: (...args: any[]) => Promise<boolean>): Promise<any> => {
    map = iteratorToMap(map);

    for (const [key, value] of map) {
        if (await callback(value, key)) {
            return value;
        }
    }

    return null;
};

export const findSynchronously: TwingSynchronousCallable = (_executionContext, map: any, callback: (...args: any[]) => boolean): any => {
    map = iteratorToMap(map);

    for (const [key, value] of map) {
        if (callback(value, key)) {
            return value;
        }
    }

    return null;
};
