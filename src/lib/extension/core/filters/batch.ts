import {chunk} from "../../../helpers/chunk";
import {fillMap} from "../../../helpers/fill-map";

/**
 * Batches item.
 *
 * @param {any[]} items An array of items
 * @param {number} size  The size of the batch
 * @param {any} fill A value used to fill missing items
 * @param {boolean} preserveKeys
 *
 * @returns Promise<Map<any, any>[]>
 */
export const batch = (items: Array<any>, size: number, fill: any, preserveKeys: boolean): Promise<Array<Map<any, any>>> => {
    if ((items === null) || (items === undefined)) {
        return Promise.resolve([]);
    }

    return chunk(items, size, preserveKeys).then((chunks) => {
        if (fill !== null && chunks.length) {
            const last = chunks.length - 1;
            const lastChunk: Map<any, any> = chunks[last];

            fillMap(lastChunk, size, fill);
        }

        return chunks;
    });
};
