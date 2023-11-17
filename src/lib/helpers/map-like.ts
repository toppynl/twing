import {isAContext, TwingContext} from "../context";

export type MapLike<K, V> = Map<K, V> | TwingContext<K, V>;

export function isMapLike(candidate: any): candidate is MapLike<any, any> {
    return ((candidate instanceof Map) || isAContext(candidate));
}
