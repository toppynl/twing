import {TwingContext} from "../context";
import {iteratorToMap} from "./iterator-to-map";

export type MapLike<K, V> = Map<K, V> | TwingContext<K, V>;

export function isAMapLike(candidate: any): candidate is MapLike<any, any> {
    return candidate !== null &&
        candidate !== undefined &&
        (candidate as MapLike<any, any>).delete !== undefined &&
        (candidate as MapLike<any, any>).get !== undefined &&
        (candidate as MapLike<any, any>).has !== undefined &&
        (candidate as MapLike<any, any>).set !== undefined &&
        (candidate as MapLike<any, any>).entries !== undefined;
}

export const every = async (
    iterable: MapLike<any, any> | Array<any>,
    comparator: (value: any, key: any) => Promise<boolean>
): Promise<boolean> => {
    if (Array.isArray(iterable)) {
        iterable = iteratorToMap(iterable);
    }

    for (const [key, value] of iterable) {
        if (await comparator(value, key) === false) {
            return false;
        }
    }

    return true;
};

export const some = async (
    iterable: MapLike<any, any> | Array<any>,
    comparator: (value: any, key: any) => Promise<boolean>
): Promise<boolean> => {
    if (Array.isArray(iterable)) {
        iterable = iteratorToMap(iterable);
    }
    
    for (const [key, value] of iterable) {
        if (await comparator(value, key) === true) {
            return true;
        }
    }

    return false;
};