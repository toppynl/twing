/**
 * Compare by conforming to PHP loose comparisons rules
 *
 * @see http://php.net/manual/en/types.comparisons.php
 * @see https://stackoverflow.com/questions/47969711/php-algorithm-loose-equality-comparison
 */

import {DateTime} from "luxon";
import {isAMarkup, type TwingMarkup} from "../markup.js";
import {isAMapLike, type MapLike} from "./map-like.js";
import {iteratorToMap} from "./iterator-to-map.js";
import type {TwingContext} from "../context.js";

type Operand = TwingMarkup | DateTime | MapLike<any, any> | string | boolean | number | null | object | Array<any>;

export function compare(
    firstOperand: Operand,
    secondOperand: Operand
): boolean {
    // Array<any>
    if (Array.isArray(firstOperand)) {
        firstOperand = iteratorToMap(firstOperand);
    }

    if (Array.isArray(secondOperand)) {
        secondOperand = iteratorToMap(secondOperand);
    }

    // null
    if (firstOperand === null) {
        return compareToNull(secondOperand);
    }

    if (secondOperand === null) {
        return compareToNull(firstOperand);
    }

    // boolean
    if (typeof firstOperand === 'boolean') {
        return compareToBoolean(firstOperand, secondOperand);
    }

    if (typeof secondOperand === 'boolean') {
        return compareToBoolean(secondOperand, firstOperand);
    }

    // number
    if (typeof firstOperand === 'number') {
        return compareToNumber(firstOperand, secondOperand);
    }

    if (typeof secondOperand === 'number') {
        return compareToNumber(secondOperand, firstOperand);
    }

    // TwingMarkup
    if (isAMarkup(firstOperand)) {
        firstOperand = firstOperand.toString();
    }

    if (isAMarkup(secondOperand)) {
        secondOperand = secondOperand.toString();
    }

    // Map
    if (isAMapLike(firstOperand)) {
        return compareToMap(firstOperand, secondOperand);
    }

    // string
    if (typeof firstOperand === 'string') {
        return compareToString(firstOperand, secondOperand);
    }

    // date
    if (firstOperand instanceof DateTime) {
        return compareToDateTime(firstOperand, secondOperand);
    }

    // fallback to strict comparison
    return firstOperand === secondOperand;
}

/**
 * Compare a Map to something else by conforming to PHP loose comparisons rules
 * ┌─────────┬───────┬───────┬───────┬───────┬───────┬───────┬───────┬───────┬───────┬───────┬─────────┬───────┬───────┐
 * │         │ TRUE  │ FALSE │   1   │   0   │  -1   │  "1"  │  "0"  │ "-1"  │ NULL  │ []    │ ["php"] | "php" │  ""   │
 * ├─────────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┼─────────┼───────┼───────┤
 * │ []      │ FALSE │ TRUE  │ FALSE │ FALSE │ FALSE │ FALSE │ FALSE │ FALSE │ TRUE  │ TRUE  │ FALSE   │ FALSE │ FALSE |
 * │ ["php"] │ TRUE  │ FALSE │ FALSE │ FALSE │ FALSE │ FALSE │ FALSE │ FALSE │ FALSE │ FALSE │ TRUE    │ FALSE │ FALSE |
 * └─────────┴───────┴───────┴───────┴───────┴───────┴───────┴───────┴───────┴───────┴───────┴─────────┴───────┴───────┘
 */
function compareToMap(
    firstOperand: Map<any, any> | TwingContext<any, any>,
    secondOperand: string | object | DateTime | Map<any, any> | TwingContext<any, any>
): boolean {
    if (firstOperand.size === 0) {
        return isAMapLike(secondOperand) && (secondOperand.size === 0);
    }
    else {
        if (!isAMapLike(secondOperand)) {
            return false;
        }
        else if (firstOperand.size !== (secondOperand as Map<any, any>).size) {
            return false;
        }

        let result = false;

        for (let [i, valueItem] of firstOperand) {
            let compareItem = secondOperand.get(i);

            result = compare(valueItem, compareItem);

            if (!result) {
                break;
            }
        }

        return result;
    }
}

