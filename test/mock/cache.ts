import {TwingCacheNull} from "../../src/lib/cache/null";
import {MockTemplate} from "./template";

export class MockCache extends TwingCacheNull {
    generateKey() {
        return Promise.resolve('key');
    }

    write() {
        return Promise.resolve();
    }

    load() {
        let templates = new Map([
            [0, MockTemplate]
        ]);

        return Promise.resolve(() => {
            return templates;
        });
    }

    getTimestamp() {
        return Promise.resolve(0);
    }
}
