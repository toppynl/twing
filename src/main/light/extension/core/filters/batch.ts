import {chunk, chunkSynchronously} from "../../../helpers/chunk";
import {fillMap} from "../../../helpers/fill-map";
import {TwingCallable, TwingSynchronousCallable} from "../../../callable-wrapper";

/**
 * Batches item.
 *
 * @param _executionContext
 * @param {any[]} items An array of items
 * @param {number} size  The size of the batch
 * @param {any} fill A value used to fill missing items
 * @param {boolean} preserveKeys
 *
 * @returns Promise<Map<any, any>[]>
 */
export const batch: TwingCallable<[
    items: Array<any>,
    size: number,
    fill: any,
    preserveKeys: boolean
], Array<Map<any, any>>> = (_executionContext, items, size, fill, preserveKeys) => {
    if ((items === null) || (items === undefined)) {
        return Promise.resolve([]);
    }
    
    return chunk(items, size, preserveKeys)
        .then((chunks) => {
            if (fill !== null && chunks.length) {
                const last = chunks.length - 1;
                const lastChunk: Map<any, any> = chunks[last];

                fillMap(lastChunk, size, fill);
            }
            
            return chunks;
        });
};

export const batchSynchronously: TwingSynchronousCallable<[
    items: Array<any>,
    size: number,
    fill: any,
    preserveKeys: boolean
], Array<Map<any, any>>> = (_executionContext, items, size, fill, preserveKeys) => {
    if ((items === null) || (items === undefined)) {
        return [];
    }

    const chunks = chunkSynchronously(items, size, preserveKeys);

    if (fill !== null && chunks.length) {
        const last = chunks.length - 1;
        const lastChunk: Map<any, any> = chunks[last];

        fillMap(lastChunk, size, fill);
    }

    return chunks;
};
