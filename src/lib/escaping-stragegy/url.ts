import {EscapingStrategyHandler} from "../escaping-strategy";

const phpRawurlencode = require('locutus/php/url/rawurlencode');

export const createUrlEscapingStrategyHandler = (): EscapingStrategyHandler => {
    return phpRawurlencode;
};