/**
 * Compare a boolean to something else by conforming to PHP loose comparisons rules
 * ┌─────────┬───────┬───────┬───────┬───────┬───────┬───────┬───────┬───────┬───────┬─────────┬───────┬───────┐
 * │         │ TRUE  │ FALSE │   1   │   0   │  -1   │  "1"  │  "0"  │ "-1"  │ NULL  │ array() │ "php" │  ""   │
 * ├─────────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┼─────── ─┼───────┼───────┤
 * │ TRUE    │ TRUE  │ FALSE │ TRUE  │ FALSE │ TRUE  │ TRUE  │ FALSE │ TRUE  │ FALSE │ FALSE   │ TRUE  │ FALSE │
 * │ FALSE   │ FALSE │ TRUE  │ FALSE │ TRUE  │ FALSE │ FALSE │ TRUE  │ FALSE │ TRUE  │ TRUE    │ FALSE │ TRUE  │
 * └─────────┴───────┴───────┴───────┴───────┴───────┴───────┴───────┴───────┴───────┴─────────┴───────┴───────┘
 */
function compareToBoolean(
    firstOperand: boolean,
    secondOperand: string | number | boolean | object | TwingMarkup | DateTime | MapLike<any, any>
): boolean {
    if (secondOperand instanceof DateTime) {
        return firstOperand === true;
    }

    if (typeof secondOperand === 'boolean') {
        return firstOperand === secondOperand;
    }

    if (typeof secondOperand === 'number') {
        return firstOperand === (secondOperand !== 0);
    }

    if (typeof secondOperand === 'string') {
        if (secondOperand.length > 1) {
            return firstOperand;
        }
        else {
            let float = parseFloat(secondOperand);

            if (!isNaN(float)) {
                return firstOperand === (float !== 0);
            }
            else {
                return firstOperand === (secondOperand.length > 0);
            }
        }
    }

    if (isAMapLike(secondOperand)) {
        return firstOperand === (secondOperand as Map<any, any>).size > 0;
    }

    return firstOperand === true;
}

/**
 * Compare a DateTime to something else by conforming to PHP loose comparisons rules
 * ┌─────────┬───────┬───────┬───────┬───────┬───────┬───────┬───────┬───────┬───────┬───────┬─────────┬───────┬───────┬───────┬───────┐
 * │         │ TRUE  │ FALSE │   1   │   0   │  -1   │  "1"  │  "0"  │ "-1"  │ NULL  │ []    │ ["php"] | "php" │  ""   │  NOW  | LATER |
 * ├─────────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┼─────────┼───────┼───────┼───────┼───────┤
 * │  NOW    │ FALSE │ FALSE │ FALSE │ FALSE │ FALSE │ FALSE │ FALSE │ FALSE │ FALSE │ FALSE │ FALSE   │ FALSE │ FALSE │ TRUE  │ FALSE │
 * │  LATER  │ FALSE │ FALSE │ FALSE │ FALSE │ FALSE │ FALSE │ FALSE │ FALSE │ FALSE │ FALSE │ FALSE   │ FALSE │ FALSE │ FALSE │ TRUE  │
 * └─────────┴───────┴───────┴───────┴───────┴───────┴───────┴───────┴───────┴───────┴───────┴─────────┴───────┴───────┴───────┴───────┘
 */

function compareToDateTime(
    firstOperand: DateTime,
    secondOperand: DateTime | string | object
): boolean {
    if (secondOperand instanceof DateTime) {
        return firstOperand.valueOf() === secondOperand.valueOf();
    }

    return false;
}

/**
 * Compare null to something else by conforming to PHP loose comparisons rules
 * ┌─────────┬───────┬───────┬───────┬───────┬───────┬───────┬───────┬───────┬───────┬───────┬─────────┬───────┬───────┐
 * │         │ TRUE  │ FALSE │   1   │   0   │  -1   │  "1"  │  "0"  │ "-1"  │ NULL  │ []    │ ["php"] | "php" │  ""   │
 * ├─────────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┼─────────┼───────┼───────┤
 * │ NULL    │ FALSE │ TRUE  │ FALSE │ TRUE  │ FALSE │ FALSE │ FALSE │ FALSE │ TRUE  │ TRUE  │ FALSE   │ FALSE │ TRUE  |
 * └─────────┴───────┴───────┴───────┴───────┴───────┴───────┴───────┴───────┴───────┴───────┴─────────┴───────┴───────┘
 */
