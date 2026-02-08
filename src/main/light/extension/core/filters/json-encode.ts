import {iteratorToHash} from "../../../helpers/iterator-to-hash";
import {iteratorToArray} from "../../../helpers/iterator-to-array";
import {isPlainObject} from "../../../helpers/is-plain-object";
import {iteratorToMap} from "../../../helpers/iterator-to-map";
import {isTraversable} from "../../../helpers/is-traversable";
import {TwingCallable, TwingSynchronousCallable} from "../../../callable-wrapper";

function isPureArray(map: Map<any, any>): boolean {
    let result: boolean = true;

    let keys: any[] = Array.from(map.keys());
    let i: number = 0;

    while (result && (i < keys.length)) {
        let key: any = keys[i];

        result = (Number(key) === i);

        i++;
    }

    return result;
}

export const jsonEncode: TwingCallable = (_executionContext, value: any): Promise<string> => {
    const _sanitize = (value: any): any => {
        if (isTraversable(value) || isPlainObject(value)) {
            value = iteratorToMap(value);
        }

        if (value instanceof Map) {
            let sanitizedValue: any;

            if (isPureArray(value)) {
                value = iteratorToArray(value);

                sanitizedValue = [];

                for (const key in value) {
                    sanitizedValue.push(_sanitize(value[key]));
                }
            }
            else {
                value = iteratorToHash(value);

                sanitizedValue = {};

                for (let key in value) {

                    sanitizedValue[key] = _sanitize(value[key]);
                }
            }

            value = sanitizedValue;
        }

        return value;
    };

    return Promise.resolve(JSON.stringify(_sanitize(value)));
}

export const jsonEncodeSynchronously: TwingSynchronousCallable = (_executionContext, value: any): string => {
    const _sanitize = (value: any): any => {
        if (isTraversable(value) || isPlainObject(value)) {
            value = iteratorToMap(value);
        }

        if (value instanceof Map) {
            let sanitizedValue: any;

            if (isPureArray(value)) {
                value = iteratorToArray(value);

                sanitizedValue = [];

                for (const key in value) {
                    sanitizedValue.push(_sanitize(value[key]));
                }
            }
            else {
                value = iteratorToHash(value);

                sanitizedValue = {};

                for (let key in value) {

                    sanitizedValue[key] = _sanitize(value[key]);
                }
            }

            value = sanitizedValue;
        }

        return value;
    };

    return JSON.stringify(_sanitize(value));
}
