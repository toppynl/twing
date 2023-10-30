import {TwingSource} from "../../src/lib/source";
import {TwingLoaderNull} from "../../src/lib/loader/null";

export class MockLoader extends TwingLoaderNull {
    getSourceContext() {
        return Promise.resolve(new TwingSource('', ''));
    }

    getCacheKey() {
        return Promise.resolve('');
    }

    isFresh() {
        return Promise.resolve(true);
    }

    exists() {
        return Promise.resolve(true);
    }
}
