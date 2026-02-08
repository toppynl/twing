import {isTraversable} from "../../../helpers/is-traversable";
import {iteratorToHash} from "../../../helpers/iterator-to-hash";
import {TwingCallable, TwingSynchronousCallable} from "../../../callable-wrapper";

import phpHttpBuildQuery from "locutus/php/url/http_build_query";

/**
 * URL encodes (RFC 3986) a string as a path segment or a hash as a query string.
 *
 * @param {string|{}} url A URL or a hash of query parameters
 *
 * @returns {Promise<string>} The URL encoded value
 */
export const url_encode: TwingCallable = (_executionContext, url: string | {}): Promise<string> => {
    if (typeof url !== 'string') {
        if (isTraversable(url)) {
            url = iteratorToHash(url);
        }

        const builtUrl: string = phpHttpBuildQuery(url, '', '&');

        return Promise.resolve(builtUrl.replace(/\+/g, '%20'));
    }

    return Promise.resolve(encodeURIComponent(url));
}

export const urlEncodeSynchronously: TwingSynchronousCallable = (_executionContext, url: string | {}): string => {
    if (typeof url !== 'string') {
        if (isTraversable(url)) {
            url = iteratorToHash(url);
        }

        const builtUrl: string = phpHttpBuildQuery(url, '', '&');

        return builtUrl.replace(/\+/g, '%20');
    }

    return encodeURIComponent(url);
}
