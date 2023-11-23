/**
 * Count all elements in an object.
 *
 * @param {*} countable
 * @returns {number}
 */
export const count = (countable: any) => {
    if (countable.size !== undefined) {
        return countable.size;
    }

    return Object.keys(countable).length;
}
