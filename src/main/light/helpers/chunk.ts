import {iterate, iterateSynchronously} from "./iterate";

/**
 * Split an hash into chunks.
 *
 * @param {*} hash
 * @param {number} size
 * @param {boolean} preserveKeys
 * @returns {Promise<Array<Map<any, any>>>}
 */
export async function chunk(hash: any, size: number, preserveKeys: boolean): Promise<Array<Map<any, any>>> {
    let result: Array<Map<any, any>> = [];
    let count = 0;
    let currentMap: Map<any, any> | null;

    await iterate(hash, (key: any, value: any) => {
        if (!currentMap) {
            currentMap = new Map();

            result.push(currentMap);
        }

        currentMap.set(preserveKeys ? key : count, value);

        count++;

        if (count >= size) {
            count = 0;
            currentMap = null;
        }

        return Promise.resolve();
    });

    return result;
}

/**
 * Split an hash into chunks, synchronously.
 *
 * @param {*} hash
 * @param {number} size
 * @param {boolean} preserveKeys
 */
export function chunkSynchronously(hash: any, size: number, preserveKeys: boolean): Array<Map<any, any>> {
    let result: Array<Map<any, any>> = [];
    let count = 0;
    let currentMap: Map<any, any> | null;

    iterateSynchronously(hash, (key: any, value: any) => {
        if (!currentMap) {
            currentMap = new Map();

            result.push(currentMap);
        }

        currentMap.set(preserveKeys ? key : count, value);

        count++;

        if (count >= size) {
            count = 0;
            currentMap = null;
        }
    });

    return result;
}

