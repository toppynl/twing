import {TwingCacheInterface} from "../cache-interface";
import {TwingTemplatesModule} from "../environment";

/**
 * Implements a no-cache strategy.
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 */
export class TwingCacheNull implements TwingCacheInterface {
    generateKey(_name: string, _className: string): Promise<string> {
        return Promise.resolve('');
    }

    write(_key: string, _content: string): Promise<void> {
        return Promise.resolve();
    }

    load(_key: string): Promise<TwingTemplatesModule> {
        return Promise.resolve(new Map());
    }

    getTimestamp(_key: string): Promise<number> {
        return Promise.resolve(0);
    }
}
