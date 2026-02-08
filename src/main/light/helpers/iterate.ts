export type IterateCallback = (key: any, value: any) => Promise<void>;
export type SynchronousIterateCallback = (key: any, value: any) => void;

/**
 * Executes the provided function once for each element of an iterable.
 *
 * @param {*} iterable An iterable
 * @param {IterateCallback} callback Callback to execute for each element, taking a key and a value as arguments
 *
 * @return {void}
 */
export const iterate = async (iterable: any, callback: IterateCallback): Promise<void> => {
    if (iterable.entries) {
        for (const [key, value] of iterable.entries()) {
            await callback(key, value);
        }
    }
    else if (typeof iterable[Symbol.iterator] === 'function') {
        let i: number = 0;

        for (let value of iterable) {
            await callback(i++, value);
        }
    }
    else if (typeof iterable['next'] === 'function') {
        let i: number = 0;
        let next: any;

        while ((next = await iterable.next()) && !next.done) {
            await callback(i++, next.value)
        }
    }
    else {
        for (const key in iterable) {
            await callback(key, iterable[key]);
        }
    }
}

export const iterateSynchronously = (iterable: any, callback: SynchronousIterateCallback): void => {
    // todo: maybe useless when we pass records instead of TwingContext
    if (iterable.entries) {
        for (const [key, value] of iterable.entries()) {
            callback(key, value);
        }
    }
    else if (typeof iterable[Symbol.iterator] === 'function') {
        let i: number = 0;

        for (let value of iterable) {
            callback(i++, value);
        }
    }
    // todo: check why this is not covered anymore
    // else if (typeof iterable['next'] === 'function') {
    //     let i: number = 0;
    //     let next: any;
    //
    //     while ((next = iterable.next()) && !next.done) {
    //         callback(i++, next.value)
    //     }
    // }
    else {
        for (const key in iterable) {
            callback(key, iterable[key]);
        }
    }
}

