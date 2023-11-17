export type Countable = {
    size: number;
} | any;

/**
 * Count all elements in an object.
 *
 * @param {*} countable
 * @returns {number}
 */
export const count = (countable: Countable) => {
    if (countable.size !== undefined) {
        return countable.size;
    }

    return Object.keys(countable).length;
}
