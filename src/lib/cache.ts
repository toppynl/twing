import {TwingTemplateNode} from "./node/template";

export interface TwingCache {
    /**await
     * Generates a cache key for the given template hash.
     *
     * @param {string} hash The template hash
     *
     * @return {Promise<string>}
     */
    generateKey: (hash: string) => Promise<string>;

    /**
     * Writes the compiled template to cache.
     *
     * @param {string} key The cache key
     * @param {string} content The template representation as a PHP class
     *
     * @return {Promise<void>}
     */
    write: (key: string, content: TwingTemplateNode) => Promise<void>;

    /**
     * Loads a compiled template from the cache.
     *
     * @param {string} key The cache key
     *
     * @return {Promise<string | null>}
     */
    load: (key: string) => Promise<TwingTemplateNode | null>;

    /**
     * Returns the modification timestamp of a key.
     *
     * @param {string} key The cache key
     *
     * @returns {Promise<number>}
     */
    getTimestamp: (key: string) => Promise<number>;
}
