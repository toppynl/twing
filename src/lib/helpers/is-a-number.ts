/**
 * Check whether a string consists of numerical character(s) only.
 *
 * @param {string} value
 * @return boolean
 */
export function isANumber(value: any): value is number {
    if (typeof value === "number") {
        return true;
    }

    if (typeof value === "string") {
        let regExp: RegExp = /^\d+$/;

        return regExp.test(value);
    }

    return false;
}
