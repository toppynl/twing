import {TwingContext} from "../context";

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
