import {isTraversable} from "../../../helpers/is-traversable";
import {iteratorToHash} from "../../../helpers/iterator-to-hash";
import {TwingCallable} from "../../../callable-wrapper";

const phpHttpBuildQuery = require('locutus/php/url/http_build_query');

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