function compareToNull(value: Operand) {
    if (typeof value === 'boolean') {
        return (value === false);
    }

    if (typeof value === 'number') {
        return value === 0;
    }

    if (typeof value === 'string') {
        return value.length < 1;
    }

    if (value === null) {
        return true;
    }

    if (isAMapLike(value)) {
        return (value as Map<any, any>).size < 1;
    }

    return false;
}

/**
 * Compare a number to something else by conforming to PHP loose comparisons rules
 * ┌─────────┬───────┬───────┬───────┬───────┬───────┬───────┬───────┬───────┬───────┬─────────┬───────┬───────┐
 * │         │ TRUE  │ FALSE │   1   │   0   │  -1   │  "1"  │  "0"  │ "-1"  │ NULL  │ array() │ "php" │  ""   │
 * ├─────────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┼─────── ─┼───────┼───────┤
 * │ 1       │ TRUE  │ FALSE │ TRUE  │ FALSE │ FALSE │ TRUE  │ FALSE │ FALSE │ FALSE │ FALSE   │ FALSE │ FALSE │
 * │ 0       │ FALSE │ TRUE  │ FALSE │ TRUE  │ FALSE │ FALSE │ TRUE  │ FALSE │ TRUE  │ FALSE   │ TRUE  │ TRUE  │
 * │ -1      │ TRUE  │ FALSE │ FALSE │ FALSE │ TRUE  │ FALSE │ FALSE │ TRUE  │ FALSE │ FALSE   │ FALSE │ FALSE │
 * └─────────┴───────┴───────┴───────┴───────┴───────┴───────┴───────┴───────┴───────┴─────────┴───────┴───────┘
 */
function compareToNumber(
    firstOperand: number,
    secondOperand: string | number | object | TwingMarkup | DateTime | MapLike<any, any>
): boolean {
    if (typeof secondOperand === 'number') {
        return firstOperand === secondOperand;
    }

    if (typeof secondOperand === 'string') {
        let float = parseFloat(secondOperand);

        if (float) {
            return firstOperand === float;
        }
        else {
            return firstOperand === 0;
        }
    }

    // date
    if (secondOperand instanceof DateTime) {
        return firstOperand === 1;
    }

    return false;
}

/**
 * Compare a string to something else by conforming to PHP loose comparisons rules
 * ┌─────────┬───────┬───────┬───────┬───────┬───────┬───────┬───────┬───────┬───────┬─────────┬───────┬───────┐
 * │         │ TRUE  │ FALSE │   1   │   0   │  -1   │  "1"  │  "0"  │ "-1"  │ NULL  │ array() │ "php" │  ""   │
 * ├─────────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┼─────── ─┼───────┼───────┤
 * │ "1"     │ TRUE  │ FALSE │ TRUE  │ FALSE │ FALSE │ TRUE  │ FALSE │ FALSE │ FALSE │ FALSE   │ FALSE │ FALSE │
 * │ "0"     │ FALSE │ TRUE  │ FALSE │ TRUE  │ FALSE │ FALSE │ TRUE  │ FALSE │ FALSE │ FALSE   │ FALSE │ FALSE │
 * │ "-1"    │ TRUE  │ FALSE │ FALSE │ FALSE │ TRUE  │ FALSE │ FALSE │ TRUE  │ FALSE │ FALSE   │ FALSE │ FALSE │
 * │ ""      │ FALSE │ TRUE  │ FALSE │ TRUE  │ FALSE │ FALSE │ FALSE │ FALSE │ TRUE  │ FALSE   │ FALSE │ TRUE  │
 * │ "php"   │ TRUE  │ FALSE │ FALSE │ TRUE  │ FALSE │ FALSE │ FALSE │ FALSE │ FALSE │ FALSE   │ TRUE  │ FALSE │
 * └─────────┴───────┴───────┴───────┴───────┴───────┴───────┴───────┴───────┴───────┴─────────┴───────┴───────┘
 */
function compareToString(
    firstOperand: string,
    secondOperand:  string | object | DateTime | MapLike<any, any>
): boolean {
    if (typeof secondOperand === 'string') {
        return firstOperand === secondOperand;
    }

    return false;
}
