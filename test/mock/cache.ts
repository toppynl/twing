import {MockTemplate} from "./template";
import {TwingCache} from "../../src/lib/cache";

export const createMockCache = (): TwingCache => {
    return {
        generateKey: () => {
            return Promise.resolve('key');
        },
        write: () => {
            return Promise.resolve();
        },
        load: () => {
            let templates = new Map([
                [0, () => new MockTemplate()]
            ]);

            return Promise.resolve(templates);
        },
        getTimestamp: () => {
            return Promise.resolve(0);
        }
    };
};
