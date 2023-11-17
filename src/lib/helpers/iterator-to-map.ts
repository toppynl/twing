/**
 * Converts input to Map.
 *
 * @param {*} thing
 * @returns {Map<any, any>}
 */
export const iteratorToMap = (thing: any): Map<any, any> => {
    if (thing.entries) {
        return new Map(thing.entries());
    }
    else {
        const result: Map<any, any> = new Map();

        if (typeof thing[Symbol.iterator] === 'function') {
            let i: number = 0;

            for (const value of thing) {
                result.set(i++, value);
            }
        }
        else {
            for (const key in thing) {
                result.set(key, thing[key]);
            }
        }

        return result;
    }
};
