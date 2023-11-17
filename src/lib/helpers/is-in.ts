import {compare as compareHelper} from "./compare";
import {isTraversable} from "./is-traversable";
import {iteratorToArray} from "./iterator-to-array";
import {isAMarkup, TwingMarkup} from "../markup";
import {isMapLike} from "./map-like";

export function isIn(value: number | string | object | TwingMarkup, compare: string | object | TwingMarkup): boolean {
    let result = false;

    if (isAMarkup(value)) {
        value = value.toString();
    }

    if (isAMarkup(compare)) {
        compare = compare.toString();
    }

    if (isMapLike(compare)) {
        for (let [, item] of (compare as Map<number, any>)) {
            if (compareHelper(item, value)) {
                result = true;
                break;
            }
        }
    } else if (typeof compare === 'string' && (typeof value === 'string' || typeof value === 'number')) {
        result = (value === '' || compare.includes('' + value));
    } else if (isTraversable(compare)) {
        for (let item of iteratorToArray(compare)) {
            if (compareHelper(item, value)) {
                result = true;
                break;
            }
        }
    } else if (typeof compare === 'object') {
        for (const key in compare) {
            if (compareHelper((compare as any)[key], value)) {
                result = true;
                break;
            }
        }
    }

    return result;
}
