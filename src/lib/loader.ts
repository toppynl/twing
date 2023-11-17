import type {TwingSource} from "./source";

export interface TwingLoader {
    /**
     * Returns the source context for a given template logical name.
     *
     * @param {string} name The template logical name
     * @param {TwingSource} from The source that initiated the template loading
     *
     * @returns {Promise<TwingSource | string>}
     */
    getSourceContext: (name: string, from: TwingSource | null) => Promise<TwingSource | null>;

    /**
     * Gets the cache key to use for the cache for a given template name.
     *
     * @param {string} name The name of the template to load
     * @param {TwingSource} from The source that initiated the template loading
     *
     * @returns {Promise<string | null>} The cache key
     */
    getCacheKey: (name: string, from: TwingSource | null) => Promise<string | null>;

    /**
     * Returns true if the template is still fresh.
     *
     * @param {string} name The template name
     * @param {number} time Timestamp of the last modification time of the cached template
     * @param {TwingSource} from The source that initiated the template loading
     *
     * @returns {Promise<boolean | null>} true if the template is fresh, false otherwise; null if it does not exist
     *
     * @throws TwingErrorLoader When name is not found
     */
    isFresh: (name: string, time: number, from: TwingSource | null) => Promise<boolean | null>;

    /**
     * Check if we have the source code of a template, given its name.
     *
     * @param {string} name The name of the template to check if we can load
     * @param {TwingSource} from The source that initiated the template loading
     *
     * @returns {Promise<boolean>} If the template source code is handled by this loader or not
     */
    exists: (name: string, from: TwingSource | null) => Promise<boolean>;

    /**
     * Resolve the path of a template, given its name, whatever it means in the context of the loader.
     *
     * @param {string} name The name of the template to resolve
     * @param {TwingSource} from The source that initiated the template loading
     *
     * @returns {Promise<string | null>} The resolved path of the template
     */
    resolve: (name: string, from: TwingSource | null) => Promise<string | null>;
}
