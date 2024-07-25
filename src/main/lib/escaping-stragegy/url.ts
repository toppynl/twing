import {TwingEscapingStrategyHandler} from "../escaping-strategy";

const phpRawurlencode = require('locutus/php/url/rawurlencode');

export const createUrlEscapingStrategyHandler = (): TwingEscapingStrategyHandler => {
    return phpRawurlencode;
};
