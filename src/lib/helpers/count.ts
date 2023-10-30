export type Countable = {
    length: number;
} | {
    size: number;
} | any;

export const isCountable = (thing: any): thing is Countable => {
    return typeof thing === "object";
};

/**
 * Count all elements in an object.
 *
 * @param {*} countable
 * @returns {number}
 */
export const count = (countable: Countable) => {
    if (countable.length !== undefined) {
        return countable.length;
    } else if (countable.size !== undefined) {
        return countable.size;
    }

    return Object.keys(countable).length;
}
