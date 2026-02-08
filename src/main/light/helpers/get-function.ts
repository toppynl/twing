import type {TwingFunction} from "../function";
import {TwingSynchronousFunction} from "../function";

/**
 * Get a function by name.
 *
 * @param {string} name         function name
 * @returns {TwingFunction}     A TwingFunction instance or null if the function does not exist
 */
export const getFunction = <Function extends TwingFunction | TwingSynchronousFunction>(
    functions: Map<string, Function>,
    name: string
): Function | null => {
    const result = functions.get(name);

    if (result) {
        return result;
    }

    for (let [pattern, twingFunction] of functions) {
        let count: number = 0;

        pattern = pattern.replace(/\*/g, function () {
            count++;

            return '(.*?)';
        });

        if (count) {
            const regExp = new RegExp('^' + pattern + '$', 'g');
            const match = regExp.exec(name);
            const matches = [];

            if (match) {
                for (let i = 1; i <= count; i++) {
                    matches.push(match[i]);
                }

                twingFunction.nativeArguments = matches;

                return twingFunction;
            }
        }
    }

    return null;
}
