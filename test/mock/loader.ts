import {createSource} from "../../src/lib/source";
import {TwingLoader} from "../../src/lib/loader";

export const createMockedLoader = (): TwingLoader => {
    return {
        getSourceContext() {
            return Promise.resolve(createSource('', ''));
        },
        getCacheKey() {
            return Promise.resolve('');
        },
        isFresh() {
            return Promise.resolve(true);
        },
        exists() {
            return Promise.resolve(true);
        },
        resolve() {
            return Promise.resolve(null);
        }
    };
};
