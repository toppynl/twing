import {isTraversable} from "./is-traversable";
import {iteratorToHash} from "./iterator-to-hash";
import {count} from "./count";

export const isBoolean = (candidate: any): boolean => {
    return candidate === true || candidate === false;
};

export const isFloat = (candidate: any): boolean => {
    return +candidate === candidate && (!isFinite(candidate) || !!(candidate % 1));
};

/**
 * Adapted from https://github.com/kvz/locutus/blob/master/src/php/var/var_dump.js
 */
export const varDump = (...args: any[]): string => {
    let padChar = ' ';
    let padVal = 4;
    let length = 0;

    let getInnerVal = function _getInnerVal(val: any) {
        let result = '';

        if (val === null || typeof val === 'undefined') {
            result = 'NULL';
        } else if (typeof val === 'boolean') {
            result = 'bool(' + val + ')';
        } else if (typeof val === 'number') {
            if (parseFloat('' + val) === parseInt('' + val, 10)) {
                result = 'int(' + val + ')';
            } else {
                result = 'float(' + val + ')';
            }
        } else if (typeof val === 'function') {
            result = 'object(Closure) (0) {}';
        } else {
            result = 'string(' + val.length + ') "' + val + '"';
        }

        return result;
    };

    let formatArray = (obj: any, curDepth: number) => {
        if (isTraversable(obj)) {
            obj = iteratorToHash(obj);
        }

        let baseCount = padVal * (curDepth);
        let thickCount = padVal * (curDepth + 1);

        let basePad = padChar.repeat(baseCount);
        let thickPad = padChar.repeat(thickCount);

        let str: string = '';
        let val: string;

        if (typeof obj === 'object' && obj !== null) {
            length = count(obj);

            str += 'array(' + length + ') {\n';

            for (let key in obj) {
                let objVal = obj[key];

                if ((typeof objVal === 'object') && (objVal !== null) && !(objVal instanceof Date)) {
                    str += thickPad;
                    str += '[';
                    str += key;
                    str += '] =>\n';
                    str += thickPad;
                    str += formatArray(objVal, curDepth + 1);
                } else {
                    val = getInnerVal(objVal);
                    str += thickPad;
                    str += '[';
                    str += key;
                    str += '] =>\n';
                    str += thickPad;
                    str += val;
                    str += '\n';
                }
            }

            str += basePad + '}\n';
        } else {
            str = getInnerVal(obj) + '\n';
        }

        return str;
    };

    let output: string[] = [];

    for (let arg of args) {
        output.push(formatArray(arg, 0));
    }

    return output.join('');
};
